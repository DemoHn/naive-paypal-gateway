const utils = require("../utils"),
    CreditcardInfo = require("../validation/creditcardInfo"),
    CustomerInfo = require("../validation/customerInfo");

const request = require("request-promise");

class PayPalInterface {
    constructor(env, timeout) {
        
        this.accessToken = null;
        this.env = "sandbox";
        this.timeout = 10000;

        // auth info
        this.root_uri = "";
        this.client_id = "";
        this.secret = "";

        // pending transaction
        this.pendingTransaction = {};

        if(timeout != null) {
            this.timeout = timeout;
        }

        if(this.env != null) {
            this.env = env;
        }

        try {
            let config = utils.load_config_file();
            
            if(config["paypal"] != null)
            {
                let config_paypal = config["paypal"];
                this.client_id = config_paypal["client_id"];
                this.secret = config_paypal["secret"];
            }
        } catch(e) {
            throw e;
        }

        this.initRootURL();
    }

    // helpers
    initRootURL() {
        if(this.env === "sandbox") {
            this.root_uri = "https://api.sandbox.paypal.com";
        } else if(this.env === "production") {
            this.root_uri = "https://api.paypal.com";
        }
    }

    getURL(route) {
        return this.root_uri + "/" + route;
    }

    appendPendingTransaction(payment_id, ref_code) {
        this.pendingTransaction[payment_id] = ref_code;
    }

    deletePendingTransaction(payment_id) {
        if(this.pendingTransaction[payment_id]) {
            delete this.pendingTransaction[payment_id];
        }
    }

    async getAccessToken() {
        const options = {
            method: "POST",
            uri: this.getURL("v1/oauth2/token"),
            form: {
                grant_type: "client_credentials"
            },
            auth: {
                "user": this.client_id,
                'pass': this.secret
            },
            timeout: this.timeout
        };

        let resp = null;
        let self = this;

        try {
            resp = await request(options);    
            let resp_json = JSON.parse(resp);

            self.accessToken = {
                "access_token": resp_json["access_token"],
                "app_id": resp_json["app_id"],
                "expires_in": resp_json["expires_in"],
                "create_time": (new Date()).getTime()
            };

            Promise.resolve(resp_json);
        } catch(e) {
            Promise.reject(e);
        }
    }

    /**
     * @brief Find if a token has been expired or not exist at all
     * @return true || false
    */
    tokenExpired() {
        if(this.accessToken == null || this.accessToken["access_token"] == null) {
            return true;
        } else {
            let currentTime = (new Date()).getTime();
            let expire_time = parseInt(this.accessToken.expires_in) * 1000; // millseconds
            let create_time = this.accessToken.create_time;
            if(create_time + expire_time > currentTime) {
                return false;
            } else {
                return true;
            }
        }
    }

    /**
     * @brief create a new payment and return payment id
     *        Different from BrianTree Different, using paypal API is much more compilcatedd:
     *        that is, you have to getToken first, then create a payment to redirect user to a new page,
     *        finally, user call approve payment to finish the transaction.
     * 
     * @notice we trust all properties in cutsomerInfo and creditcardINfo have been validated,
     *        thus we do not do further validation here!
     * 
     * @param customerInfo: customerInfo
     * @param creditcardInfo: creditcardInfo
     * 
     * @return info = {
     *      "status": "success" || "fail",
     *      "redirect_url": <URL>
     * }
    */
    async createPayment(customerInfo, creditcardInfo, refCode) {
        if(!customerInfo instanceof CustomerInfo) {
            return new Promise((resolve, reject) => { reject(new Error("invalid customerInfo")) } );
        }

        if(!creditcardInfo instanceof CreditcardInfo) {
            return new Promise((resolve, reject) => { reject(new Error("invalid CreditCard")) } );
        }

        // @return model
        let return_info = {
            "status": "",
            "redirect_url": ""
        };

        try {
            // if token expired, refresh it!
            if(this.tokenExpired()) {
                await this.getAccessToken();
            }

            // generate options
            let form_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "transactions": [{
                    "amount": {
                        "total": customerInfo.price,
                        "currency": customerInfo.currency,
                    },
                    "payment_options": {
                        "allowed_payment_method": "INSTANT_FUNDING_SOURCE"
                    }
                }],
                "redirect_urls": {
                    "return_url": `http://localhost:${utils.get_PORT()}/paypal_payment/${refCode}/success`,
                    "cancel_url": `http://localhost:${utils.get_PORT()}/paypal_payment/${refCode}/fail`
                }
            };

            // request options
            let options = {
                method: "POST",
                uri: this.getURL("v1/payments/payment"),
                headers: {
                    Authorization: `Bearer ${this.accessToken.access_token}`
                },
                json: form_json,
                tiemout: this.timeout
            };

            let resp = await request(options);
            if(resp.state === "created") {
                return_info.status = "success";

                this.appendPendingTransaction(return_info.id, refCode);

                for(let index in resp.links) {
                    if(resp.links[index]["rel"] == "approval_url") {
                        return_info.redirect_url = resp.links[index]["href"];
                        break;
                    }
                }
            } else {
                return_info.status = "fail";
            }
            return Promise.resolve(return_info);
        } catch(e) {
            return Promise.reject(e);
        }
    }

    /**
     *  @brief execute approve payment
     *  After redirect to Payment success Page, we have to call Paypal center that we have received money.
     *  Only after calling execution will paypal transfter money to my account.
     *  
     *  @param payment_id payment_id
     *  @param payer_id payer_id
    */
    async executePayment(payment_id, payer_id) {
        if(payment_id == null || payer_id == null) {
            return Promise.reject(new Error("invalid payment_id or payer_id!"));
        }
        // @return model
        let return_info = {
            "state": ""
        };
        try {
            // if token expired, refresh it!
            if(this.tokenExpired()) {
                await this.getAccessToken();
            }
            
            let form_json = {
                payer_id: payer_id
            };

            // request options
            let options = {
                method: "POST",
                uri: this.getURL(`v1/payments/payment/${payment_id}/execute`),
                headers: {
                    Authorization: `Bearer ${this.accessToken.access_token}`
                },
                json: form_json,
                tiemout: this.timeout
            };

            return new Promise((resolve, reject) => {
                request(options).then((resp) => {
                    if(resp.state === "approved") {
                        return_info.state = "success";
                    } else {
                        return_info.state = "failed";
                    }
                    resolve(return_info);
                }).catch((e) => {
                    reject(e);
                });
            });
            
        } catch(e) {
            return Promise.reject(e);
        }
    }
}

module.exports = PayPalInterface;