const { ResponseModel } = require('../../../utils/response-model');
const { AppError } = require('../../utils/app-error');
const mongoose = require('mongoose');
const User = require('../schemas/user-schema');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { id } = JSON.parse(event.body);

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) throw new AppError('User not found', 404);

        return new ResponseModel({
            statusCode: 204,
            message: 'User deleted successfully',
            data: user,
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
