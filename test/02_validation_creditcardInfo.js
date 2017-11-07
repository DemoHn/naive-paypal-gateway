const expect = require('chai').expect;
const supertest = require('supertest');
const app = require("../server");

describe('Form Validation: Credit Card Info', () => {
    
    let server;
    let request;

    // start server
    before(() => {
        server = app.listen(3961);
        request = supertest(server);
    });

    describe("Holder Name", () => {
        it("should trigger error: invalid character", (done) => {
            request.post("/api/submit_payment")
            .send({"holder_name": "香港记者ABCD"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["holder_name"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: empty", (done) => {
            request.post("/api/submit_payment")
            .send({"holder_name": ""})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["holder_name"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });
        
        it("should trigger error: text too long", (done) => {
            let long_text = "";
            for(let i=0;i<70;i++) { long_text += "f"; }

            request.post("/api/submit_payment")
            .send({"holder_name": long_text})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["holder_name"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should pass validation check", (done) => {
        
            request.post("/api/submit_payment")
            .send({"holder_name": "X.IANGG-ANG O'JIZHE"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.info["holder_name"] != null) {
                    throw new Error(data.info["holder_name"]);
                }
            }).end(done);
        });
    });

    describe("Card Number", () => {
        it("should trigger error: empty", (done) => {
            request.post("/api/submit_payment")
            .send({"card_number": ""})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["card_number"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });
        
        it("should trigger error: wrong checksum", (done) => {
            request.post("/api/submit_payment")
            .send({"card_number": "429392341029333"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["card_number"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: too long", (done) => {
            request.post("/api/submit_payment")
            .send({"card_number": "429392341029333238428432"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["card_number"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        
        it("should trigger error: too short", (done) => {
            request.post("/api/submit_payment")
            .send({"card_number": "4233"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["card_number"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: invalid characters", (done) => {
            request.post("/api/submit_payment")
            .send({"card_number": "4233ADF328FFF"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["card_number"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should pass validation check", (done) => {
            request.post("/api/submit_payment")
            .send({"card_number": "4539337695024479"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.info["card_number"] != null) {
                    throw new Error(data.info["card_number"]);
                }
            }).end(done);
        });
    });    

    describe("Expire Month", () => {
        it("should trigger error: invalid input", (done) => {
            request.post("/api/submit_payment")
            .send({"expire_month": "98"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["expire_month"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: empty", (done) => {
            request.post("/api/submit_payment")
            .send({"expire_month": ""})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["expire_month"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should pass validation check", (done) => {
            
            request.post("/api/submit_payment")
            .send({"expire_month": "12"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.info["expire_month"] != null) {
                    throw new Error(data.info["expire_month"]);
                }
            }).end(done);
        });
    });

    describe("Expire Year", () => {
        it("should trigger error: invalid input", (done) => {
            request.post("/api/submit_payment")
            .send({"expire_year": "98"}) // 2017 + 10 < 2098
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["expire_year"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });
        
        it("should trigger error: invalid input", (done) => {
            request.post("/api/submit_payment")
            .send({"expire_year": "02"}) // 2017 + 10 < 2098
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["expire_year"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: empty", (done) => {
            request.post("/api/submit_payment")
            .send({"expire_year": ""})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["expire_year"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should pass validation check", (done) => {
            
            request.post("/api/submit_payment")
            .send({"expire_year": "19"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.info["expire_year"] != null) {
                    throw new Error(data.info["expire_year"]);
                }
            }).end(done);
        });
    });

    describe("Security Code", () => {

        it("should trigger error: empty", (done) => {
            request.post("/api/submit_payment")
            .send({"security_code": ""})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["security_code"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: invalid charcters", (done) => {
            request.post("/api/submit_payment")
            .send({"security_code": "AF3"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["security_code"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: VISA 4-digits", (done) => {
            request.post("/api/submit_payment")
            .send({"security_code": "3439", "card_number": "4556581839245890"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["security_code"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should trigger error: AMEX 3-digits", (done) => {
            request.post("/api/submit_payment")
            .send({"security_code": "983", "card_number": "373048037490065"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["security_code"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });
        
        it("should trigger error: OTHERS 5-digits", (done) => {
            request.post("/api/submit_payment")
            .send({"security_code": "98382", "card_number": "6011943062891069"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.code !== 600 || data.info["security_code"] == null) {
                    throw new Error("validation not work");
                }
            }).end(done);
        });

        it("should pass validation check", (done) => {
            
            request.post("/api/submit_payment")
            .send({"security_code": "1945", "card_number": "347849542448024"})
            .expect(200).expect(function(res){
                data = JSON.parse(res.text);
                if( data.info["security_code"] != null) {
                    throw new Error(data.info["security_code"]);
                }
            }).end(done);
        });
    });

    after(() => {
        server.close();
    });
});