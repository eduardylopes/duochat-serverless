const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { ResponseModel } = require('../utils/response-model');

const { USERS_TABLE, AWS_REGION } = process.env;

const client = new DynamoDBClient({ region: AWS_REGION });

const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    const { connectionId, domainName } = event.requestContext;

    const connectedClient = {
        id: connectionId,
        date: Date.now(),
        domain: domainName,
    };

    const putCommand = new PutCommand({
        TableName: USERS_TABLE,
        Item: connectedClient,
    });

    try {
        await ddbDocClient.send(putCommand);
        return ResponseModel(
            connectedClient,
            201,
            'Client connected successfully',
        );
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
