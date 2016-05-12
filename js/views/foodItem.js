/* global Backbone */
var app = app || {};

(function($) {
    'use strict';
    app.FoodRecords = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#item-template').html()),

        render: function() {
            console.log("inside foodrecord");
            console.log(this.model.attributes);
            this.$el.html(this.template(this.model.attributes));
            return this;
        },

        initialize: function() {
            this.listenTo(this.model, "destroy", this.remove);
        },

        events: {
            'click .delete': 'clear'
        },

        clear: function() {
            this.model.destroy(); //Leads to xml http request not allowed error

        }
    });
})(jQuery);
