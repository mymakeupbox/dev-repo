const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
//const DocumentClient = require("aws-sdk/lib/dynamodb/document_client");

// Users
const USERS_TABLE = process.env.USERS_TABLE || "";
const USERS_INDEX = process.env.USERS_INDEX || "";

// Tools
const TOOLS_TABLE = process.env.TOOLS_TABLE || "";
const TOOLS_INDEX = process.env.TOOLS_INDEX || "";

const AIRTABLE_API_KEY = "key48NEUz9DnPFN90";

var Airtable = require('airtable');

module.exports = class DynamoDAO {
  constructor(pLoggingHelper) {
    this.dynamo = new DocumentClient({
      apiVersion: '2012-08-10'
    });
    this.loggingHelper = pLoggingHelper;
  }

  /**
   * addItem
   * Add a new user to the user database table
   * @param {string} item
   */
  async addItem(item) {
    this.loggingHelper.info("Saving new item to DB", item);
    const params = {
      TableName: USERS_TABLE,
      Item: item,
      ConditionExpression: "attribute_not_exists( id )"
    };
    await this.dynamo.put(params).promise();
    return item;
  }

  /**
   * getUserById
   * Get the user record from the database keyed on id
   *
   */
  async getUserById(id) {
    this.loggingHelper.info("Getting user id", id);

    const params = {
      IndexName: USERS_INDEX,
      TableName: USERS_TABLE,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    console.log(JSON.stringify(response));
    

    return response;
  }

  /**
   * getUserLevel
   * Get the user level from the database keyed on id
   *
   */
  async getUserLevel(id) {
    this.loggingHelper.info("Getting user id", id);

    let lRtnLevel;
    let lRtnResponse = {};

    const params = {
      TableName: USERS_TABLE,
      ProjectionExpression: "visitCount",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    if (response.Count > 0) {
      let visitCount = response.Items[0].visitCount;

      // Level 1
      if (visitCount <= 10) {
        lRtnLevel = 1;
      }

      // Level 2
      if (visitCount > 10 && visitCount <= 20) {
        lRtnLevel = 2;
      }

      // Level 3
      if (visitCount > 20) {
        lRtnLevel = 3;
      }

      lRtnResponse.userLevel = lRtnLevel;
      lRtnResponse.success = true;

    } else {
      // No record found so userLevel is zero
      lRtnResponse.userLevel = 0;
      lRtnResponse.success = false;
    }

    return lRtnResponse;
  }

  /**
   * checkSubscriberById
   * Get the user record from the database keyed on id
   * returns an
   */
  async checkSubscriberById(id) {
    this.loggingHelper.info("Getting subsciber flag", id);

    let params = {
      IndexName: USERS_INDEX,
      TableName: USERS_TABLE,
      ProjectionExpression: "subscriberFlag",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    return response.Items[0];
  }

  /**
   * updateSubscriber
   * Set the subscriber field to true or false
   * 
   */
  async updateSubscriber(id, subscriberValue) {
    this.loggingHelper.info("Update subscriber flag to ", subscriberValue);
    const params = {
      TableName: USERS_TABLE,
      Key: {
        id: id
      },
      UpdateExpression: `SET subscriberFlag = :subscriber`,
      ExpressionAttributeValues: {
        ":subscriber": subscriberValue
      },
      ReturnValues: "UPDATED_NEW"
    };
    return this.dynamo.update(params).promise();
  };

  /**
   * addNewUserTool
   * @param {string} id 
   * @param {string} toolId 
   */
  async addNewUserTool(id, toolId) {
    this.loggingHelper.info("Update tool array for user ", id);

    // Get the current user details
    let params = {
      IndexName: USERS_INDEX,
      TableName: USERS_TABLE,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    let toolsArray = response.Items[0].tools;

    toolsArray.push(toolId);

    // Update the user table with the new tool
    params = {
      TableName: USERS_TABLE,
      Key: {
        "id": id
      },
      UpdateExpression: "set tools = :newToolsArray",
      ExpressionAttributeValues: {
        ":newToolsArray": toolsArray
      },
      ReturnValues: "UPDATED_NEW"
    };

    response = await this.dynamo.update(params).promise();

    let lRtnJson = {
      tools: response.Attributes.tools,
      success: true
    };

    return lRtnJson;

  }; //addNewUserTool

  /**
   * getPurchases - Get the purchases of the user
   * @param {string} pUserId
   */
  async getPurchases(id) {
    this.loggingHelper.info("Get purchases for user", id);

    let params = {
      IndexName: USERS_INDEX,
      TableName: USERS_TABLE,
      ProjectionExpression: "purchases",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id
      }
    };
    // Scan for the item in the user-id-index
    let response = await this.dynamo.query(params).promise();

    return response.Items[0].purchases;
  }; // getPurchases

  /**
   * getUserTools that the user has
   * @param {string} userId 
   */
  async getUserTools(userId) {
    this.loggingHelper.info("Get tools for user = ", userId);

    let lToolsRtn = [];

    let toolItemRecord;

    var params = {
      IndexName: USERS_INDEX,
      TableName: USERS_TABLE,
      ProjectionExpression: "tools",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": userId
      }
    };
    // Scan for the item in the user-id-index
    let data = await this.dynamo.query(params).promise();

    var toolsObject = {};
    var index = 0;
    data.Items[0].tools.forEach(function (value) {
      index++;
      var toolKey = ":id" + index;
      toolsObject[toolKey.toString()] = value;
    });

    params = {
      TableName: TOOLS_TABLE,
      ProjectionExpression: "id, toolName, imageUrl, toolDescription",
      FilterExpression: "id IN (" + Object.keys(toolsObject).toString() + ")",
      ExpressionAttributeValues: toolsObject

    };

    data = await this.dynamo.scan(params).promise();

    return data.Items;
  }; // getUserTools



  /**
   * addSkinTone
   * Add new skin tone to the user
   */
  async addSkinTone(id, skinTone) {
    this.loggingHelper.info("Update skin tone to ", skinTone);
    const params = {
      TableName: USERS_TABLE,
      Key: {
        id: id
      },
      UpdateExpression: `SET skinTone = :newSkinTone`,
      ExpressionAttributeValues: {
        ":newSkinTone": skinTone
      },
      ReturnValues: "UPDATED_NEW"
    };

    let lDbUpdateResult = this.dynamo.update(params).promise();

    let response = {
      "rtnData": lDbUpdateResult,
      "success": true
    };

    return response;
  }; // addSkinTone

  /**
   * addEyeShape
   * Add eye shape
   */
  async addEyeShape(id, eyeShape) {
    this.loggingHelper.info("Update eye shapeto ", eyeShape);
    const params = {
      TableName: USERS_TABLE,
      Key: {
        id: id
      },
      UpdateExpression: `SET eyeShape = :newEyeShape`,
      ExpressionAttributeValues: {
        ":newEyeShape": eyeShape
      },
      ReturnValues: "UPDATED_NEW"
    };

    let lDbUpdateResult = await this.dynamo.update(params).promise();

    let response = {
      "rtnData": lDbUpdateResult,
      "success": true
    }

    return response;
  }; // addEyeShape


  /**
   * updateUsageCount
   * add 1 to the usage count
   */
  async updateUsageCount(id) {
    this.loggingHelper.info("Update usage count user id =  ", id);

    let lDbUpdateResult = await this.dynamo.update({
      TableName: USERS_TABLE,
      Key: {
        "id": id
      },
      UpdateExpression: "ADD visitCount :increment",
      ExpressionAttributeValues: {
        ":increment": 1
      }
    }).promise();

    let response = {
      "rtnData": lDbUpdateResult,
      "success": true
    }

    return response;
  }; // updateUsageCount

  /**
   * getLastUsedTimestamp
   * Get the last used time stamp
   */
  async getLastUsedTimestamp(id) {
    this.loggingHelper.info("Get the lastUsedTimestamp=  ", id);

    let lDbUpdateResult = await this.dynamo.query({
      IndexName: USERS_INDEX,
      TableName: USERS_TABLE,
      ProjectionExpression: "lastUsedTimestamp",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id
      }
    }).promise();

    let response = {
      "rtnData": lDbUpdateResult,
      "success": true
    }

    return response;
  }; // updateUsageCount





  /**
   * userLogin
   * add 1 to the streak count and return the user details
   */
  async userLogin(id, updatestreak, currentTimestamp) {
    this.loggingHelper.info("userLogin - user id =  ", id);


    // Update the number of visits by 1
    let lDbUpdateResult = await this.dynamo.update({
      TableName: USERS_TABLE,
      Key: {
        "id": id
      },
      UpdateExpression: "ADD visitCount :increment SET lastUsedTimestamp = :newTimestamp",
      ExpressionAttributeValues: {
        ":increment": 1,
        ":newTimestamp": currentTimestamp
      }
    }).promise();

    // If we need to update the streak do so 
    if (updatestreak) {

      lDbUpdateResult = await this.dynamo.update({
        TableName: USERS_TABLE,
        Key: {
          "id": id
        },
        UpdateExpression: "ADD streakCount :increment",
        ExpressionAttributeValues: {
          ":increment": 1
        }
      }).promise();

    }

    let response = {
      "rtnData": lDbUpdateResult,
      "success": true
    }

    return response;
  }; // userLogin
};

/**
 * getToolDetail 
 * Get the details of the tool from the tools airtable
 * @param {string} toolId 
 */
var getToolDetail = toolId => {

  let lRtnJson = {};
  var filterFormula = '({id} = \'' + toolId + '\')';

  const base = new Airtable({
    apiKey: 'key48NEUz9DnPFN90'
  }).base('appAG0QPlc2zZCxNN');

  return new Promise(async function (resolve, reject) {

    base('MAIN').select({
      filterByFormula: filterFormula,
      maxRecords: 1,
      view: "view"
    }).eachPage(function page(records, fetchNextPage) {

      records.forEach(function (record) {
        console.log('Retrieved', record.get('id'));
        lRtnJson = record;
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();

    }, function done(err) {
      if (err) {
        console.log(err);
        reject(lRtnJson);
      } else {
        resolve(lRtnJson);
      }
    });

  }); // Promise


}; // getToolDetail