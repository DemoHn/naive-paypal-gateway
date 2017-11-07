const Koa    = require("koa"),
      fs     = require("fs"),
      path   = require("path"),
      static = require("koa-static"),
      Router = require("koa-router"),
      bodyParser = require('koa-bodyparser');

const paymentController = require("./controller/payment"),
      storeController   = require("./controller/store"),
      searchPaymentController = require("./controller/search"),

      utils = require("./utils");

const app = new Koa(),
      router = new Router();

// currently, we don't need page templates at all,
// so it just returns HTML files
const render = async (page, postfix) => {
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
                resolve(data);
            }
        })    
    });
}

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
    // TODO
    let req_body = ctx.request.body;

    if(req_body == null) {
        req_body = {};
    }

    try {
        let result = await paymentController.validate_payment_info(req_body);

        if(result != null) {
            ctx.body = utils.json_error(600, result);
            return ;
        } else {
            // continue
            let submit_info = await paymentController.submit();
            ctx.body = utils.json_success("submit success");
        }
    } catch(e) {
        console.log(e);
        ctx.body = utils.json_error(500, "Fatal Error");
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