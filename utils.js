// useful functions collection
// by DemoHn
// 2017/11/4

const fs = require("fs"),
    path = require("path");

const errors_dict = {
    500: "Fatal Error",
    600: "Validation Error"
}

let test_flag = false;
let ref_code_index = 0;

let PORT = 3862;

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
    }, 

    // generate brand new and random ref code for further tracking

    // ref_code structure:
    // [8-digit TIMESTAMP][8-digit INDEX][3-digit RANDNUM]
    generate_ref_code() {
        const _formatNumberLength = (num, length) => {
            var r = "" + num;
            while (r.length < length) {
                r = "0" + r;
            }
            return r;
        }

        let ref_code = "";
        // [8-digit TIMESTAMP]
        let date = new Date();
        ref_code += _formatNumberLength(date.getTime() % 1e8, 8);

        // [8-digit INDEX]
        ref_code += _formatNumberLength(ref_code_index, 8);
        ref_code_index += 1;

        // [3-digit RANDNUM]
        let rand_num = Math.floor(Math.random() * 1000) % 1000;
        ref_code += _formatNumberLength(rand_num, 3);

        return ref_code;
    },

    json_error(error_code, info) {
        let rtn = {
            "code": error_code,
            "info": info == null ? errors_dict[error_code] : info
        }
        return JSON.stringify(rtn);
    },

    json_success(info) {
        let rtn = {
            "code": 200,
            "info": info
        }

        return JSON.stringify(rtn);
    },

    set_test_flag(flag) {
        test_flag = flag;
    },

    get_test_flag() {
        return test_flag;
    },

    set_PORT(port) {
        PORT = port;
    },

    get_PORT() {
        return PORT;
    }
}