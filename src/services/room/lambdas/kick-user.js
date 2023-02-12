const ResponseModel = require('../../../utils/response-model');
const AppError = require('../../../utils/app-error');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');
const User = require('../../user/schemas/user-schema');
const Message = require('../../message/schemas/message-schema');
const {
    deleteConnection,
    sendToMultiple,
} = require('../../../utils/api-gateway-management');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { roomId, userId, adminId } = JSON.parse(event.body);

    try {
        const user = await User.findById(userId);

        if (!user) throw new AppError('User not found', 404);

        const updatedRoom = await Room.findOneAndUpdate(
            { _id: roomId, adminId },
            { $pull: { users: userId } },
            { new: true },
        )
            .populate({ path: 'users', model: User })
            .populate({ path: 'messages', model: Message });

        if (!updatedRoom)
            throw new AppError(
                'Room not found or user is not the admin of the room',
                404,
            );

        // await deleteConnection(user.connectionId);

        // const roomConnectionIds = updatedLobby.users.map(
        //     user => user.connectionId,
        // );
        // await sendToMultiple(roomConnectionIds, updatedRoom);

        const updatedLobby = await Lobby.findOne({ rooms: id })
            .populate({
                path: 'rooms',
                model: Room,
                populate: {
                    path: 'users',
                    mode: User,
                },
            })
            .populate({ path: 'users', model: User });

        // const lobbyConnectionIds = updatedLobby.users.map(
        //     user => user.connectionId,
        // );
        // await sendToMultiple(lobbyConnectionIds, updatedLobby);

        return new ResponseModel({
            statusCode: 200,
            message: 'User kicked successfully',
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
