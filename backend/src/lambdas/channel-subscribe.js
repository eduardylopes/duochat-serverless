const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    GetCommand,
    DynamoDBDocumentClient,
    PutCommand,
} = require('@aws-sdk/lib-dynamodb');
const { postToConnection } = require('../utils/api-gateway-management');
const { ResponseModel } = require('../utils/response-model');

const { USERS_TABLE, AWS_REGION } = process.env;

const client = new DynamoDBClient({ region: AWS_REGION });

const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    const { connectionId, domainName, body, stage } = event.requestContext;

    const { channel } = JSON.parse(body);

    const response = new ResponseModel({
        message: `Client ${connectionId} successfully subscribed to the channel ${channel}`,
        statusCode: 200,
    });

    const getCommand = new GetCommand({
        TableName: USERS_TABLE,
        Key: {
            id: connectionId,
        },
    });

    try {
        const { Item } = await ddbDocClient.send(getCommand);
        Item.channel = channel;

        const putCommand = new PutCommand({
            TableName: USERS_TABLE,
            Item,
        });

        await ddbDocClient.send(putCommand);
        await postToConnection.send(domainName, stage, connectionId, response);
        return response;
    } catch (error) {
        const errorResponse = new ResponseModel({
            data: error,
            statusCode: 500,
        });

        return errorResponse;
    }
};
