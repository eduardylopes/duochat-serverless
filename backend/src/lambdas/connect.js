const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { ResponseModel } = require('../utils/response-model');

const { DUOCHAT_TABLE, AWS_REGION } = process.env;

const client = new DynamoDBClient({ region: AWS_REGION });

const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    const { connectionId, domainName, body, channel } = event.requestContext;
    const { userName, avatar } = JSON.parse(body);

    const PK = `USER#${connectionId}`;
    const SK = channel ? `ROOM#${channel}` : 'LOBBY';

    const user = {
        PK,
        SK,
        GSIPK: SK,
        GSISK: PK,
        entity: 'User',
        connectionId,
        userName,
        avatar,
        domainName,
        createdAt: Date.now(),
    };

    const putCommand = new PutCommand({
        TableName: DUOCHAT_TABLE,
        Item: user,
    });

    try {
        await ddbDocClient.send(putCommand);
        return new ResponseModel({
            statusCode: 200,
            message: 'User connected successfully',
        });
    } catch (error) {
        return new ResponseModel({ data: error });
    }
};
