# naive-paypal-gateway

This is a _young, simple and naive_ payment gateway application.   
Feel free to regard it as an example of how to use PayPal API.

## Install

First, install Node.js and Redis as dependencies.  
__Notice:__ The installed version of Node.js shall be higher than __v7.6__, since we use `async` and `await` grammer.
Nodejs v8.9 is recommended.

Then, prompt those command to install it:  

```
git clone https://github.com/DemoHn/naive-paypal-gateway
cd naive-paypal-gateway
npm install
```

## Config and Run
Since this application involves some private tokens, therefore you have to fill your own credentials to continue.  
copy `ACCOUNT_INFO.json.sample` -> `ACCOUNT_INFO.json`. Then open `ACCOUNT_INFO.json` fill-in all required tokens.  

Next, prompt `npm start` to start the application.  
The server will listen to `localhost:3862` by default.

## Contribution

Forget it, I have no further plan to maintain it :-)