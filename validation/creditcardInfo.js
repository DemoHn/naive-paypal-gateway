/**
 * Validation Check for user-input credit card value
 * Only all values are checked successfully will export customer info.
 * Otherwise, Exceptions will throw out.
 */

const utils = require("../utils");

const creditCardTypes = {
    MASTER: "Master",
    VISA: "Visa",
    AMEX: "AmericanExpreess",
    OTHERS: "Others"
};

const validations = {
    HOLDER_NAME_MAX_LENGTH: 64,
    CARD_NUMBER_MAX: 19,
    CARD_NUMBER_MIN: 13,
    VISA_CCV_LENGTH: 3,
    AMEX_CVV_LENGTH: 4
}

const errors = {
    INVALID_CHARCTERS: function(field_name) {
        return `${field_name} contains invalid characters!`;
    },
    FIELD_EMPTY: function(field_name) {
        return `${field_name} should not be empty!`;
    },
    TEXT_TOO_LONG: function(field_name, max_len) {
        return `${field_name} should not be longer than ${max_len} characters!`;
    },
    TEXT_TOO_SHORT: function(field_name, max_len) {
        return `${field_name} should not be shorter than ${max_len} characters!`;
    },
    DIGITS_ONLY: function(field_name) {
        return `${field_name} only accepts digits!`;
    },
    INVALID_INPUT: function(field_name) {
        return `Input data of ${field_name} is invalid!`;
    },
    CHECKSUM_FAILED: function() {
        return `Checksum wrong! Please check if you have input your card number correctly`;
    },
    FIXED_DIGITS: function(field_name, num) {
        return `${field_name} should be exactly ${num} digits long!`;
    }

}
class CreditCardInfo {
    constructor() {
        this.valid = false;

        /* data structure for customer info*/
        this.holder_name = ""; // Credit Holder's Name, type: string
        this.card_number = "" // type: string
        this.expire_month = 0; // type: number
        this.expire_year = 0; // type: number
        this.security_code = ""; // type: string, CCV / CVV / CCV2, mostly 3-4 digits
        
        // card types
        this._card_type = creditCardTypes.OTHERS;

        this.validation_errors = {};
    }

    _set_validation_error(key, value) {
        this.validation_errors[key] = value;
    }

    _clear_validation_error(key) {
        delete this.validation_errors[key];
    }

    /** Luhn Algorithm of checking credit card's number */
    _luhn_check_credit_number(card_number) {
        card_number = String(card_number);
        // ref: https://www.freeformatter.com/credit-card-number-generator-validator.html
        let digit_nums = [];
        let checksum_bit = null;
        let checksum = 0;
        // step 1,2: pick out last digit and reverse
        let len = card_number.length;
        for(let i=0;i<len;i++)
        {
            digit_nums.push(parseInt(card_number[ len - i -1 ]));
        }
        checksum_bit = digit_nums[0];
        digit_nums.shift();
    
        // step 3, 4: multiple odd numbers by 2 and substract by 9 if larger than 9
        for(let i=0;i<digit_nums.length;i++)
        {
            let item = digit_nums[i];
            if(i % 2 == 0) {
                item = item * 2;
                if(item > 9) {
                    item = item - 9;
                }
                digit_nums[i] = item;
            }

            checksum += digit_nums[i];
        }
    
        if(10 - (checksum % 10)  == checksum_bit) {
            return true;
        } else {
            return false;
        }
    }

    /** luckily, we only have to detect 3 card types */
    // we have to look at the prefix of credit card to know which type is the card
    // ref: https://www.freeformatter.com/credit-card-number-generator-validator.html    
    _detect_check_card_type(card_number) {
        if(/^4/.test(card_number)) {
            this._card_type = creditCardTypes.VISA;
        } else if(/^(51|52|53|54|55)/.test(card_number)) {
            this._card_type = creditCardTypes.MASTER;
        } else if(/^(34|37)/.test(card_number)) {
            this._card_type = creditCardTypes.AMEX;
        } else {
            this._card_type = creditCardTypes.OTHERS;
        }
    }

