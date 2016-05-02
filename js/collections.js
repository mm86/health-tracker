/*global Backbone */
var app = app || {};

(function() {
    'use strict';
    app.FoodCollection = Backbone.Collection.extend({
        model: app.FoodItem,
        localStorage: new Store("health-tracker")

    });

    app.foodCollection = new app.FoodCollection();
})();
