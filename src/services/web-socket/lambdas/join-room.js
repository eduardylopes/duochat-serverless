const mongoose = require('mongoose');
const {
    sendToMultiple,
    sendToOne,
} = require('../../../utils/api-gateway-management');
const { Lobby } = require('../../lobby/schemas/lobby-schema');
const { Message } = require('../../message/schemas/message-schema');
const { Room } = require('../../room/schemas/room-schema');
const { User } = require('../../user/schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;
    const { id, password } = JSON.parse(event.body);

    const user = await User.findOne({ connectionId });

    if (!user) {
        await sendToOne(connectionId, 'User not found');
    }

    const room = await Room.findById(id).populate({
        path: 'users',
        model: User,
    });

    const isRoomFull = room.users.length >= room.maxUsers;
    if (isRoomFull) throw new AppError('The room is full', 400);

    if (room.password) {
        const isPasswordCorrect = password === room.password;

        if (!isPasswordCorrect) throw new AppError('Invalid password', 400);
    }

    room.users.push(user._id);
    const updatedRoom = await room
        .save()
        .populate({ path: 'users', model: User })
        .populate({ path: 'messages', model: Message });

    const roomConnectionIds = updatedRoom.users.map(user => user.connectionId);
    await sendToMultiple(roomConnectionIds, room);

    const lobby = await Lobby.findOne({ rooms: room._id })
        .populate({
            path: 'rooms',
            model: Room,
            populate: {
                path: 'users',
                model: User,
            },
        })
        .populate({ path: 'users', model: User });

    const lobbyConnectionIds = lobby.users.map(user => user.connectionId);
    await sendToMultiple(lobbyConnectionIds, lobby);
};
