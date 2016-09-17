
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
    for (var i = 0; i < descriptions.length; i++)
    {
        $.ajax("https://api.nal.usda.gov/ndb/search/", {
            data: {
                q:descriptions[i],
                offset:0,
                max:5,
                ds:"Standard Reference",
                api_key:"P2S1DkvEkbS9zN2Q5e2s7Qf3EtkiBKqN14pSFgft"
            },
            async:false,
            method:"GET"
        },function (data) {
            console.log(data);
            if (data.list && data.list.item && data.list.item.length > 0) {
                var arr = [];
                for (var item in data.list.item) {
                    if (item.group.indexOf("Fruit") !== -1 || item.group.indexOf("Vegetables") !== -1) {
                        arr.push(item);
                    }
                }
                if (((arr.length / data.list.item.length) * 100) > 60) 
                {
                    res.push(food);
                }
            }
        });
    }
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
            var expiringOn = (new Date()).setDate((new Date()).date() + food.days);
            return { expiringOn: (new Date()).toLocaleDateString(), description: food.description};
        });
        if (foods.length > 0)
            saveNewFoodItems(foods);
    });
}

function renderExpiredList() {
    var foods = retrieveFoodItems();
    var ul = $('ul');
    food.map(function(f){
        var diff = currentDate.data() - (new Date()).setDate(f.expiringOn);
        var li = $('<li><span class="foodName"/>'+ f.description + '<span> </span> <span class="foodExpiring"> ' + f.expiringOn +'</li>');
        ul.append(li);
    });
    $('#listing').html(ul);
    $('#listing ul li').on('swipe', function(e){
        var foodName = $($(this).find('span.foodName')[0]).html();
        var expiring = $($(this).find('span.foodExpiring')[0]).html();
        removeElementsFromData(foodName,expiring);
        render();
    });
}

function removeElementsFromData(foodName, foodExpiring) {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('DELETE FROM FOOD WHERE name=? and expiring?', [foodName, foodExpiring], function (tx, result) {
            console.log(result);
        }, function (error) {
            console.log(error);
        });
    });
}
    
function retrieveFoodItems() {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM FOOD', [], function (tx, result) {
            console.log(result);
        }, function (error) {
            console.log(error);
        });
    });
}

function saveNewFoodItems(items) {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx, items) {
        for(var i = 0; i < items.length; i++) {
            tx.executeSql('INSERT INTO FOOD (name, expiring) VALUES (?, ?)', [items[i].name, item[i].expiring], function (tx, result) {
                console.log(result);
            }, function (error) {
                console.log(error);
            });
        }
    });
}
    
function createDatabase() {
    var db =  window.openDatabase("dbtasty", 1, "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS FOOD (name, expiring)',function (tx, result) {
            console.log(result);
        }, function (error) {
            console.log(error);
        });
    });
}