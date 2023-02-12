const ResponseModel = require('../../../utils/response-model');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');
const { sendToMultiple } = require('../../../utils/api-gateway-management');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { name, adminId, maxUsers, isPrivate, password, lobbyId } =
        JSON.parse(event.body);

    try {
        const room = new Room({ name, adminId, maxUsers, isPrivate, password });
        const savedRoom = await room.save();

        const updatedLobby = await Lobby.updateOne(
            lobbyId,
            { $push: { rooms: savedRoom._id } },
            { new: true },
        )
            .populate({
                path: 'rooms',
                populate: {
                    path: 'users',
                },
            })
            .populate('users');

        if (!updatedLobby) throw new AppError('Lobby not found', 404);

        const lobbyConnectionIds = updatedLobby.users.map(
            user => user.connectionId,
        );
        await sendToMultiple(lobbyConnectionIds, updatedLobby);

        return new ResponseModel({
            statusCode: 201,
            message: 'Room created successfully',
            data: savedRoom,
        });
    } catch (error) {
        if (error.code === 11000) {
            return new ResponseModel({
                statusCode: 400,
                message: 'Room name already in use',
            });
        }

        if (error instanceof AppError) {
            return new ResponseModel({
                statusCode: error.statusCode,
                message: error.message,
            });
        }

        return new ResponseModel({ data: error });
    }
};
