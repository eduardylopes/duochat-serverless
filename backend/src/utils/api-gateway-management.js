const {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');

const { AWS_REGION } = process.env;

const postToConnection = async (domainName, stage, connectionId, payload) => {
    const endpoint = `${domainName}/${stage}`;

    const client = new ApiGatewayManagementApiClient({
        endpoint,
        region: AWS_REGION,
    });

    const postToConnectionCommand = await PostToConnectionCommand({
        connectionId,
        Data: Buffer.from(JSON.stringify(payload)),
    });

    const response = await client.send(postToConnectionCommand);

    return response;
};

module.exports = { postToConnection };
