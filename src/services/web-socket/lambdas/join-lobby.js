import mongoose from 'mongoose';
import { sendToMultiple } from '../../../utils/api-gateway-management.js';
import { ResponseModel } from '../../../utils/response-model.js';
import { Lobby } from '../../lobby/schemas/lobby-schema.js';
import { Room } from '../../room/schemas/room-schema.js';
import { User } from '../../user/schemas/user-schema.js';

mongoose.connect(process.env.MONGODB_URI);

export const handler = async event => {
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
};
