const app = require("./server");
const utils = require("./utils");

const PORT = 3862;
// register PORT to utils
utils.set_PORT(PORT);

app.listen(utils.get_PORT());

console.log(`Server successfully listen on PORT: ${PORT}`);