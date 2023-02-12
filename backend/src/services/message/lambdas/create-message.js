const { sendToMultiple } = require('../../../utils/api-gateway-management');
const ResponseModel = require('../../../utils/response-model');
const AppError = require('../../../utils/app-error');
const mongoose = require('mongoose');
const Message = require('../schemas/message-schema');
const User = require('../../user/schemas/user-schema');
const Room = require('../../room/schemas/room-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
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
        ).populate(['users', 'messages']);

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
