
function getData(content) {
    var CV_URL = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDICKCdc31gkFfpIwtT4XmKE5ADabCbkjw";
    var content = event.target.result.replace('data:image/jpeg;base64', '');

    var request = {
        requests: [{
        image: {
            content: content
        },
        features: [{
                type: "TEXT_DETECTION",
                maxResults: 200
            }]
        }]
    };

    $.post({
        url: CV_URL,
        data: JSON.stringify(request),
        crossDomain: true,
        contentType: 'application/json'
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
    }).done(function(data){
        console.log(data);
    });
};