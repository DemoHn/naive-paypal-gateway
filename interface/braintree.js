const braintree = require("braintree"),
      utils     = require("../utils"),
      CreditcardInfo = require("../validation/creditcardInfo"),
      CustomerInfo = require("../validation/customerInfo");

class BrainTreeInterface {
    constructor(env, timeout){
        this.credentials = {
            "environment": braintree.Environment.Sandbox,
            "merchantId": null,
            "publicKey": null,
            "privateKey": null
        };
        // gateway, assigned by braintree.connect();
        this.gateway = null;

        this.timeout = 10000;
        // set timout
        if(timeout != null) {
            this.timeout = timeout;
        }
        try {
            let config = utils.load_config_file();
            const valid_keys = ["merchantId", "publicKey", "privateKey"];

            // mapping from config -> internal credentials one by one
            if(config["braintree"] != null) {
                let config_braintree = config["braintree"];
                for(let index in valid_keys)
                {
                    let item = valid_keys[index];
                    this.credentials[item] = config_braintree[item];
                }
            } // else ? leave the credentials null =w=

        } catch(e) {
            throw e;
        }

        // sandbox, virtual account
        if(env === "sandbox") {
            this.credentials["environment"] = braintree.Environment.Sandbox;
        // production, actual account
        } else if(env === "production") {
            this.credentials["environment"] = braintree.Environment.Production;
        } else {
            console.warn(`[WARN] unknown environment '${env}' in BrainTreeGateway!`);
        }

        // connect()
        // trust me, the result will be 100% returned=w= 
        this.gateway = braintree.connect(this.credentials); 
    }

    /*
        APIs
        Notice: the following methods all return a Promise object.
        Thus when call them in Koa, don't forget to add "await".
    */

    // create a payment
    async createPayment(customerInfo, creditcardInfo) {
        // assert input
        if(!customerInfo instanceof CustomerInfo) {
            return Promise.reject(new Error("invalid customerInfo"));
        }

        if(!creditcardInfo instanceof CreditcardInfo) {
            return Promise.reject(new Error("invalid creditCard"));
        }

        let customer = customerInfo.export();
        let creditcard = creditcardInfo.export();

        if(customer == null || creditcard == null)
        {
            return Promise.reject(new Error("invalid customer or credit card data!"));
        }

        let first_two_letter_year = Math.floor((new Date()).getFullYear() / 100);
        let options = {
            amount: customer.amount,
            creditCard: {
                cardholderName: creditcard.holder_name,
                number: creditcard.card_number,
                expirationDate: `${creditcard.expire.month}/${first_two_letter_year}${creditcard.expire.year}`,
                cvv: creditcard.security_code,
            },
            customer: {
                firstName: customer.name.first_name,
                lastName: customer.name.last_name,
                phone: `${customer.phone.country_code}-${customer.phone.phone_number}`
            },
            options: {
                submitForSettlement: true
            }
        };
    
        try {
            this.gateway.transaction.sale(options, (result, err) => {
                if(result.success) {
                    return Promise.resolve(result);
                } else {
                    return Promise.reject(err);
                }
            });
        } catch(e) {
            return Promise.reject(e);
        }
    }
};

module.exports = BrainTreeInterface;