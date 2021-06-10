//used to store socket ID for this connection
let socketId;
let position;


var allfishes=[];
var selectmenu=document.getElementById("dropmenu");
var opt=[];
fetch('/getAll').then(response => response.json())
.then((json) => {

  allfishes=json;
  var fishes=[];
  for(var i=0;i<allfishes.length;i++){
    fishes.push(allfishes[i].fish);
  }

  var uniqueSet=new Set(fishes);// console.log(uniqueSet);
  var uniqueFishes=Array.from(uniqueSet);// console.log(uniqueFishes);

  for(var j=0;j<uniqueFishes.length;j++){
    opt=document.createElement("option");
    opt.innerHTML=uniqueFishes[j];
    opt.value=uniqueFishes[j];
    selectmenu.appendChild(opt);
  }
  
  
})
.catch(err => console.log(err));


//var coords=[{"lat":-33.871558,"lon":151.243445,"info":"Dummy Fish 1"},{"lat":-34.861812,"lon":154.2463330,"info":"Dummy Fish 2"}]
var coords=[{"lat":-25,"lon":130,"info":"initialise on Australia"}]


// initialize map and centre on Australia
map = L.map('mapDiv').setView(coords[0], 3);

// set map tiles source
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 16,
  worldCopyJump: false
}).addTo(map);

var marker=[];
function getFishLocation(){
  
  var selectedFishSpecie = $("#dropmenu").children("option:selected").val();
  // console.log(selectedFishSpecie);

var fishcoords=[];
for(j=0;j<=allfishes.length-1;j++){
  fishcoords.push({"lat":allfishes[j].lat,"lon":allfishes[j].long});
  
}
map.eachLayer((layer) => {
  layer.remove();
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 16,
}).addTo(map);

// set map tiles source

  for(var k=0;k<allfishes.length;k++){
    if (selectedFishSpecie == allfishes[k].fish) {
        // console.log(allfishes[k]);
        //set zoom level of map here
       map.setView(fishcoords[0],3.2);// the second parameters of setView function needs the integer number value for zoom level
        marker = L.marker(fishcoords[k]).addTo(map).bindPopup("Species: "+allfishes[k].fish+", Lat: "+allfishes[k].lat+", Lng: "+allfishes[k].long);   
    }
  }
}

//document ready function including socket functionalitiy for match alerts
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
        user: 'Monitoring Species'

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