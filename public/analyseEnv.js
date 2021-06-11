let urlRemoteVR = 'https://us-south.functions.appdomain.cloud/api/v1/web/Katrina.Steen%40gmail.com_dev/default/AM%20Fish%20Analysis'
const urlClassify = '/classifyURL';
const checkFishMatch = '/checkFishMatch';
const qMark = 'assets/fishIcon.png';
let socketId;
let position;
let fileURL = "";
let inputURL = "";

setInterval(() => {
  $.get('/heartbeat', { socket: socketId })
  console.log(socketId);
}, 2000);

$(document).ready(function () {
  document.documentElement.style.setProperty('--alertOpacity', `0`)
  $('#alertInfo').removeClass("hidden");
  $('#loadStatus').html("");
  console.log('Ready');


  position = getPreciseLocation()
    .then((result) => {
      const loc = { location: result }
      position = result;
      let input = {
        lat: position.lat,
        long: position.long,
        user: 'Fishing'
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
      console.log('socketId: ' + socketId);
      console.log('match.socket: ' + match.socket);

      document.documentElement.style.setProperty('--alertOpacity', `1`);
      setTimeout(function () { document.documentElement.style.setProperty('--alertOpacity', `0`); }, 4000);

    }
  });
  $('#textInfo').addClass("hidden");
  $('#textInfo').html("");
  $('#loadStatus').html("");

  //Code to upload file once chosen (from browse navigation) ready for matching and clear URL field
  document.getElementById("fishPic").onchange = function () {
    document.getElementById("uploadForm").submit();
    //clear URL box (make clear to user now image is uploaded, any previously entered URL value won't be used for match)
    $('#urlBox').val("");
    $('#loadStatus').html("...loading");
    //disable match button until file loaded
   $( "#btnClassify" ).toggleClass( "disabled" );

 

  };



    document.getElementById('dummyTarget').onload = function() {
      content = document.getElementById('dummyTarget').contentWindow.document.body.innerHTML

      //if has loaded with response, change status to reflect file is loaded
      if (content.length>0){
          $('#loadStatus').html("loaded");
          //re-enable match button
          $( "#btnClassify" ).toggleClass( "disabled" );
      }
  }


  $('#btnClear').click(() => {
    //clear file upload (reset upload form submission) and all input fields
    document.getElementById("uploadForm").reset();
    document.getElementById('dummyTarget').contentWindow.document.body.innerHTML ="";
    $('#urlBox').val("");
    $('#loadStatus').html("");
  })


  $('#btnClassify').click(() => {
    let imageResult;
    //get fileURL from form/file upload result
    fileURL = document.getElementById('dummyTarget').contentWindow.document.body.innerHTML
    //if fileURL not empty, we'll use it for our matching
    if (fileURL.length > 0) {
      $('#urlBox').val(fileURL);
    }
    let inputURL = $('#urlBox').val();
    $('#textInfo').removeClass("hidden");
    //Displays 'please wait' while waiting for responses to be returned
    $('#textInfo').html("Please Wait...");
    $('#urlPic').attr("src", qMark);

    let input = {
      url: inputURL,
      lat: position.lat,
      long: position.long
    }
    let textString = "";
    let classFound = "";

    $.get(urlClassify, input, function (result) {
      $('#urlPic').attr("src", inputURL);
      try {
        imageResult = jQuery.parseJSON(result);
        classFound = imageResult[0].class;
      }
      catch (e) {
        console.log(e);
        $('#textInfo').html("We couldn't find a valid image at that location");
        $('#urlPic').attr("src", qMark);
      }
    }).then(result => $.get("/checkFishMatch", { body: result, socket: socketId, place: position, url: inputURL }, function (matchInfo) {

      let matchData = jQuery.parseJSON(matchInfo);
      //If a fish match was returned, fill in info accordingly
      if (matchData.fishMatch) {
        //if Noxious, add highlighted notice.
        if (matchData.noxious) {
          textString += `<p><b><font color="red">[Noxious]</font></b></p>`
        }
        //if Protected, add highlighted notice
        if (matchData.protected) {
          textString += `<p><b><font color="red">[Protected]</font></b></p>`
        }
        textString += `<b> ${matchData.fish} </b>`;
        textString += `<p>${matchData.info}</p>`;
      }
      else {
        //if no match, did we at least recognise an image object?
        if (imageResult[0].hasOwnProperty('class')) {
          textString = `Looks like a ${classFound}, but doesn't match any aquatic species on our database. More species are coming soon!`;
        }
        else {
          textString = "Couldn't find a valid image at that location.";
          $('#urlPic').attr("src", qMark);
        }
      }
      $('#textInfo').html(textString);
      //ensure form ready for new file upload and old file URL cleared
      document.getElementById("uploadForm").reset();
      document.getElementById('dummyTarget').contentWindow.document.body.innerHTML = "";
      $('#loadStatus').html("");
    })).catch(function () {
      $('#textInfo').html("We couldn't find a valid image at that location.");
      $('#urlPic').attr("src", qMark);
      document.getElementById("uploadForm").reset();
      document.getElementById('dummyTarget').contentWindow.document.body.innerHTML = "";
      $('#loadStatus').html("");
    });
  })
  async function getPreciseLocation() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(function (position) {
        resolve({ lat: position.coords.latitude, long: position.coords.longitude });
      });
    });
  }

})

