import {
    ApiGatewayManagementApiClient,
    DeleteConnectionCommand,
    PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

const sendToOne = async (connectionId, payload) => {
    const client = new ApiGatewayManagementApiClient({
        endpoint: process.env.AWS_API_GATEWAY_CONNECTION_URL,
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

const deleteConnection = async connectionId => {
    const client = new ApiGatewayManagementApiClient({
        endpoint: process.env.AWS_API_GATEWAY_CONNECTION_URL,
    });

    const deleteConnectionCommand = new DeleteConnectionCommand({
        ConnectionId: connectionId,
    });

    const response = await client.send(deleteConnectionCommand);

    return response;
};

module.exports = { sendToOne, sendToMultiple, deleteConnection };
