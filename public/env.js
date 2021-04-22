let urlRemoteVR = 'https://us-south.functions.appdomain.cloud/api/v1/web/Katrina.Steen%40gmail.com_dev/default/AM%20Fish%20Analysis'

$(document).ready(function () {
  console.log('Ready');

  $('#btnClassify').click(() => {
    let imageResult;
    let inputURL = $('#urlBox').val();
    let input = {
      url: inputURL
    }
    let textString ="";

    //using the cloud function (FAAS) to get meaningful AI recognition data
    $.get(urlRemoteVR, input, function (result) {
      imageResult = result;
      $('#urlPic').attr("src", inputURL);
      //alert(result.images[0].classifiers[0].classes[0].class); 
      //alert(imageResult[0].class);

    }).then(result => $.get("/checkFishMatch", { body: result }, function (matchInfo) {
      matchData = jQuery.parseJSON(matchInfo);
      if (matchData.fishMatch) {
        textString += `<b> ${matchData.fish} </b>`;
        textString += `<p>${matchData.info}</p>`;
      }
      else {
        textString = "Looks like a " + imageResult[0].class + ", but we couldn't match it with a fish species on our database. More species are coming soon!"
     // alert(matchData);
      }
      //if Noxious, add highlighted notice.
      if (matchData.noxious){
textString += `<p><b><font color="red">[Noxious]</font></b></p>`
      }
      //if Protected, add highlighted notice
      if (matchData.protected){
        textString += `<p><b>font color="red">[Protected]</font></b></p>`
      }
      $('#textInfo').html(textString);

    }))
      .catch(function () {
        $('#textInfo').html("We couldn't find a valid image at that url");
      });
  }).catch(function () {
    $('#textInfo').html("We couldn't find a valid image at that url");
  });
})

 //const getImageData = doSomething().then(successCallback, failureCallback);
/*
doSomething()
.then(result => doSomethingElse(result))
.then(newResult => doThirdThing(newResult))
.then(finalResult => {
  console.log(`Got the final result: ${finalResult}`);
})
.catch(failureCallback);
*/
