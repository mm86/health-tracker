//global object app
var app = app || {};


$(function () {
    'use strict';
    //Invoke AppView. AppView is the main UI of the application
	var fredRef = new Firebase("https://fiery-inferno-4707.firebaseio.com/");
    fredRef.remove();
    app.appview = new app.AppView();
});
