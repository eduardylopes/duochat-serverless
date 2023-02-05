const {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');

const sendToOne = async (connectionId, payload) => {
    const client = new ApiGatewayManagementApiClient({
        region: process.env.AWS_REGION,
    });

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
