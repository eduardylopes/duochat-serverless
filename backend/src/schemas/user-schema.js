const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    connectionId: { type: String, required: true, unique: true },
    avatar: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
