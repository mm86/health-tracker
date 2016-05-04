/* global Backbone */
var app = app || {};

(function($) {
    'use strict';
    app.FoodRecords = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#item-template').html()),

        render: function() {

            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        initialize: function(){

            this.model.on('destroy', this.remove, this);
        },

        events: {
            'click .destroy': 'destroy'
        },

        destroy: function() {
            this.model.destroy();
        },
    });
})(jQuery);
