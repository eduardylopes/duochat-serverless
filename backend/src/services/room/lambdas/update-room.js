const { ResponseModel } = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');
mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { id, name, adminId, maxUsers, isPrivate, password } = JSON.parse(
        event.body,
    );

    try {
        const room = await Room.findById(id);
        Object.assign(room, { name, adminId, maxUsers, isPrivate, password });
        const updatedRoom = await room.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'Room updated successfully',
            date: updatedRoom,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
