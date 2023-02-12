import mongoose from 'mongoose';
import { sendToMultiple } from '../../../utils/api-gateway-management.js';
import { AppError } from '../../../utils/app-error.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Room } from '../../room/schemas/room-schema.js';
import { User } from '../../user/schemas/user-schema.js';
import { Message } from '../schemas/message-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { roomId, userId, content } = JSON.parse(event.body);

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const message = new Message({
            author: user._id,
            room: roomId,
            content,
        });

        const savedMessage = await message.save();

        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { $push: { messages: savedMessage._id } },
            { new: true },
        )
            .populate({ path: 'users', model: User })
            .populate({ path: 'messages', model: Message });

        const connectionIds = updatedRoom.users.map(user => user.connectionId);
        await sendToMultiple(connectionIds, updatedRoom);

        return new ResponseModel({
            statusCode: 201,
            message: 'Message created successfully',
            data: savedMessage,
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
