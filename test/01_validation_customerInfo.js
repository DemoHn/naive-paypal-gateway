const expect = require('chai').expect;
const supertest = require('supertest');
const app = require("../server");

describe('Form Validation: Customer Info', () => {
    
    let server;
    let request;

    // start server
    before(() => {
        server = app.listen(3961);
        request = supertest(server);
    });

    describe('First Name', () => {

        it('should trigger error: not empty', (done) => {
            request.post("/submit_payment")
                .send({"first_name": ""})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["first_name"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: text too long', (done) => {
            let long_text = "";
            for(let i=0;i<200;i++) { long_text += "f"; }

            request.post("/submit_payment")
                .send({"first_name": long_text})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["first_name"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it("should pass validation", (done) => {
            let normal_first_name = "Peter";
            request.post("/submit_payment")
                .send({"first_name": normal_first_name})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if(data.info["first_name"] != null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });
    });

    describe('Last Name', () => {
        it('should trigger error: not empty', (done) => {
            request.post("/submit_payment")
                .send({"last_name": ""})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["last_name"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: text too long', (done) => {
            let long_text = "";
            for(let i=0;i<200;i++) { long_text += "g"; }

            request.post("/submit_payment")
                .send({"last_name": long_text})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["last_name"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it("should pass validation", (done) => {
            let normal_last_name = "Lu";
            request.post("/submit_payment")
                .send({"last_name": normal_last_name})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if(data.info["last_name"] != null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });
    });

    describe('Country Code', () => {
        it('should trigger error: not empty', (done) => {
            request.post("/submit_payment")
                .send({"country_code": ""})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["country_code"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: not all digits', (done) => {

            request.post("/submit_payment")
                .send({"country_code": "2X8"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["country_code"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it("should pass validation", (done) => {
            request.post("/submit_payment")
                .send({"country_code": 86})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if(data.info["country_code"] != null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });
    });
       
    describe('Phone Number', () => {
        it('should trigger error: not empty', (done) => {
            request.post("/submit_payment")
                .send({"phone_number": ""})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["phone_number"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: not all digits', (done) => {

            request.post("/submit_payment")
                .send({"phone_number": "1238-234-2342"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["phone_number"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        
        it('should trigger error: China 11-digits', (done) => {
            
            request.post("/submit_payment")
                .send({"phone_number": "12345678", "country_code": 86})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["phone_number"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: Hong Kong 8-digits', (done) => {
            
            request.post("/submit_payment")
                .send({"phone_number": "1234567", "country_code": 852})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["phone_number"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: too long phone number', (done) => {
            
            request.post("/submit_payment")
                .send({"phone_number": "1234567890123456789012345678901234567890", "country_code": 1})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["phone_number"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it("should pass validation", (done) => {
            request.post("/submit_payment")
                .send({"country_code": 86, "phone_number":"18918912345"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if(data.info["phone_number"] != null) {
                        throw new Error(data.info["phone_number"]);
                    }
                }).end(done);
        });
    });

    describe('Currency', () => {
        it('should trigger error: not empty', (done) => {
            request.post("/submit_payment")
                .send({"currency": ""})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["currency"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: not supported currency', (done) => {
            request.post("/submit_payment")
                .send({"currency": "SGD"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["currency"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it("should pass validation", (done) => {
            request.post("/submit_payment")
                .send({"currency":"JPY"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if(data.info["currency"] != null) {
                        throw new Error(data.info["currency"]);
                    }
                }).end(done);
        });
    });

    describe('Price', () => {
        it('should trigger error: not empty', (done) => {
            request.post("/submit_payment")
                .send({"price": ""})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["price"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: invalid amount type', (done) => {
            request.post("/submit_payment")
                .send({"price": "SGD"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["price"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: too much!', (done) => {
            request.post("/submit_payment")
                .send({"price": 12000000})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["price"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it('should trigger error: JPY has decimals', (done) => {
            request.post("/submit_payment")
                .send({"price": 123.88, "currency": "JPY"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if( data.code !== 600 || data.info["price"] == null) {
                        throw new Error("validation not work");
                    }
                }).end(done);
        });

        it("should pass validation", (done) => {
            request.post("/submit_payment")
                .send({"price": 123.458, "currency": "CNY"})
                .expect(200).expect(function(res){
                    data = JSON.parse(res.text);
                    if(data.info["price"] != null) {
                        throw new Error(data.info["price"]);
                    }
                }).end(done);
        });
    });

    after(() => {
        server.close();
    })
});