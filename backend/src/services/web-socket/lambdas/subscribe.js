const { ResponseModel } = require('../../../utils/response-model');
const mongoose = require('mongoose');
const User = require('../../user/schemas/user-schema');
const Room = require('../../room/schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;
    const { channel } = JSON.parse(event.body);
    const user = await User.findOne({ connectionId });

    if (!user) {
        return new ResponseModel({
            statusCode: 404,
            message: 'User not found',
        });
    }

    switch (channel.type) {
        case 'room':
            const room = await Room.findById(channel.id);
            room.users.push(user._id);
            await room.save();

            return new ResponseModel({
                statusCode: 204,
                message: 'User successfully assigned to room',
            });

        case 'lobby':
            const lobby = await Lobby.findById(channel.id);
            lobby.users.push(user._id);
            await lobby.save();

            return new ResponseModel({
                statusCode: 204,
                message: 'User successfully assigned to lobby',
            });

        default:
            return new ResponseModel();
    }
};
