import mongoose from 'mongoose';
import { ResponseModel } from '../../../utils/response-model.js';
import { Lobby } from '../schemas/lobby-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async () => {
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
