import mongoose from 'mongoose';
import { sendToMultiple } from '../../../utils/api-gateway-management.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Lobby } from '../../lobby/schemas/lobby-schema.js';
import { Message } from '../../message/schemas/message-schema.js';
import { Room } from '../../room/schemas/room-schema.js';
import { User } from '../../user/schemas/user-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { connectionId } = event.requestContext;

    await findOneAndDelete({ connectionId });

    const updatedRoom = await Room.findOneAndUpdate(
        { users: { $elemMatch: { connectionId } } },
        { $pull: { users: { $elemMatch: { connectionId } } } },
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

    return new ResponseModel({
        statusCode: 200,
        message: 'User disconnected successfully',
    });
};
