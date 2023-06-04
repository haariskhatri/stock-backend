const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true
        },
        userName: {
            type: String,
            required: true
        }, 
        email: {
            type: String,
            required: true
        },
        password:{
            type:String,
            required:true
        },
        confirmationCode: {
          type: String,
          unique: true
        },
        userBalance: {
            type: Number,
            required: true
        },
        userOrders: {
            type: Array,
            required: true
        },
        userPortfolio: {
            type: Array,
            required: true
        },
        userStatus: {
            type: Number,
            required: true
        },
        created: {
            type: String,
            required: true
        }
    }
)

const userModel = mongoose.model('user', UserSchema, 'users');

module.exports = userModel;