import mongoose from 'mongoose';
import { ResponseModel } from '../../../utils/response-model.js';
import { User } from '../../user/schemas/user-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { userId, userName, avatar } = JSON.parse(event.body);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { userName, avatar },
            { new: true },
        );

        if (!updatedUser) {
            throw new AppError('User not found', 404);
        }

        return new ResponseModel({
            statusCode: 200,
            message: 'User updated successfully',
            date: updatedUser,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return new ResponseModel({
                statusCode: error.status,
                message: error.message,
            });
        }

        return new ResponseModel();
    }
};
