const braintree = require("braintree"),
      utils     = require("../utils");

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

    // create an transaction (that is, make a payment)
    sale(amount) {
        let self = this;
        let options = {
            "amount": amount,
            // TODO
        };
        return new Promise((resolve, reject) => {
            try {
                self.gateway.transaction.sale(options, (result, err) => {
                    if(result.success) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            } catch(e) {
                reject(e);
            }
        })
    }
};

module.exports = BrainTreeInterface;