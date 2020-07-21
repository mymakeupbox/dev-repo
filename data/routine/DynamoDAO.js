const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
const _ = require('lodash');

// Routine table - defined in the serverless.yml
const ROUTINE_TABLE = process.env.ROUTINE_TABLE || "";


module.exports = class DynamoDAO {
  constructor(pLoggingHelper) {
    this.dynamo = new DocumentClient({
      apiVersion: '2012-08-10'
    });
    this.loggingHelper = pLoggingHelper;
  }

};


const listToObjectMappings = (list) => {
  let x = {}
  list.map(item => x[':' + item] = item)
  return x
}


