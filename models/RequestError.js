module.exports = class RequestError extends Error {

    constructor(statusCode, message, obj){
        super(message);
        this.statusCode = statusCode;
        this.obj = obj;
    }
}