import mongoose from 'mongoose';
import { ResponseModel } from '../../../utils/response-model.js';
import { User } from '../schemas/user-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { userName, avatar, connectionId } = JSON.parse(event.body);

    try {
        const user = new User({ userName, avatar, connectionId });
        const savedUser = await user.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'User created successfully',
            data: savedUser,
        });
    } catch (error) {
        console.log('error', error);
        if (error.code === 11000) {
            return new ResponseModel({
                statusCode: 400,
                message: 'Username or connectionId already in use',
            });
        }
        return new ResponseModel({ data: error });
    }
};
