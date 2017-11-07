const expect = require('chai').expect;
const OrderInfo = require("../model/orderInfo");
const storeController = require("../controller/store");
const utils = require("../utils");

describe('Store Data to redis', () => {

    let last_ref_code = "";
    let last_price = "";
    // start server
    before(async () => {
        for(let i = 0; i < 10; i++) {
            let info = new OrderInfo(
                "FIRST",
                "LAST",
                "86",
                "12812345678",
                "HKD",
                "123.4"
            );
            info.set_order_status(OrderInfo.orderStatus.SUCCESS);
            last_ref_code = utils.generate_ref_code();
            info.set_ref_code(last_ref_code);

            await storeController.saveData(info);
        }

        for(let i = 0; i < 10; i++) {
            let info_hk = new OrderInfo(
                "香港",
                "记者",
                "852",
                "12345678",
                "HKD",
                "1.4"
            );
            info_hk.set_order_status(OrderInfo.orderStatus.SUCCESS);
            last_ref_code = utils.generate_ref_code();
            info_hk.set_ref_code(last_ref_code);
            last_price = info_hk.price;
            await storeController.saveData(info_hk);
        }
    });

    describe("find data", () => {
        it("should find data by name", async () => {
            let data = await storeController.findData("name", "FIRST");

            expect(Object.keys(data.data)).to.have.lengthOf(10);
        });

        it("should find data by name", async () => {
            let data = await storeController.findData("name", "记者");

            expect(Object.keys(data.data)).to.have.lengthOf(10);
        });

        it("should not find data via name: '香港记者'", async () => {
            let data = await storeController.findData("name", "香港记者");

            expect(Object.keys(data.data)).to.have.lengthOf(0);
        });

        it("should find data by ref_code", async () => {
            let data = await storeController.findData("ref_code", last_ref_code);
            expect(Object.keys(data.data)).to.have.lengthOf(1);

            let price = data.data[last_ref_code]["price"];

            expect(price).to.equal(last_price);
        });

        it("should list all data", async () => {
            let data = await storeController.listData();
            expect(Object.keys(data.data)).to.have.lengthOf(20);
        });
    });

    after(async () => {
        await storeController.flushAll();
    })
});