const ResponseModel = require('../../../utils/response-model');
const AppError = require('../../../utils/app-error');
const mongoose = require('mongoose');
const Lobby = require('../schemas/lobby-schema');
mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { id, name } = JSON.parse(event.body);

    try {
        const updatedLobby = await Lobby.findByIdAndUpdate(
            id,
            { name },
            { new: true },
        );

        if (!updatedLobby) throw new AppError('Lobby not found', 404);

        return new ResponseModel({
            statusCode: 201,
            message: 'Lobby updated successfully',
            date: updatedLobby,
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
