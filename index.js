require("dotenv").config();
const express = require("express");
const multer = require("multer");
const uploadController = require("./controllers/uploadController");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

// Multer configuration for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

// Route for file upload
app.post("/upload", upload.single("file"), uploadController.processUpload);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
