module.exports = class Response {

    constructor(status, response, message = "") {
        this.statusCode = status;
        this.response = response;
        this.message = message;
    }
}