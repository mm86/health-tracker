/*global Backbone */
var app = app || {};

(function($) {


    app.AppView = Backbone.View.extend({

        el: '#healthtracker',
        template: _.template($('#total-calorie-template').html()),

        initialize: function() {
            console.log("inside initialize");

            var self = this;

            var date = new Date();
            var current_date = (date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear());

            this.input = this.$('#user-input');
            this.servings = $("#servings");
            this.total_calories = 0;
            this.records;
            this.$list = $("#foodRecords");
            $("#date").glDatePicker({
                //upon instantiation, let's tell it that:
                onClick: (function(el, cell, date, data) {
                    //give me the chosen date
                    el.val(date.toLocaleDateString());
                    self.render();
                }),

            });

            $("#date").val(current_date);
            this.render();

        },

        events: {

            'click #add-food': 'addFood',
            'click #chart': 'calculateChart',
            'keydown #user-input': 'autoSearch',
            'change #date': 'render'

        },

        autoSearch: function() {
            console.log("inside autosearch");
            $("#user-input").autocomplete({
                delay: 100,
                source: function(request, response) {

                    // Suggest URL
                    var suggestURL = "https://api.nutritionix.com/v1_1/search/%QUERY?results=0:10&fields=item_name,brand_name,item_id,nf_calories&appId=41324021&appKey=b16be109bec67fb1282c4b4559e8666f";
                    suggestURL = suggestURL.replace('%QUERY', request.term);

                    // JSONP Request
                    $.ajax({
                        method: 'GET',
                        dataType: 'json',
                        url: suggestURL,
                        data: JSON.stringify({
                            item_name: "",
                            brand_name: "",
                            item_id: "",
                            calories: ""

                        }),
                        success: function(data) {

                            if (data.hits.length != 0) {
                                for (i = 0; i < data.hits.length; i++) {
                                    response($.map(data.hits, function(item) {

                                        return {
                                            value: item.fields.item_name,
                                            item_name: item.fields.item_name,
                                            item_id: item.fields.item_id,
                                            brand_name: item.fields.brand_name,
                                            calories: item.fields.nf_calories

                                        }
                                    }));

                                }
                            } else {
                                response([]);
                            }


                        },
                        error: function() {
                            alert("Oops, something went wrong!");
                        },

                    })

                },
                minLength: 1,
                select: function(event, ui) {

                    records = ui.item;
                }
            });
        },

        render: function() {
            console.log("inside render");
            var self = this;
            this.model_date = $("#date").val();

            this.dateUrl = "https://fiery-inferno-4707.firebaseio.com/" + this.model_date.replace(/\//g, '');
            console.log(this.dateUrl);
            this.foodCollection = new app.FoodCollection([], { url: this.dateUrl });
            this.listenTo(this.foodCollection, 'add', this.render);
            this.listenTo(this.foodCollection, 'all', this.renderTotal);
            this.$list.html('');
            this.foodCollection.each(function(food) {
                console.log("iterating over foodCollection");
                var view = new app.FoodRecords({ model: food });
                self.$list.append(view.render().el);
            });
        },

        //called when an item is added and the add-food button is clicked
        addFood: function() {
            console.log("inside addFood");
            if (this.input.val() == '') {
                return;
            };
            this.foodCollection.create(this.newAttributes());
            this.input.val('');
            // this.render();
        },

        newAttributes: function() {
            console.log("inside newAttributes");
            return {
                item_name: records.item_name,
                brand_name: records.brand_name,
                calories: records.calories,
                item_id: records.item_id,
                servings: this.servings.val(),
                date: this.model_date,
                total_calories: records.calories * this.servings.val()

            }
        },

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




            /*
            var date = new Date();
            var current_date = (date.getMonth() + 1) +"-" + date.getDate() + "-" + date.getFullYear();

            var curr = new Date(current_date);
            var week = [];

            function calculateDate(){
                for (var i = 0; i<7;i++){
                var first = curr.getDate() - curr.getDay();
                var next_day = first + i;

                var calc_date = new Date(curr.setDate(next_day));
                calc_date = (calc_date.getMonth() + 1) +"-" + calc_date.getDate() + "-" + calc_date.getFullYear();
                week.push(calc_date);

                }
            }

            calculateDate(curr);
            console.log(week);*/
            //How to get data from Firebase for this weeks data

            var xaxis = [];
            var yaxis = [0, 100, 200, 150, 0, 0, 0];
            var week = ["582016", "592016", "5102016", "5112016", "5122016", "5132016", "5142016"];

            var self = this;
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
                    if (i === 6) {
                        console.log(xaxis);
                        self.displayChart(xaxis, week);
                    }
                }
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
                        label: 'Weekly',
                        data: xaxis
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
