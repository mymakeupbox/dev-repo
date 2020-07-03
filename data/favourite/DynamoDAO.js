const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
var randomstring = require("randomstring");

// Users
const FAVOURITE_TABLE = process.env.FAVOURITE_TABLE || "";
const FAVOURITE_INDEX = process.env.FAVOURITE_INDEX || "";

module.exports = class DynamoDAO {

  constructor(pLoggingHelper) {
    this.dynamo = new DocumentClient({
      apiVersion: '2012-08-10'
    });
    this.loggingHelper = pLoggingHelper;
  }

  /**
   * addNewFavourite
   * Add a favourite record to the favourite table
   * @param {string} item
   */
  async addNewFavourite(item) {
    this.loggingHelper.info("Saving new favourite to DB", item);

    const params = {
      TableName: FAVOURITE_TABLE,
      Item: item
    };
    await this.dynamo.put(params).promise();

    item.success = true;

    return item;
  }

  /**
   * getFavouritesByUserId
   * Get favourites using the user id orderby timestamp
   * @param {string} userId
   */
  async getFavouritesByUserId(userId) {
    this.loggingHelper.info("Get user favourites using user id ", userId);

    const params = {
      TableName: FAVOURITE_TABLE,
      KeyConditionExpression: "userId = :userId",
      //FilterExpression: "eventType = :eventType",
      ExpressionAttributeValues: {
        ":userId": userId
        //":eventType": eventType
      }
    };
    // Execute query 
    let response = await this.dynamo.query(params).promise();

    response.success = true;

    return response;
  }

};