const utils = require("../utils");

const request = require("request-promise");

class PayPalInterface {
    constructor(env, timeout) {
        this.accessToken = null;
        this.env = "sandbox";
        this.timeout = 10000;

        this.root_uri = "";
        this.client_id = "";
        this.secret = "";

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
                "expire_in": resp_json["expire"]
            };

            Promise.resolve(resp_json);
        } catch(e) {
            Promise.reject(e);
        }
    }

    async createPayment() {
        const options = {
            method: "POST"
        };   

        // TODO
    }
}

module.exports = PayPalInterface;