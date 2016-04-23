/*global Backbone */
var app = app || {};

(function() {
    'use strict';
    var Router = Backbone.Router.extend({
        routes: {
            '*path': 'search'
        },
        search: function() {

            var view = new app.AppView();
            $('#displayFoodList').html(view.render().el);
        }
    });

    app.router = new Router();
    Backbone.history.start();
})();
