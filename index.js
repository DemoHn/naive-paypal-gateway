const Koa    = require("koa"),
      fs     = require("fs"),
      path   = require("path"),
      static = require("koa-static"),
      Router = require("koa-router");

const app = new Koa(),
      router = new Router();

const PORT = 3862;

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

router.get('/check_payment', async (ctx) => {
    ctx.body = await render("check_payment");
});

router.get('/404', async (ctx) => {
    ctx.body = await render("404");
});

// static file
app.use(static(
    path.join(__dirname, "static")
));

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT);

console.log(`Server successfully listen on PORT: ${PORT}.`);