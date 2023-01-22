const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DeleteCommand,
    DynamoDBDocumentClient,
} = require('@aws-sdk/lib-dynamodb');
const { postToConnection } = require('../utils/api-gateway-management');
const { ResponseModel } = require('../utils/response-model');

const { DUOCHAT_TABLE, AWS_REGION } = process.env;

const client = new DynamoDBClient({ region: AWS_REGION });

const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    const { userId, roomId } = JSON.parse(event.body);

    const deleteCommand = new DeleteCommand({
        TableName: DUOCHAT_TABLE,
        Key: {
            PK: userId,
            SK: roomId,
        },
    });

    try {
        await ddbDocClient.send(deleteCommand);
        const response = new ResponseModel({
            statusCode: 200,
            message: 'User disconnected',
        });

        return response;
    } catch (error) {
        const errorResponse = new ResponseModel({
            message: 'Failed to disconnect user',
            date: error,
        });

        return errorResponse;
    }
};
