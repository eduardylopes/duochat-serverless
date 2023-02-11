const { ResponseModel } = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { name, adminId, maxUsers, isPrivate, password } = JSON.parse(
        event.body,
    );

    try {
        const room = new Room({ name, adminId, maxUsers, isPrivate, password });
        const savedRoom = await room.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'Room created successfully',
            data: savedRoom,
        });
    } catch (error) {
        if (error.code === 11000) {
            return new ResponseModel({
                statusCode: 400,
                message: 'Room name already in use',
            });
        }
        return new ResponseModel({ data: error });
    }
};
