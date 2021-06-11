require("dotenv/config"); //load the config file env, can be used by calling process.env.{variableName}

//required for bucket upload
const ibm = require('ibm-cos-sdk');
let currentImageId = "";

const config = {
  endpoint: 's3.au-syd.cloud-object-storage.appdomain.cloud',
  apiKeyId: process.env.API_KEY,
  serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/a45d044e68ff4d7a812125bc0a386c6a:72454b77-1720-42da-992d-3cb09d66a1db:bucket:cloud-object-storage-fish-images',
  region: 'au-syd',
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS
};
const myBucket = 'cloud-object-storage-fish-images';

const cos = new ibm.S3(config);

const imageUploader = function () {

  const multer = require('multer');
  const multerS3 = require('multer-s3');
  const upload = multer({
    storage: multerS3({
      s3: cos,
      bucket: myBucket,
      key: function (req, file, cb) {
        console.log(file);
        currentImageId = (String(Math.floor(Math.random() * 99999))) + file.originalname;
        cb(null, currentImageId);
      }
    })

  });

  return {
    upload: upload,
    imageID: currentImageId
  };
}

module.exports = {
  imageUploader: imageUploader
};