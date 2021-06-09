
require("dotenv/config"); //load the config file env, can be used by calling process.env.{variableName}
const req = require("request");
const express = require("express");
const router = express.Router();

//get request - forwarding API for checking fish against database and returning details
//router.get("/classifyURL", function (request, response) {

router.get("/", function (request, response) {
    let imageURL = request.query.url;
    let lat = request.query.lat;
    let long = request.query.long;
   // let lat = 25;
    //let long = 150;
    console.log(imageURL)
    console.log(request.query)
  
    //--------------
    //(for shortcut straight to cloud FAAS (testing): reqObject = urlRemoteVR+"?url="+imageURL;
    //local testing via local machine: reqObject = "http://localhost:8081/classifyURL?url="+imageURL+ "&lat="+lat+"&long="+long;
    //reqObject = "http://localhost:8081/classifyURL?url="+imageURL+ "&lat="+lat+"&long="+long;
    //-------------
    reqObject = "https://anglermatehub.us-south.cf.appdomain.cloud/classifyURL?url="+imageURL+ "&lat="+lat+"&long="+long;
  
    req(reqObject, (err, result) => {
      if (err) { return console.log(err); }
      console.log(result.body)
      response.send(result.body);
    });
  });

module.exports = router;