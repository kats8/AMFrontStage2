let socketId;

$(document).ready(function () {
  document.documentElement.style.setProperty('--alertOpacity', `0`)
  $('#alertInfo').removeClass("hidden");
  console.log('Ready');

  $.get('/socketid', function (res) {
    socketId = res
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