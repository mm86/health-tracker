/*global Backbone */
var app = app || {};

(function($) {


app.AppView = Backbone.View.extend({

    el: '#healthtracker',
    template: _.template($('#total-calorie-template').html()),
    initialize: function() {
        var self = this;
        this.input = this.$('#user-input');
        this.servings = $("#servings");
        this.total_calories = 0;
        this.records;
        app.foodCollection.on('add', this.addAll, this);
        app.foodCollection.on('reset', this.addAll, this);
        app.foodCollection.on('update', this.renderTotal, this);
        app.foodCollection.fetch(); // Loads list from local storage

    },
    events: {

        'click #add-food': 'renderFood',
        'keyup #user-input': 'autoSearch'
    },

    autoSearch: function() {

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
                        item_id: "",
                        calories: ""

                    }),
                    success: function(data) {

                        if (data.hits.length != 0) {
                            for (i = 0; i < data.hits.length; i++) {
                                response($.map(data.hits, function(item) {

                                    return {
                                        value: item.fields.item_name,
                                        item_name: item.fields.item_name,
                                        item_id: item.fields.item_id,
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
      renderFood: function(){

        app.foodCollection.create(this.newAttributes());
        this.input.val(''); // clean input box
      },

      addOne: function(foodrecord){
        console.log("inside addOne");
        var view = new app.FoodRecords({model: foodrecord});
        $('#foodRecords').append(view.render().el);
      },

      addAll: function(){
        console.log("inside addAll");
        this.$('#foodRecords').html(''); //clean the todo list
        app.foodCollection.each(this.addOne, this);

      },

      newAttributes: function(){
        console.log("inside newAttributes");
        return {
          item_name: records.item_name,
          brand_name: records.brand_name,
          calories: records.calories,
          item_id: records.item_id,
          servings: this.servings.val()

        }
      },

      renderTotal: function(){ // renders total calories consumed
        var cals = 0;
        var servings = 0;
        var item_cal = 0;
        var total_calories = 0;

        app.foodCollection.each(function(model){ // iterate through collection to calculate total calories consumed

            cals = model.get("calories");
            num = model.get("servings");
            item_cal = cals * num;
            total_calories += item_cal;
            return total_calories;
        });

        $("#total-calories").html(this.template({total_cals : total_calories})); // update DOM element to current calories consumed

    },
});

})(jQuery);
