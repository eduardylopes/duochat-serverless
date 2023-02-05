const { ResponseModel } = require('../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');

exports.handler = async event => {
    await mongoose.connect(process.env.MONGODB_URI);
    const { userId, roomId } = JSON.parse(event.body);

    try {
        const room = await Room.findById(roomId);
        room.users = room.users.filter(user => user.id !== userId);
        room.save();

        const response = new ResponseModel({
            statusCode: 200,
            message: 'User disconnected',
        });

        return response;
    } catch (error) {
        const errorResponse = new ResponseModel({
            message: 'Failed to disconnect user',
            date: error,
        });

        return errorResponse;
    } finally {
        await mongoose.connection.close();
    }
};
