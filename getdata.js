require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "file.pdf");
const file = fs.readFileSync(filePath);

const apiKey = process.env.ONEAI_API;
console.log(apiKey);
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

try {
  (async () => {
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
    console.log(JSON.stringify(result));
  })();
} catch (error) {
  console.log(error);
}
