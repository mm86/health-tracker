/*global Backbone */
var app = app || {};

(function() {

    app.AppView = Backbone.View.extend({

    template: "<input type='text' placeholder='search'> \
               <button>Search</button> \
               <ul id='food-list'></ul>",

    initialize: function(options) {
        console.log("inside AppView initialize");
        var food;
    },

    render: function() {
        console.log("inside AppView render");
        this.$el.html(this.template);
        return this;
    },

    events: {
        'click button': 'getfoodlist'
    },

    getfoodlist: function() {
        console.log("inside AppView getfoodlist");
        var title = this.$el.find('input').val();
        food = new app.FoodList({ title: title });
        food.fetch({ success: this.renderfood.bind(this) });
    },

    renderfood: function(movies) {
        console.log("inside AppView renderfood");
        this.$el.find('#food-list').empty();
        var foodview;
        for (var n in food.models) {
            foodview = new app.FoodItemView({ model: food.models[n] });
            this.$el.find('#food-list').append(foodview.render().el);
        }
    }

});
})();