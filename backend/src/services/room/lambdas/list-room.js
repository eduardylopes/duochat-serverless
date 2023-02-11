const { ResponseModel } = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    try {
        const rooms = await Room.find();

        return new ResponseModel({
            statusCode: 201,
            message: 'Room(s) retrieved successfully',
            data: rooms,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
