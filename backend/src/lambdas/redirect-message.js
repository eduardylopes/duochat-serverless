const { postToConnection } = require('../utils/api-gateway-management');
const { ResponseModel } = require('../utils/response-model');

exports.handler = async (connectionId, body, domainName, stage) => {
    const response = new ResponseModel({
        statusCode: 200,
        message: 'Message redirected to database',
    });

    try {
        await postToConnection(domainName, stage, connectionId, response);
        return response;
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
