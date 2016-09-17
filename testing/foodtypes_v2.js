var httpGetAsync = function (foods)
{


    var fruits = [];
    var vegetables = [];
    var meats = [];
    var dairys = [];

    var result = {fruits,vegetables,meats,dairys};

    for (var food in foods){

        $.ajax("https://api.nal.usda.gov/ndb/search/", {
            data: {
                q:food,
                offset:0,
                max:5,
                ds:"Standard Reference",
                api_key:"P2S1DkvEkbS9zN2Q5e2s7Qf3EtkiBKqN14pSFgft"
            },
            async:false,
            method:"GET"
        },function (data) {
            console.log(data);

            for (var item in data.list.item) {
                var farr = [];
                var marr = [];
                var varr = [];
                var darr = [];

                if (item.group.indexOf("Fruit") != -1) {
                    farr.push(item);
                }
                if (item.group.indexOf("Vegetables") !=-1){
                    varr.push(item);
                }
                if (item.group.indexOf("Dairy") != -1){
                    darr.push(item);
                }
                if (item.group.indexOf("Meats") != -1 || item.group.indexOf("Fish") != -1){
                    marr.push(item);
                }
            }
            if (farr.length / data.list.length > 0.6) {
                result.fruits.push(food);
            }
            if (varr.length / data.list.length > 0.6) {
                result.vegetables.push(food);
            }
            if (darr.length / data.list.length > 0.6) {
                result.dairys.push(food);
            }
            if (marr.length / data.list.length > 0.6){
                result.meats.push(food);
            }
        })
    }

    return result;


}

