const utils = require("../utils");
const CustomerInfo = require("../validation/customerInfo");
const CredtiCardInfo = require("../validation/creditcardInfo");

let customerInfo = new CustomerInfo();
let creditcardInfo = new CredtiCardInfo();

module.exports = {
    /**
     * @brief check whether input info are valid or not
     * @input validation payload = {
     *      first_name: "",
     *      last_name: "",
     *      country_code: "",
     *      phone_number: "",
     *      currency: "",
     *      price: "",
     *      // credit card info
     *      holder_name: "",
     *      card_number: "",
     *      expire_month: "",
     *      expire_year: "",
     *      security_code: ""
     * }
     * 
     * @return null or validation error objec
    */
    async validate_payment_info(payload) {

        customerInfo.set_first_name(payload["first_name"]);
        customerInfo.set_last_name(payload["last_name"]);
        customerInfo.set_phone(payload["country_code"], payload["phone_number"]);
        customerInfo.set_price_amount(payload["currency"], payload["price"]);
        
        creditcardInfo.set_holder_name(payload["holder_name"]);
        // Notice set card number should be before set security code
        creditcardInfo.set_card_number(payload["card_number"]);
        creditcardInfo.set_expire_month(payload["expire_month"]);
        creditcardInfo.set_expire_year(payload["expire_year"]);
        creditcardInfo.set_security_code(payload["security_code"]);

        let customerInfoErrors = customerInfo.get_validation_errors(); // null or [Object]
        let creditcardInfoErrors = creditcardInfo.get_validation_errors();

        if(customerInfoErrors == null && creditcardInfoErrors == null) {
            return null;
        } else {
            let merged_json = {};
            for(let i in customerInfoErrors) {
                merged_json[i] = customerInfoErrors[i];
            }
            
            for(let j in creditcardInfoErrors) {
                merged_json[j] = creditcardInfoErrors[j];
            }

            return merged_json;
        }
    },

    async submit() {

    }
}
