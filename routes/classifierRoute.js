
const req = require("request");
const express = require("express");
const router = express.Router();


router.get("/", function (request, response) {
    let imageURL = request.query.url;
    let lat = request.query.lat;
    let long = request.query.long;
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