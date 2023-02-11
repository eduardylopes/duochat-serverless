const { ResponseModel } = require('../utils/response-model');
const { postToConnection } = require('../utils/api-gateway-management');

exports.handler = async event => {
    console.log(event);

    try {
        const response = new ResponseModel({
            status: 404,
            message: 'Route not found',
        });

        await postToConnection(domainName, stage, connectionId, response);
    } catch (error) {
        const errorResponse = new ResponseModel({
            message: error,
        });

        await postToConnection(domainName, stage, connectionId, errorResponse);
    }
};
