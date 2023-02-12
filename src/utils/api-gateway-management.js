const { ApiGatewayManagementApi } = require('aws-sdk');

const sendToOne = async (connectionId, payload) => {
    const client = new ApiGatewayManagementApi({
        endpoint: process.env.AWS_API_GATEWAY_CONNECTION_URL,
    });

    const params = {
        Data: Buffer.from(JSON.stringify(payload)),
        ConnectionId: connectionId,
    };

    await client.postToConnection(params).promise();
};

const sendToMultiple = async (connectionIds, payload) => {
    const all = connectionIds.map(connectionId =>
        sendToOne(connectionId, payload),
    );

    return Promise.all(all);
};

const deleteConnection = async connectionId => {
    const client = new ApiGatewayManagementApi({
        endpoint: process.env.AWS_API_GATEWAY_CONNECTION_URL,
    });

    const params = {
        ConnectionId: connectionId,
    };

    await client.deleteConnection(params).promise();
};

module.exports = { sendToOne, sendToMultiple, deleteConnection };
