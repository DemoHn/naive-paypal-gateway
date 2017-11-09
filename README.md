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


## Known Issues
- BrainTree API

## Contribution

Forget it. It's just a test. :-)