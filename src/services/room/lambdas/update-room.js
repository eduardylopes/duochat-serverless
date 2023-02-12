import mongoose from 'mongoose';
import { AppError } from '../../../utils/app-error.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Lobby } from '../../lobby/schemas/lobby-schema.js';
import { Message } from '../../message/schemas/message-schema.js';
import { User } from '../../user/schemas/user-schema.js';
import { Room } from '../schemas/room-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { id, name, adminId, maxUsers, isPrivate, password } = JSON.parse(
        event.body,
    );

    try {
        const updatedRoom = await Room.findOneAndUpdate(
            { _id: id, adminId },
            { name, adminId, maxUsers, isPrivate, password },
            { new: true },
        )
            .populate({ path: 'users', model: User })
            .populate({ path: 'messages', model: Message });

        if (!updatedRoom) throw new AppError('Room not found', 404);

        const connectionIds = updatedRoom.users.map(user => user.connectionId);
        await sendToMultiple(connectionIds, updatedRoom);

        const updatedLobby = await Lobby.findOne({ rooms: id })
            .populate({
                path: 'rooms',
                model: Room,
                populate: {
                    path: 'users',
                    model: User,
                },
            })
            .populate({ path: 'users', model: User });

        const lobbyConnectionIds = updatedLobby.users.map(
            user => user.connectionId,
        );
        await sendToMultiple(lobbyConnectionIds, updatedLobby);

        return new ResponseModel({
            statusCode: 200,
            message: 'Room updated successfully',
            data: updatedRoom,
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
