const { ResponseModel } = require('../../../utils/response-model');
const { AppError } = require('../../utils/app-error');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { id } = JSON.parse(event.body);

    try {
        const room = await Room.findByIdAndDelete(id);

        if (!room) throw new AppError('Room not found', 404);

        return new ResponseModel({
            statusCode: 204,
            message: 'Room deleted successfully',
        });
    } catch (error) {
        if (error instanceof AppError) {
            return new ResponseModel({
                statusCode: error.statusCode,
                message: error.message,
            });
        }

        return new ResponseModel({ data: error });
    }
};
