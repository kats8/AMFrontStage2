let urlRemoteVR = 'https://us-south.functions.appdomain.cloud/api/v1/web/Katrina.Steen%40gmail.com_dev/default/AM%20Fish%20Analysis'

$(document).ready(function () {
  console.log('Ready');

  $('#btnClassify').click(() => {
let imageResult;
    let inputURL = $('#urlBox').val();
    let input = {
      url: inputURL
    }
    //old manual way
   // $.get('/classifyURL', input, function (result) {
     //using the cloud function
     $.get(urlRemoteVR, input, function (result) {
       //old way
     // imageResult = jQuery.parseJSON(result);
      imageResult = result;
       //$('#textInfo').html(result.body[0].class);
       $('#urlPic').attr("src", inputURL);
 
       //alert(result.images[0].classifiers[0].classes[0].class); 
       alert(imageResult[0].class);     

       $.get("/checkFishMatch", {body: imageResult}, function (matchData) {
        if (matchData.fishMatch) {
        $('#textInfo').html(matchData.info)
        }
        else {
          $('#textInfo').html("Looks like a "+imageResult[0].class+ ", but we couldn't match it with a fish species on our database. More species are coming soon!");
    
        }
      })   
       
     })



   })
 
 })