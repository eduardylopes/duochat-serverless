const mongoose = require('mongoose');
const { ResponseModel } = require('../../../utils/response-model');
const { Lobby } = require('../schemas/lobby-schema');

mongoose.connect(process.env.MONGODB_URI);

const handler = async () => {
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
