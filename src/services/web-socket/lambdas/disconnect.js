const mongoose = require('mongoose');
const { sendToMultiple } = require('../../../utils/api-gateway-management');
const { ResponseModel } = require('../../../utils/response-model');
const { Lobby } = require('../../lobby/schemas/lobby-schema');
const { Message } = require('../../message/schemas/message-schema');
const { Room } = require('../../room/schemas/room-schema');
const { User } = require('../../user/schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;

    const user = await User.findOneAndDelete({ connectionId });

    const updatedRoom = await Room.findOneAndUpdate(
        { users: { $elemMatch: { connectionId } } },
        { $pull: { users: user._id } },
        { new: true },
    )
        .populate({ path: 'users', model: User })
        .populate({ path: 'messages', model: Message });

    const roomConnectionIds = updatedRoom.users.map(user => user.connectionId);
    await sendToMultiple(roomConnectionIds, updatedRoom);

    const lobby = await Lobby.findOne({ rooms: updatedRoom._id })
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
