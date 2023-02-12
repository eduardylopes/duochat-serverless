import mongoose from 'mongoose';
import ResponseModel from '../../../utils/response-model.js';
import { User } from '../schemas/user-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    try {
        const rooms = await User.find();

        return new ResponseModel({
            statusCode: 201,
            message: 'User(s) retrieved successfully',
            data: rooms,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
