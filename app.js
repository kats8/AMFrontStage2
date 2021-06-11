require('dotenv/config'); //load the config file env, can be used by calling process.env.{variableName} 
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//required for sockets
const http = require('http').createServer(app);
const io = require('socket.io')(http);
let userSocket;
let onlineUsers = [];

//route requires
const classifierRoute = require('./routes/classifierRoute.js')
const fishMatchRoute = require('./routes/fishMatchRoute.js')(io)
const uploadRoute = require('./routes/uploadRoute.js')
const fishLocationRoute = require('./routes/fishLocationRoute.js')

//routes
app.use('/classifyURL', classifierRoute);
app.use('/checkFishMatch', fishMatchRoute);
app.use('/uploadPicture', uploadRoute);
app.use("/getAll", fishLocationRoute);

var port = process.env.PORT || 8088;

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('user connected');
  userSocket = socket.id;
  console.log('user connected on: ' + userSocket)
  socket.on('disconnect', () => {
    console.log('user disconnected from ' + socket.id);
    for (var i = 0; i < onlineUsers.length; i++) {
      if (onlineUsers[i].socket === socket.id) {
        console.log('Removed ' + onlineUsers[i].socket);
        onlineUsers.splice(i, 1);
        i--;
      }
    }
    console.log(onlineUsers);
    io.emit('socketChange', onlineUsers);
  });

});


app.get('/getSocketArray', function (req, res) {
  // io.emit('socketChange', onlineUsers);
  res.send({ array: onlineUsers });
});

//endpoint to give client their socketId
app.get('/socketid', function (req, res) {
  let userLat = "";
  let userLong = "";
  let userInfo = "unknown";
  let ttl = 10000;

  //will add user to server list using socket and location and advise user of their socketID
  try {
    userLat = req.query.lat;
    userLong = req.query.long;
    userInfo = req.query.user;
  }

  catch (e) {
    console.log(e);
  }

  let newUser =
  {
    lat: userLat,
    lon: userLong,
    socket: userSocket,
    user: userInfo,
    ttl: ttl
  }
  onlineUsers.push(newUser);
  console.log(onlineUsers);
  res.send(userSocket);
  io.emit('socketChange', onlineUsers);
});

//heartbeat/poll to only keep live browsers
app.get('/heartbeat', function (req, res) {
  //update ttl for socket
  let inSocket = req.query.socket;
//  console.log(inSocket);
  for (var i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].socket == inSocket) {
      onlineUsers[i].ttl = 4000;
    }
  }
  io.emit('socketChange', onlineUsers);
  res.send("success");
});

//reduce socket TTL every second and disconnect any unresponsive sockets
setInterval(() => {
  for (var i = 0; i < onlineUsers.length; i++) {
    onlineUsers[i].ttl = onlineUsers[i].ttl - 1000;
    //if time to live now zero or less...
    if (onlineUsers[i].ttl <= 0) {
      let deadSocket = onlineUsers[i].socket;
      console.log("socket time out " + deadSocket);
      // (onlineUsers[i].socket).emit('disconnect');
      io.emit('disconnected ', deadSocket)
      //remove this user from list
      onlineUsers.splice(i, 1);
      i--;
      console.log(onlineUsers);
      io.emit('socketChange', onlineUsers);
    }
  }
  io.emit('socketChange', onlineUsers);
  console.log(onlineUsers);
}, 1000);

http.listen(port);
console.log("Listening on port ", port);
