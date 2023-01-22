const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    PutCommand,
    DynamoDBDocumentClient,
    ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const { v4 } = require('uuid');
const { ResponseModel } = require('../utils/response-model');

const { DUOCHAT_TABLE, AWS_REGION } = process.env;
const client = new DynamoDBClient({
    region: AWS_REGION,
    endpoint: 'http://localhost:8000',
});

const marshallOptions = {
    removeUndefinedValues: true,
};

const translateConfig = { marshallOptions };

const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig);

exports.handler = async event => {
    const { body } = event;
    const { roomName, adminId, maxUsers, isPrivate, password } =
        JSON.parse(body);

    const scanCommand = new ScanCommand({
        TableName: DUOCHAT_TABLE,
        FilterExpression: '#roomName = :roomName',
        ExpressionAttributeNames: {
            '#roomName': 'roomName',
        },
        ExpressionAttributeValues: {
            ':roomName': roomName,
        },
    });

    const { Items } = await ddbDocClient.send(scanCommand);

    if (Items.length) {
        return new ResponseModel({
            statusCode: 400,
            message: 'Already exists a room with the specified name',
        });
    }

    try {
        const roomId = v4();

        const newRoom = {
            PK: `ROOM#${roomId}`,
            SK: 'CONFIG',
            entity: 'Room',
            roomName,
            adminId,
            maxUsers,
            isPrivate,
            password,
            createdAt: Date.now(),
        };

        const putCommand = new PutCommand({
            TableName: DUOCHAT_TABLE,
            Item: newRoom,
        });

        await ddbDocClient.send(putCommand);

        return new ResponseModel({
            statusCode: 201,
            message: 'Room created successfully',
            data: newRoom,
        });
    } catch (error) {
        return new ResponseModel();
    }
};
