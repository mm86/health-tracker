var app = app || {};

(function () {
    'use strict';
    app.FoodItem = Backbone.Model.extend({
        defaults: {
            item_name: '',
            brand_name: '',
            calories: '',
            item_id:'',
            servings: ''


        },

    });
})();