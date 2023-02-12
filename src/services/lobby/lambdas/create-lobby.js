import mongoose from 'mongoose';
import ResponseModel from '../../../utils/response-model.js';
import Lobby from '../schemas/lobby-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
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
