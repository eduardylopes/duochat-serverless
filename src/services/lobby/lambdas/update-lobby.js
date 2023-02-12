import mongoose from 'mongoose';
import { AppError } from '../../../utils/app-error.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Lobby } from '../schemas/lobby-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
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
