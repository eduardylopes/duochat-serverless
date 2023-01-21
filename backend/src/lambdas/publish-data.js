const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    ScanCommand,
    DynamoDBDocumentClient,
} = require('@aws-sdk/lib-dynamodb');
const { postToConnection } = require('../utils/api-gateway-management');
const { ResponseModel } = require('../utils/response-model');

const { DUOCHAT_TABLE, AWS_REGION } = process.env;

const client = new DynamoDBClient({ region: AWS_REGION });

const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    const { connectionId, body: eventBody, domainName, stage } = event;
    const { channel, body } = JSON.parse(eventBody);

    const scanCommand = new ScanCommand({
        TableName: DUOCHAT_TABLE,
        KeyConditionalExpression: '#PK = :PK and begins_with(#PK, :PK)',
        ExpressionAttributeNames: {
            '#PK': 'PK',
            '#SK': 'SK',
        },
        ExpressionAttributeValues: {
            ':PK': `ROOM#${channel}`,
            ':SK': 'USER',
        },
    });

    try {
        const { Items } = await ddbDocClient.send(scanCommand);

        Items.forEach(connectedUser =>
            postToConnection(domainName, stage, connectedUser.Id, body),
        );

        const response = new ResponseModel({
            statusCode: 200,
            message: `User ${connectionId} published a message to everyone connected to channel ${channel}`,
        });

        await postToConnection(domainName, stage, connectionId, response);

        return response;
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
