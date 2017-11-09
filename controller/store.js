const OrderInfo = require("../model/orderInfo");
const redis     = require("redis");
const Datastore = require("nedb");
const path      = require("path");


// global variables
/** if there's any problem, let it crash at beginning */
// redis configuration
let client = redis.createClient();
client.on("error", (e) => {
    throw e;
});

// nedb configuration
let db = new Datastore({filename: path.join(__dirname, "../db", "customer_info.db") })


const REF_prefix = "REF_";
const NAME_prefix = "NAME_";
/** store redis data */
const storeRedisData = {
    /**
     * There are 4 parts of redis storage:
     * 
     * 1) refCode dictionary: Hash Map, REF_{$ref_code} => order_status, name, phone, price
     * 2) name list: List, NAME_{$name} => [ref_code, ref_code2]
     * 3) name index set (for search): "ALL_name" => [name1, name2]
     * 4) ref_code index set (for search): "ALL_ref_code" => [ref_code1, ref_code2] 
    */
    async add_ref_dict(info){
        return new Promise((resolve, reject) => {
            if(! info instanceof OrderInfo) {
                reject(new Error("invalid input!"));
            }

            client.hmset([REF_prefix + info.ref_code, "name", info.name, "phone", info.phone, "price", info.price, "order_status", info.order_status], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    },

    async add_name_list(info) {
        return new Promise((resolve, reject) => {
            if(! info instanceof OrderInfo) {
                reject(new Error("invalid input!"));
            }
            client.lpush([NAME_prefix + info.name, info.ref_code], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    },

    async add_name_index(info){
        return new Promise((resolve, reject) => {
            if(! info instanceof OrderInfo) {
                reject(new Error("invalid input!"));
            }
            
            client.sadd(["ALL_name", info.name], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    },

    async add_ref_code_index(info) {
        return new Promise((resolve, reject) => {
            if(! info instanceof OrderInfo) {
                reject(new Error("invalid input!"));
            }
            
            client.sadd(["ALL_ref_code", info.ref_code], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    }
};

// TODO
const rollbackRedisData = {

};

const findRedisData = {
    async find_by_ref_code(ref_code, cursor = "0", limit = 100) {
        return new Promise((resolve, reject) => {
            client.sscan(["ALL_ref_code", cursor, "match", `*${ref_code}*`, "count", limit], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    },

    async find_by_name(name, cursor = "0", limit = 100) {
        return new Promise((resolve, reject) => {
            client.sscan(["ALL_name", cursor, "match", `*${name}*`, "count", limit], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    },

    async get_item_by_ref_code(ref_code) {
        return new Promise((resolve, reject) => {
            client.hgetall([REF_prefix + ref_code], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    },

    async get_ref_code_list_by_name(name) {
        return new Promise((resolve, reject) => {
            client.lrange([NAME_prefix + name, 0, -1], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });
    },

    async list_all_ref_code(cursor = "0", limit = 100) {
        return new Promise((resolve, reject) => {
            client.scan([cursor, "match", "REF_*", "count", limit], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            })
        });
    }
}

/** acutal methods */
module.exports = {
    
    async saveData(info) {
        try {
            await storeRedisData.add_name_index(info);
            await storeRedisData.add_ref_code_index(info);
            await storeRedisData.add_name_list(info);
            await storeRedisData.add_ref_dict(info);

            return Promise.resolve(null);
        } catch(e) {
            return Promise.reject(e);
        }
    },

    /** list all data*/
    async listData(cursor = "0", limit = 100) {
        let data_list = {
            cursor: cursor,
            data: {}
        };

        try {
            let replies = await findRedisData.list_all_ref_code(cursor, limit);
            data_list.cursor = replies[0];

            let ref_code_list = replies[1];

            for(let index in ref_code_list) {
                let ref_code = ref_code_list[index];
                let true_ref_code = ref_code.substr(REF_prefix.length);
                let r = await findRedisData.get_item_by_ref_code(true_ref_code);
                
                data_list.data[true_ref_code] = r;
            }
            
            return Promise.resolve(data_list);
        } catch(e) {
            return Promise.reject(e);
        }
    },

    /**
     * find data by conditaion
     * 
     * @params type: search type, "name" || "ref_code"
    */
    async findData(type, pattern, cursor = "0", limit = 100) {
        /** always use */
        let data_list = {
            cursor: cursor,
            data: {}
        };

        if(type != "name" && type != "ref_code") {
            return Promise.reject(new Error(`invalid type '${type}'!`));
        }
        
        try {
            let name_list = [];
            let ref_code_list = [];
            if(type == "name") {
                let replies = await findRedisData.find_by_name(pattern, cursor, limit);
                // set cursor for next search
                data_list.cursor = replies[0];

                let content = replies[1];

                for(let i=0;i<content.length;i++) {
                    name_list.push(content[i]);
                }

                // get name list
                for(let index in name_list) {
                    let rep = await findRedisData.get_ref_code_list_by_name(name_list[index]);
                    
                    rep.forEach((ref_code) => {
                        ref_code_list.push(ref_code);
                    })
                }

                // extract data from ref_code
                for(let index in ref_code_list) {
                    let ref_code = ref_code_list[index];

                    let r = await findRedisData.get_item_by_ref_code(ref_code);
                    
                    data_list.data[ref_code] = r;
                }

                return Promise.resolve(data_list);
            } else if(type == "ref_code") {
                let replies = await findRedisData.find_by_ref_code(pattern, cursor, limit);
                data_list.cursor = replies[0];

                replies[1].forEach((ref_code) => {
                    ref_code_list.push(ref_code);
                });

                // extract data from ref_code
                for(let index in ref_code_list) {
                    let ref_code = ref_code_list[index];

                    let r = await findRedisData.get_item_by_ref_code(ref_code);
                    
                    data_list.data[ref_code] = r;
                }

                return Promise.resolve(data_list);
            }
        } catch(e) {
            return Promise.reject(e);
        }
    },

    async modifyDictData(ref_code, key, new_data) {
        return new Promise((resolve, reject) => {
            client.hset([REF_prefix + ref_code, key, new_data], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(null);
                }
            })
        });
    },

    async getDictData(ref_code) {
        return new Promise((resolve, reject) => {
            client.hgetall([REF_prefix + ref_code], (err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(replies);
                }
            })
        });
    },

    // clear all data in redis
    // Just for test usage, If not necessary, plz DO NOT try
    async flushAll() {
        return new Promise((resolve, reject) => {
            client.flushall((err, replies) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(null);
                }
            })
        });
    }
};