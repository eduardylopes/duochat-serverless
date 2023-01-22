const {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
    DeleteConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');

const { AWS_REGION } = process.env;

const sendToOne = async (connectionId, payload) => {
    const client = new ApiGatewayManagementApiClient({ region: AWS_REGION });

    const postToConnectionCommand = await PostToConnectionCommand({
        connectionId,
        Data: Buffer.from(JSON.stringify(payload)),
    });

    const response = await client.send(postToConnectionCommand);

    return response;
};

const sendToMultiple = async (connectionIds, payload) => {
    const all = connectionIds.map(connectionId =>
        sendToOne(connectionId, payload),
    );

    return Promise.all(all);
};

module.exports = { sendToOne, sendToMultiple };
