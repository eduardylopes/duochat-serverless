const ResponseModel = require('../../../utils/response-model');
const mongoose = require('mongoose');
const User = require('../../user/schemas/user-schema');
const Room = require('../../room/schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');
const { sendToMultiple } = require('../../../utils/api-gateway-management');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;
    const { channel, password } = JSON.parse(event.body);
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

            if (room.password) {
                const isPasswordCorrect = room.password === password;

                if (!isPasswordCorrect)
                    throw new AppError('Invalid password', 400);

                const isRoomFull = room.users.length >= room.maxUsers;

                if (isRoomFull) throw new AppError('The room is full', 400);
            }

            const user = await User.findOne({ connectionId });

            room.users.push(user._id);
            const updatedRoom = await room
                .save()
                .populate(['messages', 'users']);

            const roomConnectionIds = updatedRoom.users.map(
                user => user.connectionId,
            );
            await sendToMultiple(roomConnectionIds, room);

            const lobby = await Lobby.findOne({ rooms: room._id })
                .populate({
                    path: 'rooms',
                    populate: {
                        path: 'users',
                    },
                })
                .populate('users');

            const lobbyConnectionIds = lobby.users.map(
                user => user.connectionId,
            );
            await sendToMultiple(lobbyConnectionIds, lobby);

            break;

        case 'lobby':
            const updatedLobby = await Lobby.findByIdAndUpdate(channel.id, {
                $push: { users: user._id },
            })
                .populate({
                    path: 'rooms',
                    populate: {
                        path: 'users',
                    },
                })
                .populate('users');

            roomConnectionIds = updatedLobby.users.map(
                user => user.connectionId,
            );

            await sendToMultiple(roomConnectionIds, updatedLobby);
            break;

        default:
            return {};
    }
};
