const mongoose = require('mongoose');
const { sendToMultiple } = require('../../../utils/api-gateway-management');
const { Lobby } = require('../../lobby/schemas/lobby-schema');
const { Message } = require('../../message/schemas/message-schema');
const { Room } = require('../../room/schemas/room-schema');
const { User } = require('../../user/schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;

    const user = await User.findOneAndDelete({ connectionId });

    if (!user) return {};

    const room = await Room.findOne({ adminId: user._id });

    const isUserRoomAdmin = room.adminId === user._id;

    let updatedRoom;

    if (isUserRoomAdmin) {
        const isRoomEmpty = room.users.length === 0;

        if (isRoomEmpty) {
            await Room.findByIdAndDelete(room._id);
            await Lobby.findOneAndUpdate(
                { rooms: room._id },
                { $pull: { rooms: room._id } },
                { new: true },
            )
                .populate({
                    path: 'rooms',
                    model: Room,
                    populate: {
                        path: 'users',
                        model: User,
                    },
                })
                .populate({ path: 'users', model: User });

            const lobbyConnectionIds = lobby.users.map(
                user => user.connectionId,
            );
            await sendToMultiple(lobbyConnectionIds, lobby);

            return {};
        } else {
            updatedRoom = await Room.findOneAndUpdate(
                { users: { $elemMatch: { connectionId } } },
                {
                    $pull: { users: user._id },
                    $set: { adminId: room.users[0] },
                },
                { new: true },
            )
                .populate({ path: 'users', model: User })
                .populate({ path: 'messages', model: Message });
        }
    } else {
        updatedRoom = await Room.findOneAndUpdate(
            { users: { $elemMatch: { connectionId } } },
            { $pull: { users: user._id } },
            { new: true },
        )
            .populate({ path: 'users', model: User })
            .populate({ path: 'messages', model: Message });
    }

    if (updatedRoom) {
        const roomConnectionIds = updatedRoom.users.map(
            user => user.connectionId,
        );
        await sendToMultiple(roomConnectionIds, updatedRoom);
    }

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
