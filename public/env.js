$(document).ready(function(){
    console.log('Ready');
  
 
    $('#btnName').click(()=>{
      
      let name=$('#nameBox').val();
      let data = {
        name: name
      }
      //"http://localhost:8080/displayHello
      $.get('/displayHello', data, function(result){
        console.log('Name has returned:'+ result)
        $('#result').val(result);
        alert('got here in name bit');
      })
    })

    

    $('#btnClassify').click(()=>{
      
      let inputURL=$('#nameBox').val();
      let input = {
        url: inputURL
      }
      $.get('/classifyURL', input, function(result){
        var displayResult = jQuery.parseJSON(result);
        $('#result').val(String(displayResult.data));
        $("#urlPic").attr("src", inputURL);
        //alert(result.images[0].classifiers[0].classes[0].class);
        alert(displayResult.data);
        
      })
    })


  })