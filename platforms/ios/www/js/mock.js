
var database_obj = {
    strawberries: 10,
    brocolli: 20,
    banana: 5,
    brocolli:10,
    chicken:5,
    bread: 3,
    milk: 4,
    cheese: 6

};

var database=[];
for (var key in database_obj){
    database.push(key);
}

console.log(database)