const DynamoDAO = require('../../data/demo/DynamoDAO');
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
     * getDemoById
     * get the demo by id
     * @param {string} demoId
     */
    async getDemoById(demoId){
        this.loggingHelper.info('demo id = ', demoId);

        return this.dynamoDao.getDemoById(demoId);
    };

    

}