let socketId;
let onlineUserArray = [];
let coords = [];
let position;
let initialCoord;
let marker = [];

//tell server this socket is still in use
setInterval(() => {
  $.get('/heartbeat', { socket: socketId })
  console.log(socketId);
}, 2000);

//document ready function including socket functionalitiy for match alerts
$(document).ready(function () {
  document.documentElement.style.setProperty('--alertOpacity', `0`)
  $('#alertInfo').removeClass("hidden");
  console.log('Ready');
  //get socket info

  var socketConnection = io.connect();
  socketConnection.on('connect', function () {
  });

  //to display matches of other users
  socketConnection.on('matchFound', match => {

    //only display if not me
    if (socketId != match.socket) {
      let theString = `Someone just identified a ${match.fish}!`;
      $('#alertInfo').html(theString);
      console.log(theString);
      console.log('socketId: ' + socketId);
      console.log('match.socket: ' + match.socket);

      document.documentElement.style.setProperty('--alertOpacity', `1`);
      setTimeout(function () { document.documentElement.style.setProperty('--alertOpacity', `0`); }, 4000);

    }
  });


  position = getPreciseLocation()
    .then((result) => {
      const loc = { location: result }
      position = result;
      let input = {
        socket: socketId,
        lat: position.lat,
        long: position.long,
        user: 'Monitoring Users'

      }
      $.get('/socketid', input, function (res) {
        socketId = res;
      });

    })
    .catch((error) => {
      console.log(error);
    });

  socketConnection.on('socketChange', onlineUsers => {
    //can program actions in here for what is to happen when the online users change (eg, redraw of map using new cooardinates)
    //onlineUsers contains the updated array of lat/long coordinates ([lat: xx, long: xx, info: xx])
    onlineUserArray = onlineUsers;
    //console.log(onlineUserArray);
    //PROGRAM MAP REDRAW, ETC ACTIONS HERE
    drawInitialMap(onlineUserArray);
  });

  socketConnection.on('disconnected', deadSocket => {
    //if kicked off due to inactivity, get back alive
    if (deadSocket == socketId) {
      $.get('/socketid', input, function (res) {
        socketId = res;
      });
    }
  });

  initialCoord = { "lat": -25, "lon": 130, "info": "Dummy User 1" },
    // initialize map with Dummy user location
    map = L.map('mapDiv').setView(initialCoord, 3);
  map.eachLayer((layer) => {
    layer.remove();
  });
  // set map tiles source
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    worldCopyJump: false
  }).addTo(map);

  //Use this to get array of current online users (eg, for initial map)
  $.get('/getSocketArray', function (res) {
    onlineUserArray = res.array;
    console.log(" within getSocketArray");
    console.log(onlineUserArray);
    drawInitialMap(onlineUserArray);
  })

  function drawInitialMap(coords) {
    //clear previous markers
    for(i=0;i<marker.length;i++) {
      map.removeLayer(marker[i]);
      } 

    for (var k = 0; k < coords.length; k++) {
      map.setView(coords[k], 4);
      aMarker = L.marker(coords[k]).addTo(map).bindPopup("User: " + coords[k].user);
      marker.push(aMarker);
      map.addLayer(marker[marker.length-1]);
    }
  }
})

async function getPreciseLocation() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(function (position) {
      resolve({ lat: position.coords.latitude, long: position.coords.longitude });
     reject ({lat: null, long: null});
    });
  });
}