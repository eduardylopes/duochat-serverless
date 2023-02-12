import mongoose from 'mongoose';
import { sendToMultiple } from '../../../utils/api-gateway-management.js';
import { AppError } from '../../../utils/app-error.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Message } from '../../message/schemas/message-schema.js';
import { Room } from '../../room/schemas/room-schema.js';
import { User } from '../../user/schemas/user-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { id, userId, content } = JSON.parse(event.body);

    try {
        const message = await Message.findById(id).populate({
            path: 'room',
            model: Room,
        });

        if (!message) {
            throw new AppError('Message not found', 404);
        }

        const isUserAuthor = message.author === userId;
        const isUserRoomAdmin = message.room.adminId === userId;

        if (!isUserAuthor || !isUserRoomAdmin) {
            throw new AppError('Only the author or admin can delete a message');
        }

        message.content = content;
        const updatedMessage = await message.save();

        const room = await Room.findById(message.room)
            .populate({
                path: 'messages',
                model: Message,
            })
            .populate({
                path: 'users',
                model: User,
            });

        const connectionIds = room.users.map(user => user.connectionId);
        await sendToMultiple(connectionIds, room);

        return new ResponseModel({
            statusCode: 200,
            message: 'Message updated successfully',
            date: updatedMessage,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return new ResponseModel({
                statusCode: error.statusCode,
                message: error.message,
            });
        }

        return new ResponseModel();
    }
};
