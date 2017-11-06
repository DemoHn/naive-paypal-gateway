$(function(){

    // utils
    function _zeropad(num) {
        if(num < 10){
            return "0" + num;
        }else {
            var _num = String(num);
            var len = _num.length;
            // last two digits
            return _num[len-2] + _num[len-1];
        }
    }
    // Vue part
    // validation control
    // Nigshoxiz
    // 7.11.2017
    var credit_card_info = new Vue({
        el:"#credit_card_info",
        data: {
            holder_name: {
                data: "",
                valid: true,
                v_hint: ""
            },
            card_number: {
                data: "",
                valid: true,
                v_hint: ""
            },
            security_code: {
                data: "",
                valid: true,
                v_hint: ""
            },
            expire_month: {
                data: "MM",
                valid: true,
                v_hint: ""
            },
            expire_year: {
                data: "YY",
                valid: true,
                v_hint: ""
            }
        },
        watch: {
            holder_name: {deep: true, handler: function(){} },
            card_number: {deep: true, handler: function(){}},
            security_code: {deep: true, handler: function(){}},
            expire_year: {deep: true, handler: function(){}},
            expire_month: {deep: true, handler: function(){}}
        },
        computed: {
            valid_months: function(){
                var months = [];

                var date = new Date();
                var c_year = date.getFullYear() % 100;
                var c_month = date.getMonth() + 1;

                var start_month = 1;
                if(this.year === String(c_year)) {
                    start_month = c_month;
                }

                for(var i=start_month;i<=12;i++) {
                    months.push(_zeropad(i));
                }

                return months;
            },
            valid_years: function() {
                var years = [];
                
                var date = new Date();
                var start_year = date.getFullYear() % 100;
                
                for(var i=start_year;i<=start_year+10;i++) {
                    years.push(_zeropad(i));
                }

                return years;
            }
        },
        methods: {
            change_month: function(item) {
                this.expire_month.data = item;
            },
            change_year: function(item) {
                this.expire_year.data = item;
            },
            load_validation_error: function(error) {
                var keys = ["holder_name", "card_number", "security_code", "expire_month", "expire_year"];

                for(var index in keys) {
                    var key = keys[index];
                    if(error[key] == null) {
                        this[key]["valid"] = true;
                        this[key]["v_hint"] = "";
                    }else {
                        this[key]["valid"] = false;
                        this[key]["v_hint"] = error[key];
                    }
                }
            },
            export(){
                return {
                    "holder_name": this.holder_name.data,
                    "card_number": this.card_number.data,
                    "security_code": this.security_code.data,
                    "expire_month": this.expire_month.data,
                    "expire_year": this.expire_year.data
                }
            }
        }
    });

    var customer_info = new Vue({
        el: "#customer_info",
        data: {
            first_name: {
                data: "",
                valid: true,
                v_hint: ""
            },
            last_name: {
                data: "",
                valid: true,
                v_hint: ""
            },
            phone_number: {
                data: "",
                valid: true,
                v_hint: ""
            },
            price: {
                data: "",
                valid: true,
                v_hint: ""
            },
            currency: "HKD",
            country_code: "852",
            country_code_text: "Hong Kong (+852)"
        },
        watch: {
            first_name: {handler: function(){}, deep: true},
            last_name: {handler: function(){}, deep: true},
            firs_name: {handler: function(){}, deep: true},
            first_name: {handler: function(){}, deep: true}
        },
        methods: {
            load_validation_error: function(errors) {
                var keys = ["first_name", "last_name", "phone_number", "price"];
                
                for(var index in keys) {
                    var key = keys[index];
                    if(errors[key] == null) {
                        this[key]["valid"] = true;
                        this[key]["v_hint"] = "";
                    }else {
                        this[key]["valid"] = false;
                        this[key]["v_hint"] = errors[key];
                    }
                }
            },
            set_currency: function(currency) {
                this.currency = currency;
            },

            set_country_code: function(country_code, text) {
                this.country_code = country_code;
                this.country_code_text = text;
            },
            export: function() {
                return {
                    "first_name": this.first_name.data,
                    "last_name": this.last_name.data,
                    "country_code": this.country_code,
                    "phone_number": this.phone_number.data,
                    "currency": this.currency,
                    "price": this.price.data
                }
            }
        }
    });

    var btnState = {
        READY: "ready",
        PROCESSING: "processing"
    }
    var submit_button = new Vue({
        el:"#submit_button_div",
        data: {
            state: btnState.READY // or "processing"
        },
        methods: {
            submit_payment: function() {
                this.state = btnState.PROCESSING;

                var merged_payload = {};
                merged_payload = $.extend(customer_info.export(), credit_card_info.export());
                
                var that = this;
                $.post("/submit_payment", merged_payload, null, "json").done(function(data){
                    that.state = btnState.READY;

                    if(data.code == 200) {
                        
                    }
                    else if(data.code == 600) { // validation error
                        customer_info.load_validation_error(data.info);
                        credit_card_info.load_validation_error(data.info);

                    }
                }).fail(function(){

                });
            }
        }
    })

    // jQuery part
    // for widgets' operation
    // use ordinary js grammer
    // Nigshoxiz
    // 7.11.2017

    // tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // dropdown menu
    $("#country_code_btn .dropdown-item").click(function(){
        // set dropdown-toggle button
        var countryCode = $(this).attr("value");
        var countryName = $(this).text();

        customer_info.set_country_code(countryCode, countryName);
    });

    $("#price_btn .dropdown-item").click(function(){
        // set dropdown-toggle button
        var currency = $(this).html();
        customer_info.set_currency(currency);
    });
});
