const mongoose = require('mongoose');
import {
    deleteConnection,
    sendToMultiple
} from '../../../utils/api-gateway-management';
);
const { AppError} = require( '../../../utils/app-error');
const { ResponseModel} = require( '../../../utils/response-model');
const { Lobby} = require( '../../lobby/schemas/lobby-schema');
const { User} = require( '../../user/schemas/user-schema');
const { Room} = require( '../schemas/room-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event =>  {
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
