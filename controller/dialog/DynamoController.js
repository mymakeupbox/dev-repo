const DynamoDAO = require('../../data/dialog/DynamoDAO');
const userDynamoDAO = require('../../data/user/DynamoDAO');
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
        this.user_DynamoDAO = new userDynamoDAO(this.loggingHelper);
        this.awsService = AWSService.getInstance(this.loggingHelper);
    }

    /**
     * getDialogByTag
     * get the dialog using the tag id
     * @param {string} userId 
     * @param {string} tagId 
     * 
     */
    async getDialogByTag(userId,tagId){
        this.loggingHelper.info('user id = ', userId);
        this.loggingHelper.info('tag id = ', tagId);

        let lUserLevel = await this.user_DynamoDAO.getUserLevel(userId);

        this.loggingHelper.info(' user level = ', lUserLevel.userLevel);

        return this.dynamoDao.getDialogByTag(tagId, lUserLevel.userLevel);
    };

    

}