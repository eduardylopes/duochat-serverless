const ResponseModel = require('../../../utils/response-model');
const AppError = require('../../../utils/app-error');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');
const {
    deleteConnection,
    sendToMultiple,
} = require('../../../utils/api-gateway-management');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
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

        const updatedLobby = await Lobby.updateOne(
            { rooms: id },
            { $pull: { rooms: id } },
            { new: true },
        )
            .populate({
                path: 'rooms',
                populate: {
                    path: 'users',
                },
            })
            .populate('users');

        const connectionIds = updatedLobby.users.map(user => user.connectionId);

        await sendToMultiple(connectionIds, updatedRoom);

        const removeUsersConnected = connectionIds.map(connectionId =>
            deleteConnection(connectionId),
        );

        await Promise.all(removeUsersConnected);

        return new ResponseModel({
            statusCode: 204,
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
