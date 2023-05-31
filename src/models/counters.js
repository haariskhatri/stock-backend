const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://root:Haaris8785@cluster0.walzl.mongodb.net/stock');

const counterSchema = mongoose.Schema({
    ipo_id: {
        type: Number,
        required: true
    }
})

const slotSchema = mongoose.Schema({
    slot_id: {
        type: Number,
        required: true
    }
})

const slotCounterModel = mongoose.model('slot', slotSchema, 'ids');
const ipoCounterModel = mongoose.model('ipo', counterSchema, 'ids');


module.exports = { ipoCounterModel, slotCounterModel };