
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
    var database = ["cheese", "milk", "bread", "banana"];
    console.log(database);
    for (var i = 0; i < descriptions.length; i++)
    {
        var found = false;
        for (var j = 0; j < database.length; j++) {
            // Cloud vision API sometimes outputs the whole text in one object randomly.
            if ((descriptions[i].toLowerCase().indexOf(database[j])!== -1) && descriptions[i].length < 15) {
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

// call this method after taking the picture
function process(content) {
    // take picture and call this function;
    getData(content, function(data){
        // call api to get descriptions processDescriptions
        // list of strings
        var descriptions = processDescriptions(data);
        // call api to get foods getFoods
        // [{"description" : "", "days" : ""}] 
        var foods = getFoods(descriptions);
        foods = foods.map(function(food){
            var expiringOn = (new Date()).setDate((new Date()).getDate() + food.days);
            return { expiringOn: (new Date()).toLocaleDateString(), description: food.description};
        });
        if (foods.length > 0)
            // [{"description" : "", "expiringOn" : ""}]
            saveNewFoodItems(foods);
    });
}

function renderExpiredList() {
    var storeList = retrieveFoodItems();
    var ul = $('<ul id="list-expired" data-role="listview" data-filter="true" data-filter-placeholder="Search..." data-inset="true"></ul>');
    storeList.forEach(function(element) {
        var li = $('<li><span class="foodName"/>'+ f.description + '</span> <span class="foodExpiring"> ' + f.expiringOn +'</li>');
        ul.append(li);
    });
    $('#list-expired-content').html(ul);
    $('#list-expired-content ul li').on('swipe', function(e){
        var foodName = $($(this).find('span.foodName')[0]).html();
        var expiring = $($(this).find('span.foodExpiring')[0]).html();
        removeElementsFromData(foodName, expiring, function(){});
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
    localStorage.setItem('store', JSON.stringify(arr));
}
    
function retrieveFoodItems() {
    var store = localStorage.getItem('store');
    return store ? JSON.parse(store) : [];
}
// [{"description" : "", "expiringOn" : ""}]
function saveNewFoodItems(items) {
    var store = localStorage.getItem('store');
    store = store ? JSON.stringify(store) : [];
    items.forEach(function(element) {
        store.push(element);   
    });
    setStoreItems(store);
}