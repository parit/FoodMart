
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

    $.mobile.loading( 'show');
    $.ajax({
            url: CV_URL, 
            data: cont, 
            method:"POST", 
            headers: {
                "Content-Length":cont.length,
                "Content-Type":"application/json"
            }}).fail( function(jqXHR, textStatus, errorThrown) {
                console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
                $.mobile.loading( 'hide');
            }).done(function(data){
                console.log(data);
                callback(data);
                $.mobile.loading( 'hide');
            });
}

function processDescriptions(data) 
{
    var alreadyConsideredIndexes = [];
    var descriptions = [];
    var textAnnotations = data.responses[0].textAnnotations; 

/*    var prev;
    var str = [];
    for (var i = 0; i < textAnnotations.length; i++) {
        if (i === 0) {
            prev = textAnnotations[i];
            str.push(textAnnotations[i].description);
        } else {
            var current = textAnnotations[i];
            var diff = Math.abs(prev.boundingPoly.vertices[0].y - current.boundingPoly.vertices[0].y);
            if (diff < 10) {
                str.push(current.description)
            } else {
                descriptions.push(str.join(' '));
                prev=current
                str = [prev.description];
            }
        }
    }
    if (str.length > 0) {
        descriptions.push(str.join(' '));
    }    */
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
    console.log(food_db);
    for (var i = 0; i < descriptions.length; i++)
    {
        var found = false;
        for (var j = 0; j < food_db.length; j++) {
            // Cloud vision API sometimes outputs the whole text in one object randomly.
            if ((descriptions[i].toLowerCase().indexOf(food_db[j])!== -1) && descriptions[i].length < 15) {
                found = true;
                console.log(descriptions[i]);
                break;
            }
        }
        if (found) {
            res.push(descriptions[i]);
        }
    }
    return res.map(function(el){
        return {"description" : el, "days" : 5}
    });
}

function getFoodsAccurate(descriptions, callback) {
    // call api and filter foods
    var res = [];
    console.log(food_exp_db);
    for (var i = 0; i < descriptions.length; i++) {
        var found = false;
        for (var key in food_exp_db) {
            // Cloud vision API sometimes outputs the whole text in one object randomly.
            if ((descriptions[i].toLowerCase().indexOf(key) !== -1) && descriptions[i].length < 15) {
                found = true;
                console.log(descriptions[i]);
                break;
            }

        }

        if (found) {
            console.log(food_exp_db[key]);
            res.push({"description":capitalizeFirstLetter(descriptions[i]), "days":food_exp_db[key]});
        }
    }

    return res
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function sortFood(food_list){
    food_list.sort(function(a, b){
        var keyA = new Date(a.expiringOn);
        var keyB = new Date(b.expiringOn);
        if(keyA < keyB) return -1;
        if(keyA > keyB) return 1;
        return 0;
    });
}

// call this method after taking the picture
function process(content) {
    // take picture and call this function;
    $.mobile.loading( 'show', { theme: "b", text: "foo", textonly: true });
    getData(content, function(data){
        // call api to get descriptions processDescriptions
        // list of strings
        var descriptions = processDescriptions(data);
        // call api to get foods getFoods
        // [{"description" : "", "days" : ""}] 
        var foods = getFoodsAccurate(descriptions);

        foods = foods.map(function(food){
            var expiringOn = addDays((new Date()).setDate((new Date()).getDate()), food.days);
            var expiringOn = expiringOn.toLocaleDateString('en-GB', {
                day : 'numeric',
                month : 'short',
                year : 'numeric'
            }).split(' ').join('-');
            return { expiringOn: expiringOn.toLocaleString(), description: food.description};
        });

        sortFood(foods)


        if (foods.length > 0)
            // [{"description" : "", "expiringOn" : ""}]
            saveNewFoodItems(foods);
    });
}

function renderExpiredList() {
    var storeList = retrieveFoodItems();
    var ul = $('#list-expired');
    ul.html('');
    storeList.forEach(function(element) {
        ul.append($('<li><span class="foodName">'+ element.description + '</span> <span class="foodExpiring" style="float:right"> ' + element.expiringOn +'</li>'));
    });
    
    if (ul.hasClass('ui-listview')) {
        ul.listview('refresh');    
    }
    
    $('#list-expired-content ul li').on('swipe', function(e){
        var foodName = $(this).find('span.foodName').html();
        var expiring = $(this).find('span.foodExpiring').html();
        removeElementsFromData(foodName.trim(), expiring.trim(), function(){});
        renderExpiredList();
    });
}

function removeElementsFromData(foodName, foodExpiring) 
{
    var arr = [];
    var store = retrieveFoodItems();
    store.forEach(function(element){
        if (element.description !== foodName || element.expiringOn !== foodExpiring)
                arr.push(element);
    });
    setStoreItems(arr);
}

function setStoreItems(arr) {
    arr = remove_duplicate_entries(arr);
    localStorage.setItem('store', JSON.stringify(arr));
    var count_el = $('#count_items');
    count_el.html(arr.length);
}
    
function retrieveFoodItems() {
    var store = localStorage.getItem('store');
    return store ? JSON.parse(store) : [];
}
// [{"description" : "", "expiringOn" : ""}]
function saveNewFoodItems(items) {
    var store = localStorage.getItem('store');
    store = store ? JSON.parse(store) : [];
    items.forEach(function(element) {
        store.push(element);   
    });
    sortFood(store)
    setStoreItems(store);
}