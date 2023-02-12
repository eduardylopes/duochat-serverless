const ResponseModel = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Lobby = require('../schemas/lobby-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { name } = JSON.parse(event.body);

    try {
        const lobby = new Lobby({
            name,
        });
        const savedLobby = await lobby.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'Lobby created successfully',
            data: savedLobby,
        });
    } catch (error) {
        if (error.code === 11000) {
            return new ResponseModel({
                statusCode: 400,
                message: 'Lobby name already in use',
            });
        }
        return new ResponseModel({ data: error });
    }
};
