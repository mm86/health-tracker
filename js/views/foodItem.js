/*global Backbone */
var app = app || {};

(function() {
    'use strict';
    var FoodItem = Backbone.View.extend({
        initialize: function(options) {
            console.log("inside footitem");
        },

        render: function() {
            this.$el.html(this.model.attributes.fields.item_name + " , " + this.model.attributes.fields.brand_name + " , " + this.model.attributes.fields.nf_calories);
            return this;
        }

    });
})();
