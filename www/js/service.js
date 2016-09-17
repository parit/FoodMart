
function getData(content, callback) {
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
                callback(data);
            });
}

function processDescriptions(data) 
{
    var alreadyConsideredIndexes = [];
    var descriptions = [];
    var textAnnotations = data.responses[0].textAnnotations; 

    for (var i = 0; i < textAnnotations.length; i++) {
        var description = [textAnnotations[i].description];
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
    var res = [];
    var found = false;



    var database = ["cheese", "milk", "bread", "banana"];
    console.log(database);


    for (var i = 0; i < descriptions.length; i++)
    {
        for (var j = 0; j < database.length; j++) {
            // Cloud vision API sometimes outputs the whole text in one object randomly.
            if ((descriptions[i].toLowerCase().indexOf(database[j])!== -1) && descriptions[i].length<15) {
                found = true;
                console.log(descriptions[i]);
                break;
            }
        }
        if (found) {
            res.push(descriptions[i]);
        }
    }   

    // for (var i = 0; i < descriptions.length; i++)
    // {
    //     $.ajax("https://api.nal.usda.gov/ndb/search/", {
    //         data: {
    //             q:descriptions[i],
    //             offset:0,
    //             max:5,
    //             ds:"Standard Reference",
    //             api_key:"P2S1DkvEkbS9zN2Q5e2s7Qf3EtkiBKqN14pSFgft"
    //         },
    //         async:false,
    //         method:"GET"
    //     },function (data) {
    //         console.log(data);
    //         if (data.list && data.list.item && data.list.item.length > 0) {
    //             var arr = [];
    //             for (var item in data.list.item) {
    //                 if (item.group.indexOf("Fruit") !== -1 || item.group.indexOf("Vegetables") !== -1) {
    //                     arr.push(item);
    //                 }
    //             }
    //             if (((arr.length / data.list.item.length) * 100) > 60) 
    //             {
    //                 res.push(food);
    //             }
    //         }
    //     });
    // }
    return res.map(function(el){
        return {"description" : el, "days" : 5}
    });
}

// call this method after taking the picture
function process(content) {
    // take picture and call this function;
    getData(content, function(data){
        // call api to get descriptions processDescriptions
        var descriptions = processDescriptions(data);
        // call api to get foods getFoods
        var foods = getFoods(descriptions);
        foods = foods.map(function(food){
            var expiringOn = (new Date()).setDate((new Date()).getDate() + food.days);
            return { expiringOn: (new Date()).toLocaleDateString(), description: food.description};
        });
        if (foods.length > 0)
            saveNewFoodItems(foods);
    });
}

function renderExpiredList() {
    retrieveFoodItems(function(food) {
        var ul = $('<ul id="list-expired" data-role="listview" data-filter="true" data-filter-placeholder="Search..." data-inset="true"></ul>')
        food.map(function(f){
            var li = $('<li><span class="foodName"/>'+ f.name + '</span> <span class="foodExpiring"> ' + f.expiring +'</li>');
            ul.append(li);
        });
        $('#list-expired-content').html(ul);
        $('#list-expired-content ul li').on('swipe', function(e){
            var foodName = $($(this).find('span.foodName')[0]).html();
            var expiring = $($(this).find('span.foodExpiring')[0]).html();
            removeElementsFromData(foodName, expiring, function(){});
            render();
        });
    }); 
}

function removeElementsFromData(foodName, foodExpiring, callback) {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('DELETE FROM FOOD WHERE name=? and expiring=?', [foodName, foodExpiring], 
        function (tx, result) {
            console.log(result.rows);
            callback(result.rows);
        }, dbError);
    });
}
    
function retrieveFoodItems(callback) {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM FOOD', [], 
        function (tx, result) {
            console.log(result.rows);
            var items = new Array();
            for (var i=0; i<result.rows.length; i++){
                items.push(result.rows.item(i));
            }
            callback(items);
        }, dbError);
    });
}

function saveNewFoodItems(items, callback) {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx, items) {
        for(var i = 0; i < items.length; i++) {
            tx.executeSql('INSERT INTO FOOD (name, expiring) VALUES (?, ?)', [items[i].name, item[i].expiring], 
            function (tx, result) {
                console.log(result);
            }, dbError);
        }
    });
}
    
function createDatabase() {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS FOOD (name, expiring)',
        function (tx, result) {
            console.log(result);
        }, dbError);
    });
}

function dbError(err){
    console.log("QUERY ERROR: " + err.message + "\nCode=" + err.code);
}