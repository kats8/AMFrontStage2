var coords=
[
    {"lat":-25,"lon":130,"info":"Dummy User 1"},
    {"lat":-27,"lon":132,"info":"Dummy User 2"},
    {"lat":-24,"lon":127,"info":"Dummy User 3"},
    {"lat":-29,"lon":132,"info":"Dummy User 4"}
]


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

for(var k=0;k<=coords.length;k++){
    map.setView(coords[k],4);
    marker = L.marker(coords[k]).addTo(map).bindPopup("User: "+coords[k].info);
}