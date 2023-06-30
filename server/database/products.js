const moongoose = require('mongoose');

const productschema = new moongoose.Schema({
    productName: String,
    productPrice: String,
    productCategory: String,
    userid: String,
    productCompany: String
});

module.exports = moongoose.model("products",productschema);