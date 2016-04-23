var app = app || {};

(function () {
    'use strict';
    app.FoodItem = Backbone.Model.extend({
        // Default attributes for the food items
        defaults: {
        item_name: '',
        brand_name: '',
        calories: '',
        item_id: ''
      },

    });
})();