let socketId;
let position;


$(document).ready(function () {
  document.documentElement.style.setProperty('--alertOpacity', `0`)
  $('#alertInfo').removeClass("hidden");
  console.log('Ready');

/*
    $.get('/socketid', input, function (res) {
      socketId = res
    });
  
    */

    position = getPreciseLocation()
    .then((result) => {
      const loc = { location: result }
      position = result;
      let input = {
        lat: position.lat,
        long: position.long,
        user: 'Online'

      }
      $.get('/socketid', input, function (res) {
        socketId = res
      });
    
    })
    .catch((error) => {
      console.log(error);
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
      console.log('socketId: '+socketId);
      console.log('match.socket: '+match.socket);

      document.documentElement.style.setProperty('--alertOpacity', `1`);
      setTimeout(function(){ document.documentElement.style.setProperty('--alertOpacity', `0`); }, 4000);
       
    }
    
  });
})

async function getPreciseLocation() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(function (position) {
      resolve({ lat: position.coords.latitude, long: position.coords.longitude });
    });
  });
}