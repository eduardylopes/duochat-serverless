const { ResponseModel } = require('../../../utils/response-model');
const { AppError } = require('../../utils/app-error');
const mongoose = require('mongoose');
const Lobby = require('../schemas/lobby-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { id } = JSON.parse(event.body);

    try {
        const lobby = await Lobby.findByIdAndDelete(id);

        if (!lobby) throw new AppError('Lobby not found', 404);

        return new ResponseModel({
            statusCode: 204,
            message: 'Lobby deleted successfully',
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
