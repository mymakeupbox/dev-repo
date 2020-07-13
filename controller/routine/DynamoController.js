const DynamoDAO = require('../../data/routine/DynamoDAO');
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
     * getRoutineByTag
     * - Get routine by tag
     * @param {string} tagArray 
     */
    async getRoutineByTag(tagIds){
        this.loggingHelper.info('get the routine and associated demos', tagIds);
        return this.dynamoDao.getRoutineByTag(tagIds);
    }; // getRoutineByTag

    /**
     * getAllRoutines
     * Get all routine names and ids
     */
    async getAllRoutines(){
        this.loggingHelper.info('Get all routines names and IDs');
        return this.dynamoDao.getAllRoutines();
    }; // getAllRoutines
    

}