const mongoose = require('mongoose')


const ipomapsSchema = mongoose.Schema(
    {
        customerId: {
            type: Number,
            required: true
        },
        ipoId: {
            type: Number,
            required: true
        },
        slotAmount: {
            type: Number,
            required: true
        }
    }
)

const ipomapsModel = mongoose.model('ipoMap', ipomapsSchema, 'ipomaps');

module.exports = ipomapsModel;