const { ResponseModel } = require('../../../utils/response-model');
const mongoose = require('mongoose');
const User = require('../schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { userName, avatar, connectionId } = JSON.parse(event.body);

    try {
        const user = new User({ userName, avatar, connectionId });
        const savedUser = await user.save();

        return new ResponseModel({
            statusCode: 201,
            message: 'User created successfully',
            data: savedUser,
        });
    } catch (error) {
        if (error.code === 11000) {
            return new ResponseModel({
                statusCode: 400,
                message: 'Username already in use',
            });
        }
        return new ResponseModel({ data: error });
    }
};
