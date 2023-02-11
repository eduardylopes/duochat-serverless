const {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');

const sendToOne = async (connectionId, payload, endpoint) => {
    const client = new ApiGatewayManagementApiClient({
        endpoint,
    });

    const postToConnectionCommand = new PostToConnectionCommand({
        Data: Buffer.from(JSON.stringify(payload)),
        ConnectionId: connectionId,
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
