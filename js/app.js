//global object app
var app = app || {};


$(function () {
    'use strict';
    //start things off by calling the main UI - AppView
    console.log("inside app");
    new app.AppView();
});
