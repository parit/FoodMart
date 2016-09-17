
function getData(fileURI) {
    var CV_URL = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDICKCdc31gkFfpIwtT4XmKE5ADabCbkjw";
//    content = content.replace('data:image/jpeg;base64', '');
//
//    var request = {
//        requests: [{
//        image: {
//            content: content
//        },
//        features: [{
//                type: "TEXT_DETECTION",
//                maxResults: 200
//            }]
//        }]
//    };

    
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.params = {features: [{
                type: "TEXT_DETECTION",
                maxResults: 200
            }]
    }; // if we need to send parameters to the server request
    var ft = new FileTransfer();
    ft.upload(fileURI, encodeURI(CV_URL), 
    function() {
        console.log("success");
    }, function(e) {
        console.log("fail" + e);
    }, options);
    
//    $.post({
//        url: CV_URL,
//        data: JSON.stringify(request),
//        crossDomain: true,
//        contentType: 'application/json'
//    }).fail(function(jqXHR, textStatus, errorThrown) {
//        console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
//    }).done(function(data){
//        console.log(data);
//    });
};