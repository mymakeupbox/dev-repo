module.exports = class LoggingHelper {

    /**
     * getInstance - Get a new instance of the loggingHelper class
     * @param {string} correlationId 
     */
    static getInstance(id) {
        if (!this.instance) {
            this.instance = new LoggingHelper(id);
        } else {
            this.instance.id = id;
        }
        return this.instance;
    }

    constructor(id) {
        this.id = id;
    }

    /**
     * debug
     * @param {string} message 
     * @param  {...any} parameters 
     */
    debug(message, ...parameters) {
        console.debug(this.formatMessage(message), parameters);
    }

    info(message, ...parameters) {
        console.info(this.formatMessage(message), parameters);
    }

    trace(message, ...parameters) {
        console.trace(this.formatMessage(message), parameters);
    }

    warn(message, ...parameters) {
        console.warn(this.formatMessage(message), parameters);
    }

    error(message, ...parameters) {
        console.error(this.formatMessage(`ERROR: 500 - ${message}`), parameters);
    }

    formatMessage(message) {
        return `User - id[${this.id}] - ${message}`;
    }
}