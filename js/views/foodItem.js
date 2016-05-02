/* global Backbone */
var app = app || {};

(function($) {
    'use strict';
    app.FoodRecords = Backbone.View.extend({
        tagName: 'li',
        template: '<button>Delete</button>',

        render: function() {
            this.$el.html(this.model.item_name+this.template);
            console.log(this.model.item_name);
            return this;
        },

        initialize: function(options) {
            if (options.model)
                this.model = options.model;
            console.log(this.model);
            app.foodCollection.create(this.newAttributes());
            this.model.on('destroy', this.remove, this);

        },

        events: {
            'click button': 'destroy'
        },

        destroy: function() {
            this.model.destroy();
        },

        newAttributes: function() {
            return {
                item_name: this.model.item_name,
                brand_name: this.model.brand_name,
                calories: this.model.nf_calories,
                id: this.model.item_id

            }
        }

    });
})(jQuery);
