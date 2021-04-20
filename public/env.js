$(document).ready(function(){
    console.log('Ready');

    $('#btnClassify').click(()=>{
      
      let inputURL=$('#urlBox').val();
      let input = {
        url: inputURL
      }
      $.get('/classifyURL', input, function(result){
        var displayResult = jQuery.parseJSON(result);
        $('#textInfo').html(displayResult.data);
        $('#urlPic').attr("src", inputURL);
        //alert(result.images[0].classifiers[0].classes[0].class);        
      })
    })


  })