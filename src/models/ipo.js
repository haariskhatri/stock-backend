const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:Haaris8785@cluster0.walzl.mongodb.net/stock');

const ipoSchema = mongoose.Schema({
    companyId: {
        type: Number,
        required: true
    },
    companyName: {

        type: String,
        required: true
    },
    companyLogo: {
        data: Buffer,
        contentType: String
    },
    companySymbol: {

        type: String,
        required: true
    },
    companyShares: {
        type: Number,
        required: true

    },
    companyValuepershare: {
        type: Number,
        required: true
    },
    companyMinimumSlotSize: {
        type: Number,
        required: true
    },
    companyMaximumSlotSize: {
        type: Number,
        required: true
    },
    companyMaximumSlotsAllowed: {
        type: Number,
        required: true
    },
    companyValuation: {
        type: Number,
        required: true
    },
    companyStartdate: {
        type: Date,
        required: true
    },
    companyEnddate: {
        type: Date,
        required: true
    },
    companyDescription: {
        type: String,
        required: true
    }
})

const ipoModel = mongoose.model('ipos', ipoSchema);

module.exports = ipoModel;