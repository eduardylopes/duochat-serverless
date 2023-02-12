const { sendToMultiple } = require('../../../utils/api-gateway-management');
const mongoose = require('mongoose');
const User = require('../../user/schemas/user-schema');
const Room = require('../../room/schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;

    await User.findOneAndDelete({ connectionId });

    const updatedRoom = await Room.updateOne(
        { users: { $elemMatch: { connectionId } } },
        { $pull: { users: { $elemMatch: { connectionId } } } },
        { new: true },
    ).populate(['users', 'messages']);

    const roomConnectionIds = updatedRoom.users.map(user => user.connectionId);
    await sendToMultiple(roomConnectionIds, updatedRoom);

    const lobby = await Lobby.findOne({ rooms: updatedRoom._id })
        .populate({
            path: 'rooms',
            populate: {
                path: 'users',
            },
        })
        .populate('users');

    const lobbyConnectionIds = lobby.users.map(user => user.connectionId);
    await sendToMultiple(lobbyConnectionIds, lobby);
};
