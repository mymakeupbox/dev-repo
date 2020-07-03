const DynamoDAO = require('../../data/interactionHistory/DynamoDAO');
const AWSService = require('../AWSService');

module.exports = class DynamoController {

    /**
     * getInstance - Get a new instance of the DynamoController class
     * @param {obj} loggingHelper 
     */
    static getInstance(loggingHelper) {
        if (!this.instance) {
            this.instance = new DynamoController(loggingHelper);
        }
        return this.instance;
    }

    constructor(loggingHelper) {
        this.loggingHelper = loggingHelper;
        this.dynamoDao = new DynamoDAO(this.loggingHelper);
        this.awsService = AWSService.getInstance(this.loggingHelper);
    }

    /**
     * addNewInteraction
     * Add new interaction history record
     * @param {JSON Object} newInteractionObj 
     */
    async addNewInteraction(newInteractionObj) {
        this.loggingHelper.info('add new interaction record', newInteractionObj.userId);
        return this.dynamoDao.addNewInteraction(newInteractionObj);
    };

    /**
     * getInteractionsByUserId
     * get all interaction records for the user by type
     * @param {*} userId 
     */
    async getInteractionsByUserId(userId, eventType){
        this.loggingHelper.info('user id = ', userId);
        this.loggingHelper.info('eventType = ', eventType);

        return this.dynamoDao.getInteractionsByUserId(userId, eventType);
    };

}