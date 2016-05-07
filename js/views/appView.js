/*global Backbone */
var app = app || {};

(function($) {


    app.AppView = Backbone.View.extend({

        el: '#healthtracker',
        template: _.template($('#total-calorie-template').html()),

        initialize: function() {
            console.log("inside initialize");

            var self = this;

            this.model_date;
            this.input = this.$('#user-input');
            this.servings = $("#servings");
            this.total_calories = 0;
            this.records;


        },

        events: {

            'click #add-food': 'renderFood',
            'keyup #user-input': 'autoSearch',
           // 'change #mydate': 'renderFood'

        },


        autoSearch: function() {
            console.log("inside autosearch");
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


        renderFood: function() {
            console.log("inside renderFood");
            model_date = $('#date').val();
            this.dateUrl = "https://fiery-inferno-4707.firebaseio.com/" + model_date;
            app.foodCollection = new app.FoodCollection([], { url: this.dateUrl });
            app.foodCollection.on('add', this.addOne, this);
          //  app.foodCollection.on('update', this.renderTotal, this);
            app.foodCollection.create(this.newAttributes());
            this.input.val('');
        },

        addOne: function() {
            console.log("inside addOne");
            $('#foodRecords').html('');
            console.log(app.foodCollection);
            app.foodCollection.each(function(food) {
                var view = new app.FoodRecords({ model: food });
                $('#foodRecords').append(view.render().el);
            });

        },

        newAttributes: function() {
            console.log("inside newAttributes");
            return {
                item_name: records.item_name,
                brand_name: records.brand_name,
                calories: records.calories,
                item_id: records.item_id,
                servings: this.servings.val(),
                date: this.model_date

            }
        },

    });

})(jQuery);
