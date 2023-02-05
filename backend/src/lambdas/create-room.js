const { ResponseModel } = require('../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');

exports.handler = async event => {
    await mongoose.connect(process.env.MONGODB_URI);

    const { body } = event;
    const { name, adminId, maxUsers, isPrivate, password } = JSON.parse(body);

    try {
        const room = new Room({ name, adminId, maxUsers, isPrivate, password });
        const savedRoom = await room.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'Room created successfully',
            data: savedRoom,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    } finally {
        await mongoose.connection.close();
    }
};
