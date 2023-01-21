const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const { ResponseModel } = require('../utils/response-model');

const { DUOCHAT_TABLE } = process.env;
const client = new DynamoDBClient({ region: 'sa-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async event => {
    const { name, adminId, password, maxUsers, isPrivate } = JSON.parse(
        event.body,
    );

    const roomId = v4();

    const newRoom = {
        PK: `ROOM#${roomId}`,
        SK: 'CONFIG',
        entity: 'Room',
        name,
        maxUsers,
        isPrivate,
        adminId,
        createdAt: Date.now(),
        password: isPrivate ? bcrypt.hashSync(password, 10) : undefined,
    };

    const putCommand = new PutCommand({
        TableName: DUOCHAT_TABLE,
        Item: newRoom,
        ConditionExpression: 'attribute_not_exists(name)',
    });

    try {
        await ddbDocClient.send(putCommand);
        return new ResponseModel({
            statusCode: 201,
            message: 'Room created successfully',
        });
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return new ResponseModel({
                statusCode: 400,
                message: 'Already exists a room with the specified name',
            });
        }
        return new ResponseModel();
    }
};
