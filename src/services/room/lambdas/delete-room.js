import mongoose from 'mongoose';
import {
    deleteConnection,
    sendToMultiple,
} from '../../../utils/api-gateway-management.js';
import { AppError } from '../../../utils/app-error.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Lobby } from '../../lobby/schemas/lobby-schema.js';
import { User } from '../../user/schemas/user-schema.js';
import { Room } from '../schemas/room-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
    const { id, userId } = JSON.parse(event.body);

    try {
        const deletedRoom = await Room.findOneAndDelete({
            _id: id,
            adminId: userId,
        });

        if (!deletedRoom)
            throw new AppError(
                'Room not found or user is not the admin of the room',
                404,
            );

        const updatedLobby = await Lobby.findOneAndUpdate(
            { rooms: id },
            { $pull: { rooms: id } },
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

        const removeUsersConnected = deletedRoom.users.map(connectionId =>
            deleteConnection(connectionId),
        );
        await Promise.all(removeUsersConnected);

        const lobbyConnectionIds = updatedLobby.users.map(
            user => user.connectionId,
        );
        await sendToMultiple(lobbyConnectionIds, updatedLobby);

        return new ResponseModel({
            statusCode: 200,
            message: 'Room deleted successfully',
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
