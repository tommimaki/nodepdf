require("dotenv").config();
const { extractData, writeDataToExcel } = require("../utils/utils");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const processUpload = async (req, res) => {
  console.log("running");

  try {
    const apiKey = process.env.ONEAI_API;

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const file = fs.readFileSync(filePath);

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
      data: file,
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
    // console.log(JSON.stringify(result));
    let text = JSON.stringify(result);

    // Call the extractData function with the extracted text and keywords
    const buildingsData = extractData(
      text,
      req.body.apartmentFormat,
      req.body.floorRange
      //   specialFloors // Update with your special floors variable
    );

    // Specify the output file path
    const outputFile = path.join(__dirname, "output.xlsx");

    // Call the writeDataToExcel function with the extracted data and output file path
    writeDataToExcel(buildingsData, outputFile);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred during file upload.");
  }
};

module.exports = { processUpload };
