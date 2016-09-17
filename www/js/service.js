
function getData(content) {
    var CV_URL = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDICKCdc31gkFfpIwtT4XmKE5ADabCbkjw";
 
    var request = {
                    requests: 
                        [{image: {
                            content: content
                        }, features: 
                            [
                                {type: "TEXT_DETECTION", maxResults: 10}
                            ]
                        }]
                  };
    
    var cont = JSON.stringify(request);
    
    $.ajax({
            url: CV_URL, 
            data: cont, 
            method:"POST", 
            headers: {
                "Content-Length":cont.length,
                "Content-Type":"application/json"
            }}).fail( function(jqXHR, textStatus, errorThrown) {
                console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
            }).done(function(data){
                console.log(data);
            });
}

function processDescriptions(response) 
{
    var alreadyConsideredIndexes = [];
    var descriptions = [];
    var textAnnotations = responses[0].textAnnotations; 

    for (var i = 0; i < textAnnotations.length; i++) {
        var description = [textAnnotations.description];
        for (var j = i + 1; j < textAnnotations.length; j++) {
            if (alreadyConsideredIndexes.indexOf(j) == -1) 
            {
                var diff = Math.abs(textAnnotations[i].boundingPoly.vertices[0].y);
                if (diff < 4) 
                {
                    description.push(textAnnotations[j].description);
                    alreadyConsideredIndexes.push(j);
                }
            }
        }
        descriptions.push(description.join(' '));
    }
    return descriptions;
}

function getFoods(descriptions, callback) {
    // call api and filter foods
   for (var i = 0; i < descriptions; i++) {
    alert(descriptions[i]);
    //Do something
   }
    
}

// call this method after taking the picture
function process(content) {
    // take picture and call this function;
    getData(content, function(data){
        // call api to get descriptions processDescriptions
        var descriptions = processDescriptions(data);
        // call api to get foods getFoods
        getFoods(descriptions, function(data){
            var foods = [];
            foods = foods.map(function(food){
                var expiringOn = (new Date()).setDate((new Date()).date() + food.days);
                return { expiringOn: (new Date()).toLocaleDateString(), description: food.description};
            });

            saveNewFoodItems(foods);

            // call render based on whats in the store
        });
    });
}

function render(foods) {
    retrieveFoodItems();
}

    
function retrieveFoodItems(item) {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM FOOD', [], function (tx, result) {
                console.log(result);
                
        }, function (error) {
            console.log(error);
        });
        });
}

function saveNewFoodItems(item) {
        db.transaction(function (tx) {
            tx.executeSql('INSERT INTO FOOD (name, quantity) VALUES (?, ?)', [item.name, item.quantity], function (tx, result) {
                console.log(result);
        }, function (error) {
            console.log(error);
        });
        });
}
    
function 

function createDatabase() {
        ver db = openD
        db.transaction(function (tx) {
         tx.executeSql('CREATE TABLE IF NOT EXISTS FOOD (id unique, name, quantity)',function (tx, result) {
                console.log(result);
        }, function (error) {
            console.log(error);
        });
        });    
}