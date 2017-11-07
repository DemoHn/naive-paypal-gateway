const utils = require("../utils");

const RecordSearchValidator  = require("../validation/recordSearch");

let recordSearch = new RecordSearchValidator();

module.exports = {
    /**
     * @brief execute search 
     * @input payload = {
     *      search_type: "",
     *      search_keyword: ""
     * }
    */
    async validateSearchParams(payload) {
        recordSearch.set_search_type(payload["search_type"]);
        recordSearch.set_search_keyword(payload["search_keyword"]);

        let recordSearchErrors = recordSearch.get_validation_errors();

        if(recordSearchErrors == null) {
            return null;
        } else {
            return recordSearchErrors;
        }
    }
}