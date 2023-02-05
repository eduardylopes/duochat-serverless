const { ResponseModel } = require('../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');

exports.handler = async event => {
    await mongoose.connect(process.env.MONGODB_URI);

    const { id, name, adminId, maxUsers, isPrivate, password } = JSON.parse(
        event.body,
    );

    try {
        const room = await Room.findById(id);
        Object.assign(room, { name, adminId, maxUsers, isPrivate, password });
        const updatedRoom = room.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'Room updated successfully',
            date: updatedRoom,
        });
    } catch (error) {
        return new ResponseModel();
    } finally {
        await mongoose.connection.close();
    }
};
