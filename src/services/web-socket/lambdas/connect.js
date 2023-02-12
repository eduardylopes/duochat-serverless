const { ResponseModel } = require('../../../utils/response-model');

exports.handler = async event => {
    console.log('requestContext-----------------', event.requestContext);

    return new ResponseModel({
        statusCode: 200,
        message: 'User connected successfully',
    });
};
