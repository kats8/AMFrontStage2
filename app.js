const cors = require("cors");
const req = require("request");
const express = require("express");
const bodyParser = require("body-parser");

//required for sockets
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const app = express();
app.use(cors());

var port = process.env.PORT || 8088;

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  //keep track of socket, as users don’t need updates on own matches
  userSocket = socket.id
  console.log('user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

//basic test to check functioning
app.get("/displayHello", function (request, response) {
  var user_name = request.query.name;
  response.json("Hello " + user_name + "!");
});

//get request - forwarding API to check if there's an image match for a fish in the database and returns details
app.get('/checkFishMatch', function (request, response) {
  let inBody = request.query.body;
  //link for local testing (http://localhost:8081/) ------
  //reqObject = "http://localhost:8081/checkFishMatch?body=" + JSON.stringify(inBody);
  //----------
  //access via cloud (PAAS)
  reqObject = "https://anglermatehub.us-south.cf.appdomain.cloud/checkFishMatch?body=" + JSON.stringify(inBody);
  req(reqObject, (err, result) => {
    if (err) { return console.log(err); }
    console.log(result.body)
    response.send(result.body);
  });
});

//get request - forwarding API for checking fish against database and returning details
app.get("/classifyURL", function (request, response) {
  let imageURL = request.query.url;
  console.log(imageURL)
  //--------------
  //(for shortcut straight to cloud FAAS (testing): reqObject = urlRemoteVR+"?url="+imageURL;
  //local testing via local machine: reqObject = "http://localhost:8081/classifyURL?url="+imageURL;
  //reqObject = "http://localhost:8081/classifyURL?url="+imageURL;
  //-------------
  reqObject = "https://anglermatehub.us-south.cf.appdomain.cloud/classifyURL?url=" + imageURL;

  req(reqObject, (err, result) => {
    if (err) { return console.log(err); }
    console.log(result.body)
    response.send(result.body);
  });
});

app.listen(port);
console.log("Listening on port ", port);