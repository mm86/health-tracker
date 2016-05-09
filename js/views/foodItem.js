/* global Backbone */
var app = app || {};

(function($) {
    'use strict';
    app.FoodRecords = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#item-template').html()),

        render: function() {
            console.log("inside foodrecord");
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        initialize: function() {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, "destroy", this.remove);
        },

        events: {
            'click .destroy': 'destroy'
        },

        destroy: function() {

            this.model.destroy(); //Leads to xml http request not allowed error
            this.remove();

        },
    });
})(jQuery);


