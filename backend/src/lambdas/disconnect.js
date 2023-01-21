const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DeleteCommand,
    DynamoDBDocumentClient,
} = require('@aws-sdk/lib-dynamodb');
const { postToConnection } = require('../utils/api-gateway-management');
const { ResponseModel } = require('../utils/response-model');

const { USERS_TABLE, AWS_REGION } = process.env;

const client = new DynamoDBClient({ region: AWS_REGION });

const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    const { connectionId, domainName, stage } = event.requestContext;

    const deleteCommand = new DeleteCommand({
        TableName: USERS_TABLE,
        Key: {
            id: connectionId,
        },
    });

    try {
        await ddbDocClient.send(deleteCommand);
        const response = new ResponseModel({
            statusCode: 200,
            message: 'User disconnected',
        });

        await postToConnection(domainName, stage, connectionId, response);

        return response;
    } catch (error) {
        const errorResponse = new ResponseModel({
            message: 'Failed to disconnect user',
        });

        return errorResponse;
    }
};
