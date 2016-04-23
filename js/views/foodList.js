/*global Backbone */
var app = app || {};

(function() {

    var Search = Backbone.View.extend({

    template: "<ul id='food-list'></ul>",

    initialize: function(options) {
        var food;
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    },

    events: {
        'click button': 'getfoodlist'
    },

    getfoodlist: function() {
        var title = this.$el.find('input').val();
        food = new FoodList({ title: title });
        food.fetch({ success: this.renderfood.bind(this) });

    },

    renderfood: function(movies) {
        this.$el.find('#food-list').empty();
        var foodview;
        for (var n in food.models) {
            foodview = new FoodItem({ model: movies.models[n] });
            this.$el.find('#food-list').append(foodview.render().el);
        }
    }

});
})();