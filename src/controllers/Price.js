const { priceModel } = require("../models/prices")


const appendPrice = async (stock, value) => {
    return await priceModel.findOneAndUpdate({ 'stock': stock }, { $push: { 'price': value } }, { upsert: true })
}

const getPriceArray = async (stock) => {
    const result = (await priceModel.findOne({ 'stock': stock }))
    return result.price;
}



module.exports = { appendPrice, getPriceArray }