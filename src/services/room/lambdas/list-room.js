import mongoose from 'mongoose';
import { ResponseModel } from '../../../utils/response-model.js';
import { Room } from '../schemas/room-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export async function handler() {
    try {
        const rooms = await Room.find();

        return new ResponseModel({
            statusCode: 201,
            message: 'Room(s) retrieved successfully',
            data: rooms,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
}
