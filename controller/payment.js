const utils = require("../utils");
const CustomerInfoValidator = require("../validation/customerInfo");
const CredtiCardInfoValidator = require("../validation/creditcardInfo");
const PayPalInterface = require("../interface/paypal");
const BrainTreeInterface = require("../interface/braintree");
const OrderInfo = require("../model/orderInfo");

const paymentMethod = {
    BRAINTREE: "braintree",
    PAYPAL: "paypal"
};

class PaymentController {

    static get paymentMethod() {
        return paymentMethod;
    }

    constructor() {
        this.customerInfo = new CustomerInfoValidator();
        this.creditcardInfo = new CredtiCardInfoValidator();

        this.paypalInterface = new PayPalInterface("sandbox");
        this.braintreeInterface = new BrainTreeInterface("sandbox");
    }

    getPaymentType(currency) {
        const paypalCurrencies = ["USD", "EUR", "AUD"],
                braintreeCurrenies = ["HKD", "JPY", "CNY"];

        if(paypalCurrencies.indexOf(currency) >= 0) {
            return paymentMethod.PAYPAL;
        } else if(braintreeCurrenies.indexOf(currency) >= 0) {
            return paymentMethod.BRAINTREE;
        } else {
            return paymentMethod.BRAINTREE;
        }
    }

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
     * @return null or validation error object
    */
    async validatePaymentInfo(payload) {
        
        let customerInfo = this.customerInfo;
        let creditcardInfo = this.creditcardInfo;
        
        let customerInfoErrors = null;
        let creditcardInfoErrors = null;

        customerInfo.set_first_name(payload["first_name"]);
        customerInfo.set_last_name(payload["last_name"]);
        customerInfo.set_phone(payload["country_code"], payload["phone_number"]);
        customerInfo.set_price_amount(payload["currency"], payload["price"]);
        customerInfoErrors = customerInfo.get_validation_errors(); // null or [Object]
        
        // Only braintree will check creedit card info
        if( this.getPaymentType(customerInfo.currency) == paymentMethod.BRAINTREE) {
            creditcardInfo.set_holder_name(payload["holder_name"]);
            // Notice set card number should be before set security code
            creditcardInfo.set_card_number(payload["card_number"]);
            creditcardInfo.set_expire_month(payload["expire_month"]);
            creditcardInfo.set_expire_year(payload["expire_year"]);
            creditcardInfo.set_security_code(payload["security_code"]);
            creditcardInfoErrors = creditcardInfo.get_validation_errors();
        }
        
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
    }

    exportOrderInfo(ref_code) {
        let info = new OrderInfo(this.customerInfo);
        info.set_ref_code(ref_code);

        return info;
    }

    validateAMEXinUSDrule() {
        if(this.customerInfo.currency !== "USD" && 
            this.creditcardInfo.get_card_type() === "AmericanExpress") {
            return false;
        } else {
            return true;
        }
    }
    /**
     * @brief submit payment
     * For braintree, since we use direct pay, just return payment result
     * For paypal, return redirect link for pop-up paypal-payment page
     * 
     * @return 
     * [paypal]
     * return_data = {
     *      method: "paypal",
     *      status: "success",
     *      redirect_url: <URL>
     * };
     * 
     * [braintree]
     * return_data = {
     *      method: "braintree", 
     *      status: "success",
     *      ref_code: ref_code
     * }
    */
    
    async submitPayment(refCode) {
        let _model = {
            method: "",
        }
        // TODO: add paypal support
        try {
            if(this.getPaymentType(this.customerInfo.currency) == paymentMethod.PAYPAL) {
                _model.method = paymentMethod.PAYPAL;
                let result = await this.paypalInterface.createPayment(this.customerInfo, this.creditcardInfo, refCode);    
                
                _model["redirect_url"] = result["redirect_url"];
                _model["status"] = result["status"];
                
            } else if(this.getPaymentType(this.customerInfo.currency) == paymentMethod.BRAINTREE) {
                _model.method = paymentMethod.BRAINTREE;
                let result = await this.braintreeInterface.createPayment(this.customerInfo, this.creditcardInfo);
                
                if(result != null && result["success"] == true) {
                    _model["status"] = "success";
                } else {
                    _model["status"] = "fail";
                }

                _model["ref_code"] = refCode;
            }
            
            this.customerInfo.dispose();
            this.creditcardInfo.dispose(); // clear data in memory

            return Promise.resolve(_model);
            
        } catch(e) {

            this.customerInfo.dispose();
            this.creditcardInfo.dispose(); // clear data in memory

            return Promise.reject(e);
        }
    }

    executePaypalPayment(payment_id, payer_id) {
        return this.paypalInterface.executePayment(payment_id, payer_id);
    }
}

module.exports = PaymentController;