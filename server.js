const Koa    = require("koa"),
      fs     = require("fs"),
      path   = require("path"),
      static = require("koa-static"),
      Router = require("koa-router"),
      bodyParser = require('koa-bodyparser');

const paymentController = require("./controller/payment"),
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

// payment route
router.post("/submit_payment", async (ctx) => {
    // TODO
    let req_body = ctx.request.body;

    if(req_body == null) {
        req_body = {};
    }

    let result = await paymentController.validate_payment_info(req_body);
    if(result != null) {
        ctx.body = utils.json_error(600, result);
        return ;
    } else {
        // continue
        ctx.body = utils.json_success("validation success");
    }
});

router.get("/ss", async (ctx) => {
    let result = await paymentController.a();
    ctx.body = utils.json_success(result);
});

// static file
app.use(static(
    path.join(__dirname, "static")
));

app.use(bodyParser())
    .use(router.routes())    
    .use(router.allowedMethods());

module.exports = app;