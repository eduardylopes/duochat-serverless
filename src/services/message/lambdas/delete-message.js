import mongoose from 'mongoose';
import { sendToMultiple } from '../../../utils/api-gateway-management.js';
import { AppError } from '../../../utils/app-error.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Message } from '../../message/schemas/message-schema.js';
import { Room } from '../../room/schemas/room-schema.js';
import { User } from '../../user/schemas/user-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { id, userId } = JSON.parse(event.body);

    try {
        const deletedMessage = await Message.findOneAndDelete({
            _id: id,
            author: userId,
        });

        if (!deletedMessage)
            throw new AppError(
                'Message not found or user is not the author of the message',
                404,
            );

        const updatedRoom = await Room.findOneAndUpdate(
            { messages: id },
            { $pull: { messages: id } },
            { new: true },
        )
            .populate({ path: 'users', model: User })
            .populate({ path: 'messages', model: Message });

        const connectionIds = updatedRoom.users.map(user => user.connectionId);
        await sendToMultiple(connectionIds, updatedRoom);

        return new ResponseModel({
            statusCode: 200,
            message: 'Message deleted successfully',
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
