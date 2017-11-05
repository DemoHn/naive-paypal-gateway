/**
 * Validation Check for user-input customer value
 * Only all values are checked successfully will export customer info.
 * Otherwise, Exceptions will throw out.
 */

const utils = require("../utils");

const supportCurrencies = ["HKD", "USD", "AUD", "EUR", "JPY", "CNY"];

const countryCodes = {
    CHINA: "86",
    HONGKONG: "852"
};

/* errors to be shown by system */
const errors = {
    INVALID_TYPE: function() { return "Invalid input type!" },
    
    FIELD_EMPTY: function(field_name) { return `${field_name} should not be empty!` },

    TEXT_TOO_LONG: function(field_name, max_len) {
        return `${field_name} should not be longer than ${max_len} characters!`;
    },
    DIGITS_ONLY: function(field_name) {
        return `${field_name} only accepts digits!`;
    },
    AMOUNT_EXCEED: function(field_name, max_amount) {
        return `${field_name} exceeds maximum amount ${max_amount}!`;
    },
    FIXED_LENGTH: function(field_name, length) {
        return `${field_name} should be only ${length} characters long!`;
    },

    NOT_SUPPORTED_CURRENCY: function(currency) {
        return `Unsupported currency ${currency}!`;
    },
    JPY_NO_DECIMAL: function() {
        return "Decimal Amount are not supported in JPY!";
    }
}

/* consts related to validation rule */
const validations = {
    FIRST_NAME_MAX_LENGTH: 128,
    LAST_NAME_MAX_LENGTH: 128,
    CHINA_PHONE_NUMBER_LENGTH: 11, // 其实内地也有8位固话以及400打头的奇葩==这里为了方便就采用11位手机号来验证啦=w=
    HONGKONG_PHONE_NUMBER_LENGTH: 8,
    PHONE_NUMBER_MAX_LENGTH: 32,
    AMOUNT_MAX_NUMBER: 100000
}

class CustomerInfo {
    constructor() {
        this.validation_errors = {};

        /* data structure for customer info*/
        this.first_name = ""; // type: string
        this.last_name  = ""; // type: string 
        
        this.country_code = 0; // type: number
        this.phone_number = 0; // type: number
        
        this.currency = ""; // one of array:supportCurrencies
        this.price = 0.00; // price amount (string with 2-digit decimal)
    }
    
    /** @brief: append validation error
     *  Internal use only
     *  @metaphor: one field only has at most one validation error! 
    */
    _set_validation_error(key, value) {
        this.validation_errors[key] = value;
    }

    _clear_validation_error(key) {
        delete this.validation_errors[key];
    }

    // set variables with validation
    set_first_name(first_name) {

        if(typeof first_name !== "string") 
        {
            this._set_validation_error("first_name", errors.INVALID_TYPE());
        }
        else if(first_name.length == 0)
        {
            this._set_validation_error("first_name", errors.FIELD_EMPTY("First Name"));
        }
        else if(first_name.length > validations.FIRST_NAME_MAX_LENGTH)
        {
            this._set_validation_error("first_name", errors.TEXT_TOO_LONG("First Name", validations.FIRST_NAME_MAX_LENGTH));
        }
        else
        {
            this._clear_validation_error("first_name");
            this.first_name = first_name;
        }
    }

    set_last_name(last_name) {
        if(typeof last_name !== "string") 
        {
            this._set_validation_error("last_name", errors.INVALID_TYPE());
        }
        else if(last_name.length == 0)
        {
            this._set_validation_error("last_name", errors.FIELD_EMPTY("Last Name"));
        }
        else if(last_name.length > validations.LAST_NAME_MAX_LENGTH)
        {
            this._set_validation_error("last_name", errors.TEXT_TOO_LONG("Last Name", validations.LAST_NAME_MAX_LENGTH));
        }
        else
        {
            this._clear_validation_error("last_name");
            this.last_name = last_name;
        }
    }

