//allows path manipulation cross-platform
//const path = require("path");
const cors = require("cors");
const req = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const urlRemoteVR = 'https://us-south.functions.appdomain.cloud/api/v1/web/Katrina.Steen%40gmail.com_dev/default/AM%20Fish%20Analysis'


/*
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Angler_User:89CL735AU@sit725.63pic.mongodb.net/AM_Fish?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });
//variable used for MongoDB collection of fish and regulations
let fishes;
client.connect(err => {
  fishes = client.db("AM_Fish").collection("FishRegs");
  console.log("Connected to database");
  //    client.close();
});

//used for manual VR connection (backup - PAAS)
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const vrKey = 'nldt-7z9STbvStrJW26QC6fimSW-8puxcT1ZGuF-uQc7';

const visualRecognition = new VisualRecognitionV3({
  version: '2021-03-02',
  authenticator: new IamAuthenticator({
    apikey: vrKey,
  }),
  serviceUrl: 'https://api.us-south.visual-recognition.watson.cloud.ibm.com/instances/9158b148-831f-4191-8a16-55056c16874b',
});*/

const app = express();
app.use(cors());

//to allow use of POST
//app.use(bodyParser.json());

var port = process.env.PORT || 8088;

app.use(express.static(__dirname + '/public'));

//basic test to check functioning
app.get("/displayHello", function (request, response) {
  var user_name = request.query.name;
  response.json("Hello " + user_name + "!");
});

//get request - forwarding API to check if there's an image match for a fish in the database and returns details
app.get('/checkFishMatch', function (request, response) {
  let inBody = request.query.body;
  //link for local testing------ http://localhost:8081/
  //reqObject = "http://localhost:8081/checkFishMatch?body=" + JSON.stringify(inBody);
  //----------
  //cloud API
 reqObject="https://anglermatehub.us-south.cf.appdomain.cloud/checkFishMatch?body="+JSON.stringify(inBody);
  req(reqObject, (err, result) => {
    if (err) { return console.log(err); }
    console.log(result.body)
    response.send(result.body);
  });
});


app.get("/classifyURL", function (request, response) {
  let imageURL = request.query.url;
  console.log(imageURL)
  //(for shortcut straight to cloud FAAS (testing): reqObject = urlRemoteVR+"?url="+imageURL;
  //local testing via local machine: reqObject = "http://localhost:8081/classifyURL?url="+imageURL;
  //-------------
  //reqObject = "http://localhost:8081/classifyURL?url="+imageURL;
  reqObject = "https://anglermatehub.us-south.cf.appdomain.cloud/classifyURL?url=" + imageURL;

  req(reqObject, (err, result) => {
    if (err) { return console.log(err); }
    console.log(result.body)
    response.send(result.body);
  });
});


app.listen(port);
console.log("Listening on port ", port);