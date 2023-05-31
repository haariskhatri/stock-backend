const mongoose = require('mongoose');

const slotSchema = mongoose.Schema(
    {
        slotId: {
            type: Number,
            required: true
        },
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
        },
        slotNumber: {
            type: Number,
            required: true
        }

    }
)

const slotModel = mongoose.model('slots', slotSchema);


module.exports = slotModel;