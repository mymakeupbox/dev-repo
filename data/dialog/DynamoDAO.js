
const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
//const DocumentClient = require("aws-sdk/lib/dynamodb/document_client");
const _ = require('lodash');

// Users
const DIALOG_TABLE = process.env.DIALOG_TABLE || "";


module.exports = class DynamoDAO {
  constructor(pLoggingHelper) {
    this.dynamo = new DocumentClient({
      apiVersion: '2012-08-10'
    });
    this.loggingHelper = pLoggingHelper;
  }

  /**
   * getUserById
   * Get the user record from the database keyed on id
   *
   */
  async getDialogByTag(tagId, userLevel) {
    this.loggingHelper.info("--- getDialogByTag ---");
    this.loggingHelper.info("called getDialogByTag ", tagId);
    this.loggingHelper.info("userLevel ", userLevel);

    const params = {
      TableName: DIALOG_TABLE,
      KeyConditionExpression: "tag = :tagId",
      ExpressionAttributeValues: {
        ":tagId": tagId
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    response = _.find(response.Items, { 'level': userLevel });

    return response;
  }

};