    // holder name validation
    set_holder_name(name) {
        this._clear_validation_error("holder_name");
        if(name == null || name == "")
        {
            this._set_validation_error("holder_name", errors.FIELD_EMPTY("Holder Name"));
        }
        else if(! /^[A-Z \'\-\.]+$/.test(name) )
        {
            this._set_validation_error("holder_name", errors.INVALID_CHARCTERS("Holder Name"));
        }
        else if( name.length > validations.HOLDER_NAME_MAX_LENGTH )
        {
            this._set_validation_error("holder_name", errors.TEXT_TOO_LONG("Holder Name", validations.HOLDER_NAME_MAX_LENGTH));
        }

        if(this.validation_errors["holder_name"] == null)
        {
            this.holder_name = name;
        }
    }

    set_card_number(card_number) {
        this._clear_validation_error("card_number");

        if(card_number == null || card_number == "")
        {
            this._set_validation_error("card_number", errors.FIELD_EMPTY("Card Number"));
        }
        else {
            let _card_number = String(card_number);

            if(!/^[0-9]+$/.test(_card_number)) {
                this._set_validation_error("card_number", errors.DIGITS_ONLY("Card Number"));
                return ;
            }

            this._detect_check_card_type(_card_number);

            if(! this._luhn_check_credit_number(_card_number) ) {
                this._set_validation_error("card_number", errors.CHECKSUM_FAILED());
            }
            else if( _card_number.length < validations.CARD_NUMBER_MIN) {
                this._set_validation_error("card_number", errors.TEXT_TOO_SHORT("Card Number", validations.CARD_NUMBER_MIN));
            }
            else if( _card_number.length > validations.CARD_NUMBER_MAX ) {
                this._set_validation_error("card_number", errors.TEXT_TOO_LONG("Card Number", validations.CARD_NUMBER_MAX));
            }

            if(this.validation_errors["card_number"] == null)
            {
                this.card_number = _card_number;
            }
        }
    }

    set_expire_month(month) {

        const _zeropad = (num) => {
            if(num < 10){
                return "0" + num;
            }else {
                var _num = String(num);
                var len = _num.length;
                // last two digits
                return _num[len-2] + _num[len-1];
            }
        }
        
        this._clear_validation_error("expire_month");
        let valid_month = [];

        // 01, 02, 03, ... 12
        for(let i=1;i<=12;i++) {
            valid_month.push(_zeropad(i));
        }

        if(month == null || month == "")
        {
            this._set_validation_error("expire_month", errors.FIELD_EMPTY("Expire Month"));
        }
        else if(valid_month.indexOf(month) < 0)
        {
            this._set_validation_error("expire_month", errors.INVALID_INPUT("Expire Month"));
        }
        
        if(this.validation_errors["expire_month"] == null) {
            this.expire_month = month;
        }
    }

    set_expire_year(year) {
        this._clear_validation_error("expire_year");
        let valid_year = [];

        let date = new Date();
        let start_year = date.getFullYear() % 100;

        for(let j=start_year;j<=start_year + 10;j++) // only last for 10 years
        {
            valid_year.push(String(j % 100));
        }

        if(year == null || year == "")
        {
            this._set_validation_error("expire_year", errors.FIELD_EMPTY("Expire Year"));
        }
        else if(valid_year.indexOf(year) < 0)
        {
            this._set_validation_error("expire_year", errors.INVALID_INPUT("Expire Year"));
        }

        if(this.validation_errors["expire_year"] == null)
        {
            this.expire_year = year;
        }
    }

    set_security_code(ccv) {
        this._clear_validation_error("security_code");
        if(ccv == null || ccv == "")
        {
            this._set_validation_error("security_code", errors.FIELD_EMPTY("Security Code"));
        }
        else
        {   
            ccv = String(ccv);
            if( !/^[0-9]+$/.test(ccv)) {
                this._set_validation_error("security_code", errors.DIGITS_ONLY("Security Code"));
            }

            switch(this._card_type) {
                case creditCardTypes.MASTER:
                case creditCardTypes.VISA:
                    if(ccv.length != validations.VISA_CCV_LENGTH) {
                        this._set_validation_error("security_code", errors.FIXED_DIGITS("Security Code", validations.VISA_CCV_LENGTH));
                    }
                    break;
                case creditCardTypes.AMEX:
                    if(ccv.length != validations.AMEX_CVV_LENGTH) {
                        this._set_validation_error("security_code", errors.FIXED_DIGITS("Security Code", validations.AMEX_CVV_LENGTH));
                    }
                    break;
                default:
                    if(ccv.length !== validations.AMEX_CVV_LENGTH && ccv.length !== validations.VISA_CCV_LENGTH) {
                        this._set_validation_error("security_code", "Security Code should be 3 or 4 digits long!");
                    }
                    break;
            }

            if(this.validation_errors["security_code"] == null) {
                this.security_code = ccv;
            }
        }
    }

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
                holder_name: this.holder_name,
                card_number: this.card_number,
                expire : {
                    month: this.expire_month,
                    year: this.expire_year
                },
                security_code: this.security_code
            };

            return _model;
        }
        else
        {
            return null;
        }
    }

    // clear data
    // P.S.: According to PCI, CCV should not be stored ANYWHERE except submitting to server!
    // Thus it's paramount to call this function after submit to clear it from memory!
    dispose() {
        this.holder_name = "";
        this.card_number = "";
        this.expire_month = null;
        this.expire_year = null;
        this.security_code = null;

        this._card_type = creditCardTypes.OTHERS;
    }
}

module.exports = CreditCardInfo;