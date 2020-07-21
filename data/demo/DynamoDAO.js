const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
const _ = require('lodash');

// Users
const DEMO_TABLE = process.env.DEMO_TABLE || "";


module.exports = class DynamoDAO {
  constructor(pLoggingHelper) {
    this.dynamo = new DocumentClient({
      apiVersion: '2012-08-10'
    });
    this.loggingHelper = pLoggingHelper;
  }

  /**
   * getDemoById
   * Get the demo record from the database keyed on id
   *
   */
  async getDemoById(demoId) {
    this.loggingHelper.info("--- getDemoById ---");
    this.loggingHelper.info("called getDemoById ", demoId);

    const params = {
      TableName: DEMO_TABLE,
      KeyConditionExpression: "demoId = :demoId",
      ExpressionAttributeValues: {
        ":demoId": demoId
      }
    };

    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    console.log('...res=', JSON.stringify(response));

    if (typeof response === "undefined") {
      console.log('!NO_RECORDS_FOUND');

      response = {
        "Items": [{}],
        "Count": 0,
        "ScannedCount": 0
      }
    }

    return response;
  };


  /**
   * getDemoByTag
   * Get the demos that have a type of 'S' 
   */
  async getDemoByTag(tagIds) {

    this.loggingHelper.info("called getDemoByTag ", tagIds);

    let response = await this.awsService.getDemoByTag(tagIds);

    return response;

  }; // getRoutineByTag

};