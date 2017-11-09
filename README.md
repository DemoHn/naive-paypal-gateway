# naive-paypal-gateway

This is a _young, simple and naive_ payment gateway application.   
Feel free to use it as an example of how to use PayPal API and BrainTree API.

## Install

1. Install Node.js.  
__Notice:__ The installed version of Node.js shall be higher than __v7.6__, since we use `async` and `await` keyword.  

Node v8.9 is recommended.

2. Install Redis
You can just download redis from its [official site](https://redis.io/) (for Linux) or [redis-windows](https://github.com/MicrosoftArchive/redis) (for Windows).  

Redis v3.x is recommended.
 
3. Clone the project and install dependencies:  

```
git clone https://github.com/DemoHn/naive-paypal-gateway
cd naive-paypal-gateway
npm install
```

## Config and Run
Since this application involves some private tokens, therefore you have to fill your own credentials to continue.

1. copy `ACCOUNT_INFO.json.sample` and rename it as `ACCOUNT_INFO.json`. Then open `ACCOUNT_INFO.json` and fill all required items.  

2. run redis server. Simply prompt `redis-server` to start.  

3. Prompt `npm start` to start the application.  

__Notice:__ The server will listen to `localhost:3862` by default.

## Test
The gateway contains some unittests.

Prompt `npm test` to run all unittests.

## Payment Process
The gateway supports both BrainTree and PayPal API.  
As requirement doc said, when payment currency is USD, AUD or EUR, use Paypal;  
If currency is JPY, CNY or HKD, use BrainTree instead.  

- __Paypal__
    Due to paypal limitation, that is, paypal has deprecated credit-card direct payment, when creating a new payment via Paypal, a new Paypal payment page is created.
    In that page, you're required to login Paypal and approve payment.  
    After approving payment, Paypal will redirect back, where reference code and customer info is being displayed.

    Obviously, you don't need to input additional info of credit card.

    Paypal supports cross-currency transaction. That is, for example, you can pay HK dollars to an USD account.

- __BrainTree__
    Differs from Paypal, BrainTree API supports credit card direct pay, which is officially encouraged by Paypal. Therefore, you have to input credit-card information.
    After submit, wait for some seconds, and a `lightbox (modal)` will pop-up showing whether this transaction succeed or not.

    However, presentment currency should be as same as settlement currency. This causes a big issue described in the following section. (Sad story).

## File structure
    ```
    +-- controller      [ massive-type operation controller ]
      |-- payment.js
      |-- search.js
      |-- store.js
    +-- interface       [ low-level Payment API encapsulation ]
      |-- braintree.js
      |-- paypal.js
    +-- model           [ data model in redis db ]
      |-- orderInfo.js
    +-- validation      [ user-input validators ]
      |-- creditcardInfo.js
      |-- customerIn.fo.js
      |-- recordSearch.js
    +-- static          [ frontend file ]
      ...
    +-- view            [ frontend HTML page ]
      ...
    +-- server.js       [ server main file ]
    +-- run-server.js   [ entry to run server.js ]
    +-- utils.js        [ utilty file ]

    ```
## API routes
    1. POST    /api/submit_payment
        ```
        @brief  Submit new payment request. 

        @param  first_name: customer's first name
        @param  last_name: customer's last name
        @param  country_code: country_code (e.g.: 86, 852, etc.)
        @param  phone_number: telephone number
        @param  currency: payment currency (HKD, CNY, JPY, AUD, USD, EUR)
        @param  price: price amount. up to 2-digits decimal (e.g.: 12.34)
                [optional for currency = HKD, CNY, JPY]
        @param  holder_name: credit card's holder name
        @param  card_number: credit card number
        @param  expire_month: credit card expire month (01, 02, 03, etc.)
        @param  expire_year: credit card expire year (17, 18, 19, etc.)
        @param  security_code: credit card CVV/ CCV/ CVV2. Usually 3-4 digits.

        @return 
        1)  code: 500  [Fatal Error]
            info: "Fatal Error"
        
        2)  code: 600  [Validation Error]
            info: {
                <input name>: <error message>
            }
        
        3)  code: 601  [AMEX Error: This error is triggered when trying to use AMEX card to pay non-USD payments]
            info: "AMEX Error"

        4)  code: 200 [Payment via Paypal success]
            info: {
                method: "paypal",
                status: "success" || "fail",
                redirect_url: <URL>
            }  

        5)  code: 200 [Payment via Braintree success]
            info: {
                method: "braintree",
                status: "success" || "fail",
                ref_code: <Reference Code>
            }
        ```

    2. GET    /paypal_payment/:ref_code/:status
    ```
        @brief  Paypal redirect back page.
                After user login paypal and approve payment, Paypal will automatically redirect user to this page.

        @param  <query>ref_code: reference code
        @param  <query>status: payment status (fail or success)
        @param  <param>PayerID: payer ID (generated from Paypal)
        @param  <param>paymentID: payment ID (generated from Paypal)

        @return  Paypal payment status page.
    ```
    
    3. GET    /api/search_payment_record
    ```
        @brief  Search payment record from redis cache by keywords.

        @param  search_keyword: search keyword. Notice if keyword is empty, it will return all record data.
        @param  search_type: search type. values are "name" or "ref_code"
        @param  limit: record data amount limit. Notice due to the feature of redis scan, the amount of record data is not strictly same as the number of limitation. 
        @param  cursor: search cursor. default is 0.
    ``` 

## Known Issues
- When create a payment via BrainTree API, currencies are controlled by BrainTree Account instead of user input. That is, for example, you think you have paid "HKD 10.00", however you actually paid "USD 10.00" if the BrainTree Account is an USD account!  

## Contribution

Forget it. It's just a test. :-)