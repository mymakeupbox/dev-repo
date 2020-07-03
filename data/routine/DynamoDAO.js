const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
//const DocumentClient = require("aws-sdk/lib/dynamodb/document_client");
const _ = require('lodash');

// Users
const ROUTINE_TABLE = process.env.ROUTINE_TABLE || "";


module.exports = class DynamoDAO {
  constructor(pLoggingHelper) {
    this.dynamo = new DocumentClient({
      apiVersion: '2012-08-10'
    });
    this.loggingHelper = pLoggingHelper;
  }

  /**
   * getRoutineByTag
   * Get the routine and related demos
   */
  async getRoutineByTag(tagIds) {

    this.loggingHelper.info("called getRoutineByTag ", tagIds);


    var params = {
      TableName: ROUTINE_TABLE
    };

    this.dynamo.scan(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        //console.log("Success", data.Items);
        data.Items.forEach(function(element, index, array) {
          console.log(element);
        });
      }
    });

    let response;


    //let response = await this.dynamo.scan(params).promise();

    //let tagIdArray = tagIds.split(',');

    // var tagObject = {};

    // var index = 0;

    // tagIds.forEach(function (value) {

    //   index++;

    //   var tagKey = ":tagvalue" + index;

    //   tagObject[tagKey.toString()] = value;

    // });

    // var params = {
    //   TableName: ROUTINE_TABLE,
    //   FilterExpression: "tags IN (" + Object.keys(tagObject).toString() + ")",
    //   ExpressionAttributeValues: tagObject
    // };
  
  //let statuses = ['available', 'in-transit', 'delivered']
  // let mappings = listToObjectMappings(tagIds)
  // let joined = Object.keys(mappings).join();
  
  // let params = {
  //     TableName: ROUTINE_TABLE,
  //     FilterExpression: '#tags IN (' + joined + ')',
  //     ExpressionAttributeNames: {
  //         '#tags' : 'tags'
  //     },
  //     ExpressionAttributeValues: mappings
  // }

  //   console.log('...params =', params);
    

    // const params = {
    //   TableName: ROUTINE_TABLE,
    //   FilterExpression: "tag IN :tagId",
    //   ExpressionAttributeValues: {
    //     ":tagId": tagId
    //   }
    // };
    // Scan for the item in the user-id-index
    //let response = await this.dynamo.scan(params).promise();

    return response;
  }

};


const listToObjectMappings = (list) => {
  let x = {}
  list.map(item => x[':' + item] = item)
  return x
}