const utils = require("../utils");

const orderStatus = {
    SUCCESS: 0,
    FAIL: 1
};

class OrderInfo {

    static get orderStatus() {
        return orderStatus;
    }
    constructor(first_name, last_name, country_code, phone_number, currency, price) {
        this._first_name = first_name == null ? "" : first_name;
        this._last_name = last_name == null ? "" : last_name;
        this._country_code = country_code == null ? "" : country_code;
        this._phone_number = phone_number == null ? "" : phone_number;
        this._currency = currency == null ? "" : currency;
        this._price = price == null ? "" : price;

        // actual data to be stored
        this.ref_code = "";
        this.order_status = orderStatus.SUCCESS;
        this.name = `${this._first_name} ${this._last_name}`;
        this.phone = `${this._country_code}-${this._phone_number}`;
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