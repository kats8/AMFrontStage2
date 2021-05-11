let urlRemoteVR = 'https://us-south.functions.appdomain.cloud/api/v1/web/Katrina.Steen%40gmail.com_dev/default/AM%20Fish%20Analysis'
const urlClassify = '/classifyURL';
const checkFishMatch = '/checkFishMatch';
const qMark = 'assets/fishIcon.png';
let socketId;

$(document).ready(function () {
  console.log('Ready');

  $.get('/socketid', function(res){
    socketId=res
  });


var socketConnection = io.connect();
socketConnection.on('connect', function() {
 // socket = socketConnection.socket.sessionid; //
});

  //to display matches of other users
  socketConnection.on('matchFound', match => {
    //only display if not me
    if (socketId != match.socket) {
      let theString = `Someone just identified a ${match.fish}!`;
      $('#alertInfo').html(theString);
      console.log(theString);
    }
  }); 
  $('#textInfo').addClass("hidden");
  $('#textInfo').html("");

  $('#btnClassify').click(() => {
    let imageResult;
    let inputURL = $('#urlBox').val();
    $('#textInfo').removeClass("hidden");
    //Displays 'please wait' while waiting for responses to be returned
    $('#textInfo').html("Please Wait...");
    $('#urlPic').attr("src", qMark);

    let input = {
      url: inputURL
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
        $('#textInfo').html("We couldn't find a valid image at that URL");
        $('#urlPic').attr("src", qMark);
      }
    }).then(result => $.get("/checkFishMatch", { body: result }, function (matchInfo) {
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
          textString = "Couldn't find a valid image at that URL.";
          $('#urlPic').attr("src", qMark);
        }
      }
      $('#textInfo').html(textString);
    })).catch(function () {
      $('#textInfo').html("We couldn't find a valid image at that URL.");
      $('#urlPic').attr("src", qMark);
    });
  })
})

