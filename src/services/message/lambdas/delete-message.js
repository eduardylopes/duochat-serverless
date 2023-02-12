const ResponseModel = require('../../../utils/response-model');
const { sendToMultiple } = require('../../../utils/api-gateway-management');
const AppError = require('../../../utils/app-error');
const mongoose = require('mongoose');
const Message = require('../../message/schemas/message-schema');
const Room = require('../../room/schemas/room-schema');
const User = require('../../user/schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
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
