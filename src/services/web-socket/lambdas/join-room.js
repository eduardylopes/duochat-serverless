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
    const { id, password } = JSON.parse(event.body);

    const user = await User.findOne({ connectionId });

    if (!user) {
        return new ResponseModel({
            statusCode: 404,
            message: 'User not found',
        });
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
