const mongoose = require('mongoose');
const { sendToOne } = require('../../../utils/api-gateway-management');

mongoose.connect(process.env.MONGODB_URI);

exports.handler = async event => {
    const { connectionId } = event.requestContext;

    await sendToOne(connectionId, connectionId);

    return {};
};
