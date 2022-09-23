require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { s3Uploadv2, s3Uploadv3 } = require("./s3Service");
const uuid = require("uuid").v4;
const app = express();


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image" || "video") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// ["image", "jpeg"]

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 20 }, //limit of uploading file is 20 for now at once , if wanna increase just change the number 20 to what you want.
});


app.post("/upload", upload.array("file"), async (req, res) => {
  try {
    const results = await s3Uploadv3(req.files);
    console.log(results);
    return res.json({ status: "success", data :  results });
  } catch (err) {
    console.log(err);
  }
});
// let files = req.files
// if (files && files.length > 0) {
//     let URL = await uploadFile(files[0])
//     res.status(201).send({ status : true, msg: " file uploaded succesfully", data: URL })
// }
// else {
//     res.status(400).send({ msg: "No file found" })
// }
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image or video",
      });
    }
  }
});

app.listen(3000, () => console.log("listening on port 3000"));
