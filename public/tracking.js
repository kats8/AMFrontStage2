// position we will use later
// var lat = 40.73;
// var lon = -74.00;
// var coords=[];
var coords=[{"lat":-33.871558,"lon":151.243445,"info":"Dummy Fish 1"},{"lat":-34.861812,"lon":154.2463330,"info":"Dummy Fish 2"}]

// initialize map
map = L.map('mapDiv').setView(coords[0], 5);

// set map tiles source
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 16,
}).addTo(map);


// add marker to the map // and // add popup to the marker //uncomment that code for showing markers
// for(i=0;i<coords.length;i++){
//   marker = L.marker(coords[i]).addTo(map).bindPopup(coords[i].info);   
// }
// console.log(marker);