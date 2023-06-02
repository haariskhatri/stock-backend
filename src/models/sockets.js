const mongoose = require('mongoose');

const socketSchema = mongoose.Schema({
    customerId: {
        type: Number,
        requried: true
    },
    socketId: {
        type: Number,
        requried: true
    }
})

const socketModel = mongoose.model('socket', socketSchema, 'sockets');

module.exports = socketModel;