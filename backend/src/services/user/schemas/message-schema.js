const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    created_at: { type: String, required: true, unique: true },
    updated_at: { type: String, required: true, unique: true },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
