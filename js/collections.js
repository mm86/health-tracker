/*global Backbone */
var app = app || {};

(function() {
    'use strict';
    app.FoodCollection = Backbone.Firebase.Collection.extend({
        model: app.FoodItem,
        url: "https://fiery-inferno-4707.firebaseio.com"

    });

    app.foodCollection = new app.FoodCollection();
})();
