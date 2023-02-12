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
        return {};
    }

    const room = await Room.findById(id);

    const isRoomFull = room.users.length >= room.maxUsers;
    if (isRoomFull) {
        await sendToOne(connectionId, 'This room is full');
        return {};
    }

    if (room.password) {
        const isPasswordCorrect = password === room.password;

        if (!isPasswordCorrect) {
            await sendToOne(connectionId, 'Invalid password');
            return {};
        }
    }

    const updatedRoom = await Room.findByIdAndUpdate(
        id,
        { $addToSet: { users: user._id } },
        { new: true },
    )
        .populate({ path: 'users', model: User })
        .populate({ path: 'messages', model: Message });

    const roomConnectionIds = updatedRoom.users.map(user => user.connectionId);
    await sendToMultiple(roomConnectionIds, updatedRoom);

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

    return {};
};
