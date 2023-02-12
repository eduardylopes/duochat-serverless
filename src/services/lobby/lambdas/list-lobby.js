const ResponseModel = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Lobby = require('../schemas/lobby-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async () => {
    try {
        const lobbies = await Lobby.find();

        return new ResponseModel({
            statusCode: 201,
            message: 'Lobbies retrieved successfully',
            data: lobbies,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
