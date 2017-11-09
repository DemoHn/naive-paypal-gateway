$(function() {
    // Vue part
    // validation control and payment search display
    // 8.11.2017

    var check_payment_form = new Vue({
        el:"#check_payment_form",
        data: {
            search_keyword: {
                data: "",
                valid: true,
                v_hint: ""
            },
            search_type: {
                data: "name",
                valid: true,
                v_hint: ""
            },
            payment_cursor: "0",
            payment_records: [],

            more_record_status: 0,
            record_status: -1
        },
        watch: {
            search_keyword: {handler: function(){}, deep: true},
            search_type: {handler: function(){}, deep: true}
        },
        methods: {
            change_search_type: function(item) {
                this.search_type.data = item;
            },
            reset_validaton: function() {
                this.search_keyword.valid = true;
                this.search_keyword.v_hint = "";
                
                this.search_type.valid = true;
                this.search_type.v_hint = "";
            },
            order_status_text: function(order_status) {
                switch(order_status) {
                    case "0":
                        return "SUCCESS";
                    case "1":
                        return "FAIL";
                    case "2":
                        return "PENDING";
                    default:
                        return "PENDING";
                }
            },

            load_validation_errors: function(errors) {
                var keys = ["search_keyword", "search_type"];
                
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

            see_more: function() {
                this.more_record_status = 1;
                this.execute_search(true);
            },
            execute_search: function(append) {
                let query = {
                    limit: 10,
                    cursor: this.payment_cursor,
                    search_type: this.search_type.data,
                    search_keyword: this.search_keyword.data
                }

                var that = this;

                if(append !== true) {
                    this.payment_records = [];
                }
                this.record_status = 1; //loading...
                $.get("/api/search_payment_record", query).done(function(data) {
                    try {
                        var data = JSON.parse(data);
                        if(data.code == 600) { // validation error
                            that.load_validation_errors(data.info);
                            that.record_status = 0;
                            that.more_record_status = 0;
                        } else if(data.code == 200){
                            that.reset_validaton();

                            var info = data.info;
                            that.payment_cursor = info.cursor;

                            var is_null = true;
                            for(var $k in info.data) {
                                is_null = false;
                                var item = info.data[$k];
                                var _model = {
                                    "ref_code": $k,
                                    "name": item["name"],
                                    "price": item["price"],
                                    "phone": item["phone"],
                                    "order_status": item["order_status"]
                                };

                                that.payment_records.push(_model);
                            }
                            
                            if(that.payment_cursor != "0") {
                                that.more_record_status = 2;
                            } else {
                                that.more_record_status = -1;
                            }

                            if(is_null) {
                                that.more_record_status = 0;
                                that.record_status = -1;
                            }
                            else {
                                that.record_status = 2;
                            }  
                        }
                    } catch (error) {
                        // TODO handle errors!
                    }
                }).fail(function() {
                    // TODO
                });
            }
        },
        mounted: function() {
            this.execute_search();
        }
    }) 
});