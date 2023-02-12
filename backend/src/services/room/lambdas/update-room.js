const ResponseModel = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');
const AppError = require('../../../utils/app-error');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { id, name, adminId, maxUsers, isPrivate, password } = JSON.parse(
        event.body,
    );

    try {
        const updatedRoom = await Room.updateOne(
            { _id: id, adminId },
            { name, adminId, maxUsers, isPrivate, password },
            { new: true },
        ).populate(['messages', 'users']);

        if (!updatedRoom) throw new AppError('Room not found', 404);

        const connectionIds = updatedRoom.users.map(user => user.connectionId);
        await sendToMultiple(connectionIds, updatedRoom);

        const updatedLobby = await Lobby.findOne({ rooms: id })
            .populate({
                path: 'rooms',
                populate: {
                    path: 'users',
                },
            })
            .populate('users');

        const lobbyConnectionIds = updatedLobby.users.map(
            user => user.connectionId,
        );
        await sendToMultiple(lobbyConnectionIds, updatedLobby);

        return new ResponseModel({
            statusCode: 201,
            message: 'Room updated successfully',
            date: updatedRoom,
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
