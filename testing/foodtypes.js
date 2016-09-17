var httpGetAsync = function (foods)
{

    var res = [];
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
            var arr = [];
            for (var item in data.list.item) {
                if (item.group.indexOf("Fruit") != -1) {
                    arr.push(item);
                }
            }
            if (arr.length / data.list.length > 0.6) {
                res.push(food);
            }
        })
    }

    return res;


}

