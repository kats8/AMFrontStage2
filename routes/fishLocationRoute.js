const req = require("request");
const express = require("express");
const router = express.Router();

const getFishLocation = (resq) => {
    const https = require('https');
    var str = '';
  
    var options = {
      hostname: 'amlocatapi.us-south.cf.appdomain.cloud',
      port: 443,
      path: '/location',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '1q2w3e4r5t6yu7i8'
      }
    };
  
    callback = function (response) {
  
      response.on('data', function (chunk) {
        str += chunk;
      });
  
      response.on('end', function () {
        resq.send(JSON.parse(str));
      });
    }
  
    var req = https.request(options, callback).end();
  }
  
  router.get("/", function (req, resq) {
    getFishLocation(resq);
  })

module.exports = router;