const cors = require("cors");
const req = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const https = require('https');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let userSocket;
let onlineUsers = [];

//required for sockets
const http = require('http').createServer(app);
const io = require('socket.io')(http);
//to ensure timely tracking of disconnections

//required for bucket upload ***** CHANGE TO ENV VARIABLES

const ibm = require('ibm-cos-sdk');
require('dotenv/config'); //load the config file env, can be used by calling process.env.{variableName} 
let currentImageId = "";

const config = {

  endpoint: 's3.au-syd.cloud-object-storage.appdomain.cloud',
  apiKeyId: 'EiGkr_k8UB2IU2UQrBhWKvVIuAdG4ZELqKrL4X2zrbxD',
  serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/a45d044e68ff4d7a812125bc0a386c6a:72454b77-1720-42da-992d-3cb09d66a1db:bucket:cloud-object-storage-fish-images',
  region: 'au-syd',
  accessKeyId: '062885388f434670965fa4f8ee517172',
  secretAccessKey: 'e50fd1bf0f59192ff4de2bc5667ff7cc9af7d7afd8ceb903'
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
    upload: upload
  };
}


var port = process.env.PORT || 8088;

app.use(express.static(__dirname + '/public'));

//to detect disonnected sockets via refresh or page navigation 
//io.eio.pingTimeout = 10000; // 10 seconds
//io.eio.pingInterval = 3000;  // 3 seconds

io.on('connection', (socket) => {
  console.log('user connected');
  //keep track of socket, as users don’t need updates on own matches
  userSocket = socket.id;
  console.log('user connected on: '+userSocket)
  socket.on('disconnect', () => {
    console.log('user disconnected from ' + socket.id);
    /*
    onlineUsers.forEach((user) => {
      if (user.socket == socket.id) {
       //remove that user from array
       console.log("we think the socket leaving is "+user.socket);
      }
    }); */
    for (var i = 0; i < onlineUsers.length; i++) {

      if (onlineUsers[i].socket === socket.id) {
        console.log('Removed ' + onlineUsers[i].socket);
        onlineUsers.splice(i, 1);
        i--;
      }
    }
    console.log(onlineUsers);
    io.emit('socketChange', onlineUsers);
    console.log('broadcast change '+onlineUsers);
  });
  socket.on('close', () => {
    console.log('user closed from ' + socket.id);
    console.log('got to close: ' + onlineUsers);
  });
});

//basic test to check functioning
app.get("/displayHello", function (request, response) {
  var user_name = request.query.name;
  response.json("Hello " + user_name + "!");
});

app.get('/getSocketArray', function (req, res) {
  res.send({ array: onlineUsers });
});

//endpoint to give client their socketId
app.get('/socketid', function (req, res) {
  //will add user to server list using socket and location and advise user of their socketID
  let userLat = req.query.lat;
  let userLong = req.query.long;
  userInfo = req.query.user;

  let newUser =
  {
    lat: userLat,
    lon: userLong,
    socket: userSocket,
    user: userInfo
  }
  onlineUsers.push(newUser);
  console.log(onlineUsers);
  res.send(userSocket);
  io.emit('socketChange', onlineUsers);
  console.log('broadcast change '+onlineUsers);
});

//get request - forwarding API to check if there's an image match for a fish in the database and returns details
app.get('/checkFishMatch', function (request, response) {
  let inBody = request.query.body;
  let pLat = null;
  let pLong = null;
  // let theSocket = userSocket;
  //link for local testing (http://localhost:8081/) ------
 // reqObject = "http://localhost:8081/checkFishMatch?body=" + JSON.stringify(inBody);
  //----------
  //access via cloud (PAAS)
  reqObject = "https://anglermatehub.us-south.cf.appdomain.cloud/checkFishMatch?body=" + JSON.stringify(inBody);
  req(reqObject, (err, result) => {

    //if true match being returned in response, initiate alert via webserver
    try {
      let matchData = JSON.parse(result.body);
      let theSocket = request.query.socket;
      pLat = request.query.place.lat;
      pLong = request.query.place.long;

      console.log(request.query);

      if (matchData.fishMatch) {
        const match = {
          fish: matchData.fish,
          lat: pLat,
          long: pLong,
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
      //console.log(req.data);
      //console.log(str);
      resq.send(JSON.parse(str));
      // your code here if you want to use the results !
    });
  }

  var req = https.request(options, callback).end();
}


app.get("/getAll", function (req, resq) {
  getFishLocation(resq);
})


http.listen(port);
console.log("Listening on port ", port);

app.post('/uploadPicture', imageUploader().upload.array('fishPic', 1), function (req, res, next) {
  //  app.post('/uploadPicture', upload.array('fishPic', 1), function (req, res, next) {

  res.send('https://s3.au-syd.cloud-object-storage.appdomain.cloud/cloud-object-storage-fish-images/' + currentImageId);
});