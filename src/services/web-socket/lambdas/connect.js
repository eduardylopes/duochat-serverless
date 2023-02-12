import { ResponseModel } from '../../../utils/response-model.js';

export const handler = async event => {
    console.log('requestContext-----------------', event.requestContext);

    return new ResponseModel({
        statusCode: 200,
        message: 'User connected successfully',
    });
};
