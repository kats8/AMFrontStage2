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
  console.log('user connected on: '+userSocket)
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
    console.log('broadcast change '+onlineUsers);
  });

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

http.listen(port);
console.log("Listening on port ", port);
