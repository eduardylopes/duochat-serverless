const ResponseModel = require('../../../utils/response-model');
const mongoose = require('mongoose');
const User = require('../schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    try {
        const rooms = await User.find();

        return new ResponseModel({
            statusCode: 201,
            message: 'User(s) retrieved successfully',
            data: rooms,
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
