var remove_duplicate_entries = function(array){
    var arr = {};

    for ( var i=0, len=array.length; i < len; i++ )
        arr[array[i]['description'].toLowerCase() + " " + array[i]["expiringOn"]] = array[i];

    array = new Array();
    for ( var key in arr )
        array.push(arr[key]);

    return array
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}

var food_exp_db = {
    strawberries: 10,
    broccoli: 7,
    banana: 5,
    chicken:5,
    bread: 3,
    milk: 4,
    cheese: 6,
    carrot: 4,
    apple: 7,
    potato: 14,
    egg: 14,
    yoghurt: 7,
    cucumber: 4,
    onion: 21,
    lychee: 5,
    erdbeer: 10,
    schweinswurst: 5,
    zwiebel: 21,
    milch: 4,
    apfel: 7,
    eier: 14,
    karotte: 4,
    brot:3,
    poulet:5
};

var food_db=[];
for (var key in food_exp_db){
    food_db.push(key);
}