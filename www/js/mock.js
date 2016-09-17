
var food_exp_db = {
    strawberries: 10,
    brocolli: 20,
    banana: 5,
    brocolli:10,
    chicken:5,
    bread: 3,
    milk: 4,
    cheese: 6


};

var food_db=[];
for (var key in food_exp_db){
    food_db.push(key);
}

console.log(food_db)