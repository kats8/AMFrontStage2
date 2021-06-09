require("dotenv/config"); //load the config file env, can be used by calling process.env.{variableName}
const req = require("request");
const express = require("express");
const router = express.Router();
var Controller = require("../controllers/uploadController.js");

router.post('/', Controller.imageUploader().upload.array('fishPic', 1), function (req, res, next) {
    res.send('https://s3.au-syd.cloud-object-storage.appdomain.cloud/cloud-object-storage-fish-images/' + res.req.files[0].key);
  });

  module.exports = router;