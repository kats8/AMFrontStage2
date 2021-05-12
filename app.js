const cors = require("cors");
const req = require("request");
const express = require("express");
<<<<<<< HEAD
//const bodyParser = require("body-parser");
//url for cloud function (accesses 3rd party VR services)
const urlRemoteVR = 'https://us-south.functions.appdomain.cloud/api/v1/web/Katrina.Steen%40gmail.com_dev/default/AM%20Fish%20Analysis'

=======
const bodyParser = require("body-parser");
>>>>>>> f371b8917291b2420963da3379413787e06146aa
const app = express();
app.use(cors());
let userSocket;

//required for sockets
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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

//endpoint to give client their socketId
app.get('/socketid', function (req, res) {
  res.send(userSocket)
});

//get request - forwarding API to check if there's an image match for a fish in the database and returns details
app.get('/checkFishMatch', function (request, response) {
  let inBody = request.query.body;
 // let theSocket = userSocket;
  //link for local testing (http://localhost:8081/) ------
  //reqObject = "http://localhost:8081/checkFishMatch?body=" + JSON.stringify(inBody);
  //----------
  //access via cloud (PAAS)
  reqObject = "https://anglermatehub.us-south.cf.appdomain.cloud/checkFishMatch?body=" + JSON.stringify(inBody);
  req(reqObject, (err, result) => {
    try {
      let matchData = JSON.parse(result.body);
      let theSocket = request.query.socket;

      if (matchData.fishMatch) {
        const match = {
          fish: matchData.fish,
          lat: null,
          long: null,
          socket: theSocket
        }
        io.emit('matchFound', match);
        console.log('match is found');
      } else {
        console.log('match is not found');
      }
      console.log(matchData.fishMatch);
    } catch (e) {
      console.log(e);
    }

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

http.listen(port);
console.log("Listening on port ", port);