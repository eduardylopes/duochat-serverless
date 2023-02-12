const mongoose = require('mongoose');
const { sendToMultiple } = require('../../../utils/api-gateway-management');
const { ResponseModel } = require('../../../utils/response-model');
const { Lobby } = require('../../lobby/schemas/lobby-schema');
const { Room } = require('../../room/schemas/room-schema');
const { User } = require('../../user/schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;
    const { id } = JSON.parse(event.body);

    const user = await User.findOne({ connectionId });
    if (!user) {
        return new ResponseModel({
            statusCode: 404,
            message: 'User not found',
        });
    }

    const updatedLobby = await Lobby.findByIdAndUpdate(
        id,
        { $push: { users: user._id } },
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

    const connectionIds = updatedLobby.users.map(user => user.connectionId);
    await sendToMultiple(connectionIds, updatedLobby);

    return {};
};
