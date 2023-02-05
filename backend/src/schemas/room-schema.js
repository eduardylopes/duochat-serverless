const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    adminId: { type: String, required: true, unique: true },
    maxUsers: { type: Number, required: true },
    isPrivate: { type: Boolean, required: true },
    password: { type: String },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
