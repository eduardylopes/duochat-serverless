import { ResponseModel } from '../../../utils/response-model.js';

export const handler = async event => {
    return new ResponseModel({
        statusCode: 200,
        message: 'User connected successfully',
    });
};
