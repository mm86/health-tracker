/*global Backbone */
var app = app || {};

(function($) {


app.AppView = Backbone.View.extend({

            el: '#healthtracker',
            //Underscore's template to display the total calories for the day
            template: _.template($('#total-calorie-template').html()),

            initialize: function() {
                console.log("inside initialize");

                var self = this;
                this.date = new Date();
                this.current_date = (this.date.getMonth() + 1 + "/" + this.date.getDate() + "/" + this.date.getFullYear());
                this.$input = this.$('#user-input');
                this.servings = this.$("#servings");
                this.$list = this.$("#foodRecords");
                this.total_calories = 0;
                this.records;
                $("#date").glDatePicker({
                    onClick: (function(el, cell, date, data) {
                        el.val(date.toLocaleDateString());
                        //every time a new date is chosen from the calendar, updateFoodList function is called to to display records for the chosen date.
                        self.updateFoodList();
                    }),

                });
                //set today's date as the default value for the calendar box
                $("#date").val(this.current_date);
                //once the page loads, call render.
                this.render();


            },

            events: {

                'click #add-food': 'addFood', //call addFood function when "add food" button is clicked
                'click #chart': 'calculateChart', //display chart for the week/month when the chart button is clicked
                'keydown #user-input': 'autoSearch', //start search when a character is entered in the input box

            },

            //jQuery's autosearch widget
            autoSearch: function() {
                console.log("inside autosearch");
                $("#user-input").autocomplete({
                            delay: 100,
                            source: function(request, response) {

                                // Nutrition URL API call
                                var nutritionURL = "https://api.nutritionix.com/v1_1/search/%QUERY?results=0:10&fields=item_name,brand_name,item_id,nf_calories&appId=41324021&appKey=b16be109bec67fb1282c4b4559e8666f";
                                nutritionURL = nutritionURL.replace('%QUERY', request.term);

                                // JSONP Request
                                $.ajax({
                                    method: 'GET',
                                    dataType: 'json',
                                    url: nutritionURL,
                                    data: JSON.stringify({
                                        item_name: "",
                                        brand_name: "",
                                        item_id: "",
                                        calories: ""

                                    }),
                                    beforeSend: function() {
                                        $(".loading").show();
                                        console.log("loading");
                                    },
                                }).done(function(data) {
                                    $(".loading").hide();
                                    if (data.hits.length != 0) {
                                        for (i = 0; i < data.hits.length; i++) {
                                            response($.map(data.hits, function(item) {

                                                return {
                                                    value: item.fields.item_name,
                                                    item_name: item.fields.item_name,
                                                    item_id: item.fields.item_id,
                                                    brand_name: item.fields.brand_name,
                                                    calories: item.fields.nf_calories,


                                                }
                                            }));

                                        }
                                    } else {
                                        alert("No records match your search");
                                        response([]);
                                    }
                                }).fail(function() {
                                    alert("Oops, something went wrong with Nutritionix API");
                                });


                    },
                    minLength: 1, //start search with character length 1
                    select: function(event, ui) {
                        //save the item chosen from the API to var records
                        self.records = ui.item;
                        console.log(self.records);
                    }
            });
    },

    //gets the current date and creates a new collection for the date and add event listeners to the collection
    render: function() {
        console.log("inside render");
        var self = this;
        this.$list.html('');
        this.model_date = $("#date").val();
        this.dateUrl = "https://fiery-inferno-4707.firebaseio.com/" + this.model_date.replace(/\//g, '');
        this.foodCollection = new app.FoodCollection([], { url: this.dateUrl });
        this.listenTo(this.foodCollection, 'add', this.displayFood);
        this.listenTo(this.foodCollection, 'remove', this.iterateFood);
        this.renderTotal();
        return this;
    },


    //this function is called every time the add-food button is clicked
    //function creates a new model within the collection
    addFood: function() {
        console.log("inside addFood");
        if (this.$input.val() == '') {
            return;
        };
        this.foodCollection.create(this.newAttributes());
        var food = this.foodCollection.models.length;
        this.$input.val('');

    },

    //displays the item added to the collection
    displayFood: function(food) {

        console.log("inside displayFood");
        var self = this;
        var view = new app.FoodRecords({ model: food });
        this.$list.append(view.render().el);
        //re-calculate total number of calories
        this.foodCollection.fetch({
            success: function(data) {
                self.renderTotal();
            }
        });

    },

    //function called when a new date is picked
    //uses firebase's promises to check if a collection exists. If no, then call render and instantiate a new collection
    //if collection already exists, then display the data.
    updateFoodList: function() {
        console.log("inside updateFoodList");
        var self = this;
        this.model_date = $("#date").val();
        this.dateUrl = "https://fiery-inferno-4707.firebaseio.com/" + this.model_date.replace(/\//g, '');
        var ref = new Firebase(this.dateUrl);
        ref.once("value", function(snapshot) {
            var a = snapshot.exists();
            console.log(a);
            if (a === false) {
                self.render();
            } else {
                self.foodCollection = new app.FoodCollection([], { url: self.dateUrl });
                self.iterateFood();

            }
        });
    },

    //display items within a collection
    iterateFood: function() {
        console.log("inside iterateFood");
        var self = this;
        console.log(this.foodCollection);
        this.$list.html('');
        this.foodCollection.fetch({
            success: function(data) {
                self.renderTotal();
                data.each(function(food) {
                    console.log("iterating over foodCollection");
                    var view = new app.FoodRecords({ model: food });
                    $('#foodRecords').append(view.render().el);
                });
            }
        });

    },

    //create data within collection
    newAttributes: function() {
        console.log("inside newAttributes");
        return {
            item_name: self.records.item_name,
            brand_name: self.records.brand_name,
            calories: self.records.calories,
            item_id: self.records.item_id,
            servings: this.servings.val(),
            date: this.model_date,
            total_calories: self.records.calories * this.servings.val()

        }
    },

    //caluclate total calories consumed for the day
    renderTotal: function() {
        console.log("inside renderTotal");
        var cals = 0;
        var servings = 0;
        var item_cal = 0;
        var total_calories = 0;

        this.foodCollection.each(function(model) {

            cals = model.get("calories");
            num = model.get("servings");
            item_cal = cals * num;
            total_calories += item_cal;
            return total_calories;
        });

        $("#total-calories").html(this.template({ total_cals: total_calories }));

    },

    calculateChart: function() {
        console.log("lets get started with the chart operation");
        var self = this;
        var date = new Date();
        var current_date = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();

        var curr = new Date(current_date);
        var week = [];

        //week calculator
        for (var i = 0; i < 7; i++) {
            var first = curr.getDate() - curr.getDay();
            var next_day = first + i;

            var calc_date = new Date(curr.setDate(next_day));
            calc_date = (calc_date.getMonth() + 1) + "" + calc_date.getDate() + "" + calc_date.getFullYear();
            console.log(calc_date);
            week.push(calc_date);

        }

        var xaxis = [];
        var ref = new Firebase("https://fiery-inferno-4707.firebaseio.com/");

        ref.once('value').then(function(snapshot) {
            for (var i = 0; i < 7; i++) {
                var total_day_calories = 0;
                console.log(snapshot.child(week[i]).val());
                if (snapshot.child(week[i]).val() == null) {
                    console.log("inside null");
                    xaxis.push(0);
                } else {
                    snapshot.child(week[i]).forEach(function(childSnapshot) {

                        var childData = childSnapshot.val().total_calories;
                        total_day_calories = total_day_calories + childData;

                    });

                    xaxis.push(total_day_calories);

                }

            }
            self.displayChart(xaxis, week);
        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

    },

    displayChart: function(xaxis, week) {
        $(".chart").animate({ width: 'toggle' });
        $('#closeButton').click(function() {
            this.parentNode.style.display = 'none';
        });
        var ctx = document.getElementById("displayChart");
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: week,
                datasets: [{

                    label: '# of Calories',
                    borderColor: "#1E90FF",
                    data: xaxis,

                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

    }


});

})(jQuery);
