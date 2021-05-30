let socketId;
let onlineUserArray = [];
let coords = [];

//document ready function including socket functionalitiy for match alerts
$(document).ready(function () {
  document.documentElement.style.setProperty('--alertOpacity', `0`)
  $('#alertInfo').removeClass("hidden");
  console.log('Ready');

  $.get('/socketid', function (res) {
    socketId = res;
  });


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


  socketConnection.on('socketChange', onlineUsers => {
    //can program actions in here for what is to happen when the online users change (eg, redraw of map using new cooardinates)
    //onlineUsers contains the updated array of lat/long coordinates ([lat: xx, long: xx, info: xx])
    onlineUserArray = onlineUsers;
    console.log(onlineUserArray);

    //PROGRAM MAP REDRAW, ETC ACTIONS HERE
    //
    //
    //
    //
    map.remove();
    drawInitialMap(onlineUserArray);    
  });


  //Use this to get array of current online users (eg, for initial map)
  $.get('/getSocketArray', function (res) {
    onlineUserArray = res.array;
    console.log(onlineUserArray);
    drawInitialMap(onlineUserArray);
  })

})

function drawInitialMap(coords) {
  /*
  var coords=
  [
      {"lat":-25,"lon":130,"info":"Dummy User 1"},
      {"lat":-27,"lon":132,"info":"Dummy User 2"},
      {"lat":-24,"lon":127,"info":"Dummy User 3"},
      {"lat":-29,"lon":132,"info":"Dummy User 4"}
  ]*/

  // initialize map with Dummy user locations
  map = L.map('mapDiv').setView(coords[0], 3);

  
  map.eachLayer((layer) => {
    layer.remove();
  });

  // set map tiles source
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    worldCopyJump: false
  }).addTo(map);

  for (var k = 0; k <= coords.length; k++) {
    map.setView(coords[k], 4);
    marker = L.marker(coords[k]).addTo(map).bindPopup("User: " + coords[k].info);
  }
}