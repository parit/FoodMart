
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
    lychee: 5
};

var food_db=[];
for (var key in food_exp_db){
    food_db.push(key);
}

console.log(food_db)