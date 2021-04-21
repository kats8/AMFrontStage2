$(document).ready(function () {
  console.log('Ready');

  $('#btnClassify').click(() => {

    let inputURL = $('#urlBox').val();
    let input = {
      url: inputURL
    }
    $.get('/classifyURL', input, function (result) {
      var imageResult = jQuery.parseJSON(result);
     // $('#textInfo').html(imageResult.body[0].class);
      $('#urlPic').attr("src", inputURL);
      //trying the remote way
      //DO THIS IN A MINUTE
      $.get("/checkFishMatch", imageResult, function (matchData) {
        if (matchData.fishMatch) {
        $('#textInfo').html(matchData.info)
        }
        else {
          $('#textInfo').html("Looks like a "+imageResult.body[0].class+ ", but we couldn't match it with a fish species on our database. More species are coming soon!");

        }
      })

      //alert(result.images[0].classifiers[0].classes[0].class);        
    })
  })

})