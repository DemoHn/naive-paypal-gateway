/**
 * Validation Check for user-input credit card value
 * Only all values are checked successfully will export customer info.
 * Otherwise, Exceptions will throw out.
 */

const utils = require("../utils");

class CreditCardInfo {
    constructor() {
        this.valid = false;

        /* data structure for customer info*/
        this.name = ""; // Credit Holder's Name, type: string
        this.card_number = "" // type: string
        this.expiration = {
            "month": 0, // type: number
            "year": 0 // type: number
        };
        this.ccv = ""; // type: string, CCV / CVV / CCV2, mostly 3-4 digits
        
        // card types
        this._card_type = null;
    }

    // TODO
    set_name(name) {

    }

    set_card_number() {

    }

    set_expiration(month, year) {

    }

    set_ccv(ccv) {

    }

    // export data for further usages
    export() {

    }
}

module.exports = CustomerInfo;