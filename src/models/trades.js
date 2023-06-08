const mongoose = require('mongoose')
const { tradeIdModel } = require('./counters')
const { response } = require('express')

const tradeSchema = mongoose.Schema({
    tradeId: {
        type: Number,
        required: true
    },
    sellerId: {
        type: Number,
        required: true
    },
    buyerId: {
        type: Number,
        required: true
    },
    stock: {
        type: String,
        required: true
    },
    shares: {
        type: Number,
        required: true
    },
    priceLimit: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        required: true
    }
})


const tradeModel = mongoose.model('trademodel', tradeSchema, 'trades')

const getTradeId = async () => {
    const result = await tradeIdModel.find({}).select({ '_id': 0, 'trade_id': 1 });
    return result[0].trade_id;
}

const incrementTradeId = async () => {
    const result = await tradeIdModel.updateMany({}, { '$inc': { 'trade_id': 1 } });
    return 'tradeId Incremented';
}


const addTrade = async (
    buyerId,
    sellerId,
    stock,
    shares,
    priceLimit
) => {

    const tradeId = await getTradeId();
    const addnew = await tradeModel({
        tradeId: tradeId,
        sellerId: sellerId,
        buyerId: buyerId,
        stock: stock,
        shares: shares,
        priceLimit: priceLimit,
        date: new Date(),
    }).save();

    await incrementTradeId();

    return tradeId;

}



module.exports =tradeModel,{ addTrade, getTradeId, incrementTradeId };