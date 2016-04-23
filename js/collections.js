/*global Backbone */
var app = app || {};

(function() {
    'use strict';
    app.FoodStorage = Backbone.Firebase.Collection.extend({
        model: app.FoodItem,
        url: "https://fiery-inferno-4707.firebaseio.com",

    });

    app.FoodList = Backbone.Collection.extend({
        model: app.FoodItem,
        initialize: function(options) {
            if (options.title)
                this.title = options.title;
        },

        url: function() {
            return "https://api.nutritionix.com/v1_1/search/" + this.title + "?results=0:10&fields=item_name,brand_name,item_id,nf_calories&appId=41324021&appKey=b16be109bec67fb1282c4b4559e8666f";
        },

        parse: function(response) {
            return response.hits;
        }
    });
})();
