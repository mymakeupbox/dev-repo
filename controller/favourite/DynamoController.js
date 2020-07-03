const DynamoDAO = require('../../data/favourite/DynamoDAO');
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
     * addNewFavourite
     * Add new favourite item
     * @param {JSON Object} item 
     */
    async addNewFavourite(item) {
        this.loggingHelper.info('add new favourite record', item.userId);
        return this.dynamoDao.addNewFavourite(item);
    };

    /**
     * getFavouritesByUserId
     * get all favourite records for the user by id
     * @param {*} userId 
     */
    async getFavouritesByUserId(userId){
        this.loggingHelper.info('user id = ', userId);

        return this.dynamoDao.getFavouritesByUserId(userId);
    };

    

}