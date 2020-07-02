const RequestError = require('../models/RequestError');


const HttpCodesEnum = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    PRECONDITION_FAILED: 412,
    UNPROCESSABLE_ENTITY: 422,
    SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501
};

const AppCodes = {
    S0001:"S0001_SRQ",
    E1001:"E1001_SRQ",
    E1002:"E1002_SRQ",
    E1003:"E1003_SRQ",
    E1004:"E1004_SRQ",
    E1005:"E1005_SRQ",
    E1006:"E1006_SRQ",
    E1007:"E1007_SRQ",
    E1008:"E1008_SRQ",
    E1009:"E1009_SRQ"
};

const VALID_METHODS = 'OPTIONS,POST,GET';
const VALID_HEADERS = 'Content-Type,Authorization,x-urlcode,X-Correlation-Id';

module.exports =  class ResponseHelper {

    constructor(event, loggingHelper) {
        this.event = event;
        this.loggingHelper = loggingHelper;
        this.origin = '';//event.headers.Origin || event.headers.origin || '';
        this.validOrigins = '';//process.env.URL_ENDING ? JSON.parse(process.env.URL_ENDING) : [];
        this.filteredOrigin = '';//this.validOrigins.some((validEnd) => this.origin.endsWith(validEnd)) ? this.origin : '';
    }

    isValidOrigin() {
        if (this.origin && !this.filteredOrigin) {
            const errObj = { validOrigins: this.validOrigins, origin: this.origin, headers: this.event.headers };
            this.loggingHelper.error("isValidOrigin - no valid Origin header", HttpCodesEnum.PRECONDITION_FAILED, errObj);
            throw new RequestError(HttpCodesEnum.PRECONDITION_FAILED, "Valid 'Origin' header not present in request", errObj);
        }
        return true;
    }

    getHeaders() {
        return {
            'Access-Control-Allow-Origin': this.origin ? this.filteredOrigin : '*', 
            'Access-Control-Allow-Methods': VALID_METHODS,
            'Access-Control-Allow-Headers': VALID_HEADERS,
        }
    }

    getErrorResponse(error) {
        this.statusCode = (error.statusCode) ? error.statusCode : HttpCodesEnum.SERVER_ERROR;
        this.body = JSON.stringify({ statusCode: this.statusCode, message: error.message, error, success: false });
        const errorResponse = {
            statusCode: this.statusCode,
            headers: this.getHeaders(),
            body: this.body
        };
        this.loggingHelper.info(`getErrorResponse - sending Error response`, ResponseHelper.name, { error: errorResponse, finalStatus: AppCodes.E1009});
        return errorResponse;
    }
    
    getSuccessfulResponse(response) {
        this.loggingHelper.info(`getSuccessfulResponse - sending Successful response`, ResponseHelper.name, { finalStatus: AppCodes.S0001, response });
        console.log(response.response);
        
        
        return {
            statusCode: response.statusCode,
            headers: this.getHeaders(),
            body: response.response
        };
    }
}