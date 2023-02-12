import mongoose from 'mongoose';
import AppError from '../../../utils/app-error.js';
import ResponseModel from '../../../utils/response-model.js';
import { findByIdAndDelete } from '../schemas/lobby-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { id } = JSON.parse(event.body);

    try {
        const lobby = await findByIdAndDelete(id);

        if (!lobby) throw new AppError('Lobby not found', 404);

        return new ResponseModel({
            statusCode: 200,
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
