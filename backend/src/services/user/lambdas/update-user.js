const ResponseModel = require('../utils/response-model');
const mongoose = require('mongoose');
const User = require('../user/schemas/user-schema');
mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { userId, userName, avatar } = JSON.parse(event.body);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { userName, avatar },
            { new: true },
        );

        return new ResponseModel({
            statusCode: 201,
            message: 'User updated successfully',
            date: updatedUser,
        });
    } catch (error) {
        return new ResponseModel();
    }
};
