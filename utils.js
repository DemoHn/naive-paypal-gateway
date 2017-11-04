// useful functions collection
// by DemoHn
// 2017/11/4

const fs = require("fs"),
    path = require("path");

module.exports = {
    load_config_file() {
        const account_info_config = path.join(__dirname, "ACCOUNT_INFO.json");
        if(fs.existsSync(account_info_config))
        {
            try {
                let data = fs.readFileSync(account_info_config, {encoding:'utf8'});
                return JSON.parse(data);
            }
            catch(e)
            {
                throw e;
            }
        }
        else
        {
            console.log("[LOG] config file not found!");
            console.log("[LOG] Maybe you forget to rename ACCOUNT_INFO.json.sample to ACCOUNT_INFO.json?");
            throw "config file not found!";
        }
    } 
}