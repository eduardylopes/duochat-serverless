const ResponseModel = require('../../../utils/response-model');
const AppError = require('../../../utils/app-error');
const mongoose = require('mongoose');
const Room = require('../schemas/room-schema');
const Lobby = require('../../lobby/schemas/lobby-schema');
const User = require('../../user/schemas/user-schema');
const { sendToMultiple } = require('../../../utils/api-gateway-management');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { name, adminId, maxUsers, isPrivate, password, lobbyId } =
        JSON.parse(event.body);

    try {
        const room = new Room({ name, adminId, maxUsers, isPrivate, password });
        const savedRoom = await room.save();

        const updatedLobby = await Lobby.findByIdAndUpdate(
            lobbyId,
            { $push: { rooms: savedRoom._id } },
            { new: true },
        )
            .populate({
                path: 'rooms',
                populate: {
                    path: 'users',
                    model: User,
                },
            })
            .populate({
                path: 'users',
                model: User,
            });

        console.log('updatedLobby', updatedLobby);

        // if (!updatedLobby) throw new AppError('Lobby not found', 404);

        // const lobbyConnectionIds = updatedLobby.users.map(
        //     user => user.connectionId,
        // );
        // await sendToMultiple(lobbyConnectionIds, updatedLobby);

        return new ResponseModel({
            statusCode: 201,
            message: 'Room created successfully',
            data: savedRoom,
        });
    } catch (error) {
        console.log('error#', error);

        if (error.code === 11000) {
            return new ResponseModel({
                statusCode: 400,
                message:
                    'Room name already in use or admin already created another room',
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