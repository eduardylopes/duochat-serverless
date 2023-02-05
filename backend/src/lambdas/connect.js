const { ResponseModel } = require('../utils/response-model');
const mongoose = require('mongoose');
const User = require('../schemas/user-schema');

exports.handler = async event => {
    await mongoose.connect();
    const { connectionId, body } = event.requestContext;
    const { userName, avatar } = JSON.parse(body);

    try {
        const user = new User({ connectionId, userName, avatar });
        const savedUser = await user.save();
        return new ResponseModel({
            statusCode: 201,
            message: 'User connected successfully',
            data: savedUser,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    } finally {
        mongoose.connection.close();
    }
};
