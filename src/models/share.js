const mongoose = require('mongoose')

const shareSchema = mongoose.Schema({
    shareId: {
        type: Number,
        required: true
    },
    shareName: {
        type: String,
        required: true
    },
    shareSymbol: {
        type: String,
        required: true
    },
    sharePrice: {
        type: Number,
        required: true
    },
    shareQty: {
        type: Number,
        required: true
    }
})

const shareModel = mongoose.model('share', shareSchema, 'shares');

module.exports = shareModel;