const mongoose = require('mongoose')

const priceSchema = mongoose.Schema({
    stock: {
        type: String,
        required: true
    },
    price: [[
        { type: Number },
        { type: Number }]
    ]
})

const priceModel = mongoose.model('prices', priceSchema);

module.exports = { priceModel }