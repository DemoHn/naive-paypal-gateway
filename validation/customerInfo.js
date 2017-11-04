/**
 * Validation Check for user-input customer value
 * Only all values are checked successfully will export customer info.
 * Otherwise, Exceptions will throw out.
 */

const utils = require("../utils");

const supportCurrencies = ["HKD", "USD", "AUD", "EUR", "JPY", "CNY"];

class CustomerInfo {
    constructor() {
        this.valid = false;

        /* data structure for customer info*/
        this.name = {
            "first_name": "", // type: string
            "last_name": "" // type: string 
        }; 
        this.phone = {
            "area_code": null, // type: number
            "number": null // type: number
        };
        this.currency = ""; // one of array:supportCurrencies
        this.price = 0.00; // price amount (a float number)
    }

    // TODO
    set_name(name) {

    }

    set_phone(area_code, number) {

    }

    set_currency(currency) {

    }

    set_price(price) {

    }

    // export data for further usages
    export() {

    }
}

module.exports = CustomerInfo;