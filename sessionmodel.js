const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    jwt_id: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    }
});

const UserSession = mongoose.model("sessions", SessionSchema);

module.exports = UserSession;