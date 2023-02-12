const ResponseModel = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Lobby = require('../schemas/lobby-schema');
mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { name } = JSON.parse(event.body);

    try {
        const lobby = await Lobby.findById(id);
        lobby.name = name;
        const updatedLobby = await lobby.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'Lobby updated successfully',
            date: updatedLobby,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
