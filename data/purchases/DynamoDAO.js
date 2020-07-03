const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
var randomstring = require("randomstring");
var _ = require('lodash');
//const DocumentClient = require("aws-sdk/lib/dynamodb/document_client");

// Users
const PURCHASES_TABLE = process.env.PURCHASES_TABLE || "";




module.exports = class DynamoDAO {
  constructor(pLoggingHelper) {
    this.dynamo = new DocumentClient({
      apiVersion: '2012-08-10'
    });
    this.loggingHelper = pLoggingHelper;
  }

  /**
   * addNewPurchase - put a new object into the database
   * @param {JSON OBJ} newPurchaseObj 
   */
  async addNewPurchase(item){
    this.loggingHelper.info("Saving new purchase to DB", item);

    const params = {
      TableName: PURCHASES_TABLE,
      Item: item
    };
    await this.dynamo.put(params).promise();

    let lRtnJson = {
      Item: item,
      success: true
    }

    console.log(lRtnJson);

    return lRtnJson;

  };

  /**
   * getPurchasesByUserId
   * - Get purchases by the user id, sorted by timestamp
   * @param {String} userId 
   */
  async getPurchasesByUserId(userId){

    this.loggingHelper.info("Get user purchases using user id ", userId);

    const params = {
      TableName: PURCHASES_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    return response;

  }; // end getPurchasesByUserId
  /**
   * getLatestPurchaseByUserId
   * - Get latest purchase by the user id, sorted by timestamp
   * @param {String} userId 
   */
  async getLatestPurchaseByUserId(userId){

    this.loggingHelper.info("Get the latest purchase using user id ", userId);

    const params = {
      TableName: PURCHASES_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    response.Items = _.head(response.Items);

    response.Count = 1;
    response.ScannedCount = 1;
    response.success = true;
   
    console.log('response = ', JSON.stringify(response));

    return response;

  }; // end getPurchasesByUserId
  


};

