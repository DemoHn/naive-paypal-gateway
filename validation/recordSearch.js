/**
 * Validation Check for search input of payment check page.
 * Only all values are checked successfully will export search params.
 * Otherwise, Exceptions will throw out.
 */

const utils = require("../utils");

const errors = {
    FIELD_EMPTY: function(field_name) {
        return `${field_name} should not be empty!`;
    },
    INVALID_DATA: function(field_name) {
        return `Input data of ${field_name} is invalid!`;
    },
    TEXT_TOO_LONG: function(field_name, max_len) {
        return `${field_name} should not be longer than ${max_len} characters!`;
    }
};

const validations = {
    SEARCH_STRING_MAX: 128
};

const searchType = {
    NAME: "name",
    REF_CODE: "ref_code"
};

class RecordSearch {

    static get searchType() {
        return searchType;
    }

    constructor() {
        /* data structure */
        this.search_type = null;
        this.search_keyword = "";

        this.validation_errors = {};
    }

    _set_validation_error(key, value) {
        this.validation_errors[key] = value;
    }

    _clear_validation_error(key) {
        delete this.validation_errors[key];
    }

    set_search_type(type) {
        this._clear_validation_error("search_type");

        if(type == null || type == "") {
            this._set_validation_error("search_type", errors.FIELD_EMPTY("Search Type"));
        } else if(type !== searchType.NAME && type !== searchType.REF_CODE) {
            this._set_validation_error("search_type", errros.INVALID_DATA("Search Type"));
        } else {
            this.search_type = type;
        }
    }

    set_search_keyword(keyword) {
        this._clear_validation_error("search_keyword");

        if(keyword == null) {
            this._set_validation_error("search_keyword", errors.FIELD_EMPTY("Search keyword"));
        } else {
            keyword = String(keyword);
            if(keyword.length > validations.SEARCH_STRING_MAX) {
                this._set_validation_error("search_keyword", errors.TEXT_TOO_LONG("Search keyword", validations.SEARCH_STRING_MAX));
            } else {
                this.search_keyword = keyword;
            }
        }
    }
    
    get_validation_errors() {
        if(Object.keys(this.validation_errors).length == 0)
        {
            return null;
        }
        else 
        {
            return this.validation_errors;
        }
    }

    export() {
        if(Object.keys(this.validation_errors).length == 0) {
            var _model = {
                search_type: this.search_type,
                search_keyword: this.search_keyword
            };
            return _model;
        } else {
            return null;
        }
    }
}

module.exports = RecordSearch;