const { ResponseModel } = require('../utils/response-model');
const mongoose = require('mongoose');
const User = require('../schemas/user-schema');
const Room = require('../schemas/room-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;

    try {
        await User.deleteOne({ connectionId });
        await Room.updateOne(
            { users: { $elemMatch: { connectionId } } },
            { $pull: { users: { $elemMatch: { connectionId } } } },
        );
        return new ResponseModel({
            statusCode: 200,
            message: 'User disconnected successfully',
        });
    } catch (error) {
        return new ResponseModel({
            statusCode: 400,
            message: 'Failed to disconnect user',
        });
    }
};
