require("dotenv").config();
const { extractData, writeDataToExcel } = require("../utils/utils");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const processUpload = async (req, res) => {
  console.log("running");

  let buildingsData = {};

  try {
    const apiKey = process.env.ONEAI_API;

    const files = req.files; // Array of uploaded files

    //for all files we send it to oneai api, that turns it to text
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const filePath = path.join(__dirname, "../uploads", file.filename);
      const fileContent = fs.readFileSync(filePath);

      const pipeline = {
        include_empty_outputs: true,
        input_type: "article",
        steps: [
          {
            skill: "pdf-extract-text",
          },
        ],
        output_type: "json",
        multilingual: {
          enabled: true,
        },
        content_type: "text/pdf",
      };

      const config = {
        method: "POST",
        url:
          "https://api.oneai.com/api/v0/pipeline/async/file?pipeline=" +
          encodeURIComponent(JSON.stringify(pipeline)),
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        data: fileContent,
      };

      const response = await axios(config);
      const polling = new Promise((resolve) => {
        const interval = setInterval(async () => {
          const pollingResponse = await axios.get(
            "https://api.oneai.com/api/v0/pipeline/async/tasks/" +
              response.data.task_id,
            { headers: config.headers }
          );
          if (pollingResponse.data.status !== "RUNNING") {
            resolve(pollingResponse.data.result);
            clearInterval(interval);
          }
        }, 3000);
      });

      const result = await polling;
      let text = JSON.stringify(result);
      console.log(text);

      const fileBuildingsData = extractData(
        text,
        req.body.apartmentFormat,
        req.body.floorRange,
        buildingsData
      );

      for (const building in fileBuildingsData) {
        if (!fileBuildingsData[building]) {
          fileBuildingsData[building] = buildingsData[building];
        } else {
          for (const floor in fileBuildingsData[building]) {
            if (!fileBuildingsData[building][floor]) {
              fileBuildingsData[building][floor] =
                buildingsData[building][floor];
            } else {
              for (const apartment in fileBuildingsData[building][floor]) {
                if (!fileBuildingsData[building][floor][apartment]) {
                  fileBuildingsData[building][floor][apartment] =
                    buildingsData[building][floor][apartment];
                } else {
                  Object.assign(
                    fileBuildingsData[building][floor][apartment],
                    buildingsData[building][floor][apartment]
                  );
                }
              }
            }
            console.log(`Floor: ${floor}`);
            console.log(fileBuildingsData[building][floor]);
          }
        }
      }

      buildingsData = fileBuildingsData;

      fs.unlinkSync(filePath);
    }
    //  Timestamping the output file
    const timestamp = Date.now();
    const outputFileName = `aluejako_${timestamp}.xlsx`;
    const outputFile = path.join(__dirname, outputFileName);

    // filling excel file extracted data  with
    writeDataToExcel(buildingsData, outputFile);

    // Remove the uploaded file

    res.json({ message: "Files processed successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred during file upload.");
  }
};

module.exports = { processUpload };
