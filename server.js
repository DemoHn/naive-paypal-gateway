const Koa    = require("koa"),
      fs     = require("fs"),
      path   = require("path"),
      ejs    = require("ejs"),
      static = require("koa-static"),
      Router = require("koa-router"),
      bodyParser = require('koa-bodyparser');

const PaymentController = require("./controller/payment"),
      storeController   = require("./controller/store"),
      searchPaymentController = require("./controller/search"),
      OrderInfo = require("./model/orderInfo"),
      utils = require("./utils");

const app = new Koa(),
      router = new Router();

// currently, we don't need page templates at all,
// so it just returns HTML files
// 
const render = async (page, postfix, ejs_params) => {
    const viewDir = "view";
    if( !postfix ) {
        postfix = "html";
    }
    var filename = `${page}.${postfix}`;
    let pageFile = path.join(__dirname, viewDir, filename);

    return new Promise((resolve, reject) => {
        fs.readFile(pageFile, {encoding: "utf8"}, (err, data) => {
            if(err) {
                reject(err);
            } else {
                if(ejs_params) {
                    // use ejs as template engine
                    resolve(ejs.render(data, ejs_params));
                } else {
                    resolve(data);
                }
            }
        })    
    });
}
const paymentController = new PaymentController();

// views
router.get('/', async (ctx) => {
    ctx.body = await render("create_payment");
});

router.get('/create_payment', async (ctx) => {
    ctx.body = await render("create_payment");
});

router.get('/check_payment', async (ctx) => {
    ctx.body = await render("check_payment");
});

router.get("/hello_world", async (ctx) => {
    ctx.body = "Hello, World!";
});


router.get('/404', async (ctx) => {
    ctx.body = await render("404");
});

// API
router.post("/api/submit_payment", async (ctx) => {
    let req_body = ctx.request.body;

    if(req_body == null) {
        req_body = {};
    }

    try {
        let result = await paymentController.validatePaymentInfo(req_body);
        
        if(result != null) {
            ctx.body = utils.json_error(600, result);
        } else if( !paymentController.validateAMEXinUSDrule() ) { 
            ctx.body = utils.json_error(601, ""); // using AMEX card but not in USD
        } else {
            // continue
            // init REF code
            let ref_code = utils.generate_ref_code();
            
            // save order as PENDING
            let order_info = paymentController.exportOrderInfo(ref_code);
            await storeController.saveData(order_info);

            let rtn_data = await paymentController.submitPayment(ref_code);

            // braintree only
            if(rtn_data.method == "braintree") {
                if(rtn_data.status == "success") {
                    await storeController.modifyDictData(ref_code, "order_status", OrderInfo.orderStatus.SUCCESS); 
                } else {
                    await storeController.modifyDictData(ref_code, "order_status", OrderInfo.orderStatus.FAIL);
                }
            }
            ctx.body = utils.json_success(rtn_data);
        }
    } catch(e) {
        console.log(e)
        ctx.body = utils.json_error(500, "Fatal Error");
    }
});

// Paypal payment page
router.get("/paypal_payment/:ref_code/:status", async (ctx) => {
    let status = ctx.params.status;
    let ref_code = ctx.params.ref_code;

    let payment_id = ctx.query["paymentId"];
    let payer_id = ctx.query["PayerID"];

    let render_dict = {
        success: status === "success",
        ref_code: ref_code,
        customer_name: "",
        price: ""
    };

    try {
        let data = await storeController.getDictData(ref_code);
    
        render_dict.customer_name = data.name;
        render_dict.price = data.price;

        // if so, there must be fatal errors
        // return error directly, no need to go on.
        if(payment_id == null || payer_id == null) {
            render_dict.success = false;
            await storeController.modifyDictData(ref_code, "order_status", OrderInfo.orderStatus.FAIL);
            ctx.body = await render("paypal_payment_status", "html", render_dict);
            return ;
        }

        let info = await paymentController.executePaypalPayment(payment_id, payer_id);
        
        if(info.state == "success") {
            await storeController.modifyDictData(ref_code, "order_status", OrderInfo.orderStatus.SUCCESS);
            ctx.body = await render("paypal_payment_status", "html", render_dict); 
        } else {
            render_dict.success = false;
            await storeController.modifyDictData(ref_code, "order_status", OrderInfo.orderStatus.FAIL);
            ctx.body = await render("paypal_payment_status", "html", render_dict);
        }
    } catch(e) {

        render_dict.success = false;
        await storeController.modifyDictData(ref_code, "order_status", OrderInfo.orderStatus.FAIL);
        ctx.body = await render("paypal_payment_status", "html", render_dict);
    }
});

// check payment info
/** GET /search_payment_record
 * 
 * Notice: if search_keyword is null, then list all payment records.
 * @param search_keyword search keyword
 * @param search_type search type
 * @param cursor cursor
 * @param limit limit
*/
router.get("/api/search_payment_record", async (ctx) => {
    let cursor = ctx.query.cursor == null ? "0" : ctx.query.cursor;
    let search_keyword = ctx.query.search_keyword == null ? "" : ctx.query.search_keyword;
    let limit = ctx.query.limit == null ? 10 : ctx.query.limit;
    let search_type = ctx.query.search_type;

    let payload = {
        search_keyword: search_keyword,
        search_type: search_type
    };

    try {
        let result = await searchPaymentController.validateSearchParams(payload);

        if(result != null) {
            ctx.body = utils.json_error(600, result);
        } else {
            if(search_keyword == "") {
                
                // list all data
                let data = await storeController.listData(cursor, limit);
                
                ctx.body = utils.json_success(data);
            } else if(search_type === "name" || search_type === "ref_code") {
                let data = await storeController.findData(search_type, search_keyword, cursor, limit);
                ctx.body = utils.json_success(data);
            } 
        }
    } catch (error) {
        console.log(error);
        ctx.body = utils.json_error(500, "Fatal Error!");
    }
});

// static file
app.use(static(
    path.join(__dirname, "static")
));

app.use(bodyParser())
    .use(router.routes())    
    .use(router.allowedMethods());

module.exports = app;