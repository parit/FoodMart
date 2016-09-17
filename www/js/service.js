
function getData(content) {
    var CV_URL = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDICKCdc31gkFfpIwtT4XmKE5ADabCbkjw";
    //content = 'data:image/jpeg;base64'+content;

    var request = {requests: 
                   [{image: {
                       content: content
                    }, features: 
                     [{type: "TEXT_DETECTION",
                         maxResults: 10}]
                    }
                   ]
                  };
    
    var cont = JSON.stringify(request);
    
    $.ajax({url: CV_URL, data: cont, method:"POST", headers:{
        "Content-Length":cont.length,
        "Content-Type":"application/json"
    }}).fail(function(jqXHR, textStatus, errorThrown) {
        console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
    }).done(function(data){
        console.log(data);
    });
}