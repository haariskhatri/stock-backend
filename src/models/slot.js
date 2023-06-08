const mongoose = require('mongoose');

const slotSchema = mongoose.Schema(
    {
        slotId: {
            type: Number,
            required: true
        },
        ipoId: {
            type: Number,
            required: true
        },
        customerId: {
            type: Number,
            required: true
        },
        slotAmount: {
            type: Number,
            required: true
        },
        slotSize: {
            type: Number,
            required: true
        },
        ipoPrice: {
            type: Number,
            required: true
        }

    }
)

const slotIdSchema = mongoose.Schema(
    {
        slot_id: {
            type: Number,
            required: true
        }
    }
)

const slotIdModel = mongoose.model('slotids', slotIdSchema);

const slotModel = mongoose.model('slots', slotSchema);


module.exports = { slotModel, slotIdModel };