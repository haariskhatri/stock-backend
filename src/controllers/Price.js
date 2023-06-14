const { priceModel } = require("../models/prices")


const appendPrice = async (stock, value) => {
    return await priceModel.findOneAndUpdate({ 'stock': stock }, { $push: { 'price': value } }, { upsert: true })
}

const getPriceArray = async (stock) => {
    return (await priceModel.findOne({ 'stock': stock })).price;
}

module.exports = { appendPrice, getPriceArray }