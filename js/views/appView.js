/*global Backbone */
var app = app || {};

(function($) {

app.AppView = Backbone.View.extend({

    el: '#main',
    initialize: function() {
        var fooditem;
        var records;
        app.foodCollection.on('add', this.renderFood, this);
      //  app.foodCollection.on('reset', this.addAll, this);
      //  app.foodCollection.fetch();

    },
    events: {

        'click #add-food': 'renderFood',
        'keyup #user-input': 'autosearch'
    },

    autosearch: function() {

        $("#user-input").autocomplete({
            delay: 100,
            source: function(request, response) {

                // Suggest URL
                var suggestURL = "https://api.nutritionix.com/v1_1/search/%QUERY?results=0:10&fields=item_name,brand_name,item_id,nf_calories&appId=41324021&appKey=b16be109bec67fb1282c4b4559e8666f";
                suggestURL = suggestURL.replace('%QUERY', request.term);

                // JSONP Request
                $.ajax({
                    method: 'GET',
                    dataType: 'json',
                    url: suggestURL,
                    data: JSON.stringify({
                        item_name: "",
                        brand_name: "",
                        id: "",
                        calories: ""

                    }),
                    success: function(data) {

                        if (data.hits.length != 0) {
                            for (i = 0; i < data.hits.length; i++) {
                                response($.map(data.hits, function(item) {

                                    return {
                                        value: item.fields.item_name,
                                        item_name: item.fields.item_name,
                                        id: item.fields.item_id,
                                        brand_name: item.fields.brand_name,
                                        calories: item.fields.nf_calories

                                    }
                                }));

                            }
                        } else {
                            response([]);
                        }


                    },
                    error: function() {
                        alert("Oops, something went wrong!");
                    },

                })

            },
            select: function(event, ui) {

                records = ui.item;


            }

        });

    },
    /* End of Autocomplete search */
   /* addAll: function() {

        app.foodCollection.each(this.addRecords, this);

    },*/

    renderFood: function() {

        app.foodCollection.create(this.newAttributes());
        console.log(app.foodCollection);
        var view = new app.FoodRecords({ model: records });
        $('#foodRecords').append(view.render().el);

    },

    newAttributes: function() {
        return {
            item_name: records.item_name,
            brand_name: records.brand_name,
            calories: records.calories,
            id: records.id

        }
    }
});

})(jQuery);
