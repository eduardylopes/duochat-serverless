const { ResponseModel } = require('../../../utils/response-model');

exports.handler = async event => {
    const { connectionId } = event.requestContext;

    const response = new ResponseModel({
        statusCode: 201,
        message: 'User connected successfully',
        data: {
            connectionId,
        },
    });

    return response;
};