    set_phone(country_code, phone_number) {
        this._clear_validation_error("country_code");
        this._clear_validation_error("phone_number");
        // Country Code Validatiaon Check
        let _country_code = String(country_code);
        
        if(country_code == null || _country_code === "")
        {
            this._set_validation_error("country_code", errors.FIELD_EMPTY("Country Code"));
        }
        else if(! /^[0-9]+$/.test(_country_code) ) // not digits only
        {
            this._set_validation_error("country_code", errors.DIGITS_ONLY("Country Code"));
        }
        else
        {
            // of course I know there is a list contains all countries / regions.
            // For simplicity, I omit this check.
            this.country_code = _country_code;
        }

        // Phone Number validation Check
        let _phone_number = String(phone_number);
        
        if(phone_number == null || _phone_number === "")
        {
            this._set_validation_error("phone_number", errors.FIELD_EMPTY("Phone Number"));
        }
        if(! /^[0-9]+$/.test(_phone_number) ) // not digits only
        {
            this._set_validation_error("phone_number", errors.DIGITS_ONLY("Phone Number"));
        }
        else
        {            
            // add special check with different country codes
            switch(this.country_code)
            {
                case countryCodes.CHINA:
                    if(_phone_number.length !== validations.CHINA_PHONE_NUMBER_LENGTH)
                    {
                        this._set_validation_error("phone_number", errors.FIXED_LENGTH("Phone Number", validations.CHINA_PHONE_NUMBER_LENGTH));
                    }
                    break;
                case countryCodes.HONGKONG:
                    if(_phone_number.length !== validations.HONGKONG_PHONE_NUMBER_LENGTH)
                    {
                        this._set_validation_error("phone_number", errors.FIXED_LENGTH("Phone Number", validations.HONGKONG_PHONE_NUMBER_LENGTH));
                    }
                    break;
                default:
                    if(_phone_number.length > validations.PHONE_NUMBER_MAX_LENGTH)
                    {
                        this._set_validation_error("phone_number", errors.TEXT_TOO_LONG("Phone Number", validations.PHONE_NUMBER_MAX_LENGTH));
                    }
                    break;
            }

            if(this.validation_errors["phone_number"] == null)
            {
                this.phone_number = _phone_number;
            }
        }
    }

    // set currency & price
    set_price_amount(currency, price) {
        this._clear_validation_error("currency");
        this._clear_validation_error("price");
        
        // currency
        if(currency == null || currency == "")
        {
            this._set_validation_error("currency", errors.FIELD_EMPTY("Currency"));
        }
        else if(supportCurrencies.indexOf(currency) < 0) 
        {
            this._set_validation_error("currency", errors.NOT_SUPPORTED_CURRENCY(currency));
        }
        else
        {
            this.currency = currency;
        }

        // price
        if(price == null || price == "")
        {
            this._set_validation_error("price", errors.FIELD_EMPTY("Price"));
        }
        else if(isNaN(price))
        {
            this._set_validation_error("price", errors.INVALID_TYPE());
        }
        else
        {
            let _price = parseFloat(price);
            if(_price > validations.AMOUNT_MAX_NUMBER) {
                this._set_validation_error("price", errors.AMOUNT_EXCEED("Price", validations.AMOUNT_MAX_NUMBER));
                return ;
            }

            if(this.currency == "JPY") { // no decimals in JPY
                if(_price - Math.floor(_price) >= 0.01) {
                    this._set_validation_error("price", errors.JPY_NO_DECIMAL());
                }
            }

            if(this.validation_errors["price"] == null) {
                this.price = _price.toFixed(2); // 2.00 
            }
        }
    }


    /** @brief: Export validation errors
     *  errors are formated as <field_name>: <error info>
     * 
     *  e.g.: error = {
     *      "first_name": "Invalid input type!"
     *  }
     * 
     *  @return: if no validation error, return null;
     *           else return error object
     */ 
    get_validation_errors() {
        if(Object.keys(this.validation_errors).length == 0)
        {
            return null;
        }
        else 
        {
            return this.validation_errors;
        }
    }

    // export data for further usages
    export() {
        if(Object.keys(this.validation_errors).length == 0)
        {
            var _model = {
                name: {
                    first_name: this.first_name,
                    last_name: this.last_name
                },
                phone: {
                    country_code: this.country_code,
                    phone_number: this.phone_number
                },
                currency: this.currency,
                price: this.price
            };

            return _model;
        }
        else
        {
            return null;
        }
    }

    dispose() {
        this.first_name = "";
        this.last_name = "";
        this.country_code = 0;
        this.phone_number = 0;
        this.currency = "";
        this.price = null;
    }
}

module.exports = CustomerInfo;