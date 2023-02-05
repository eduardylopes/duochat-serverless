const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    created_at: { type: String, required: true, unique: true },
    updated_at: { type: String, required: true, unique: true },
    avatar: { type: String, required: true },
});

const Message = mongoose.model('User', messageSchema);

module.exports = Message;
