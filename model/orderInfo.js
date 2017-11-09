const utils = require("../utils");

const orderStatus = {
    SUCCESS: 0,
    FAIL: 1,
    PENDING: 2
};

class OrderInfo {

    static get orderStatus() {
        return orderStatus;
    }

    constructor(customerInfo) {
        this._first_name = customerInfo.first_name;
        this._last_name = customerInfo.last_name;
        this._country_code = customerInfo.country_code;
        this._phone_number = customerInfo.phone_number;
        this._currency = customerInfo.currency;
        this._price = customerInfo.price;

        // actual data to be stored
        this.ref_code = "";
        this.order_status = orderStatus.PENDING;
        this.name = `${this._first_name} ${this._last_name}`;
        this.phone = `(+${this._country_code}) ${this._phone_number}`;
        this.price = `${this._currency} ${this._price}`;
    }

    set_ref_code(ref_code){
        this.ref_code = ref_code;
    }

    set_order_status(order_status) {
        this.order_status = order_status;
    }
}

module.exports = OrderInfo;