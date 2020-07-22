const {
    Lambda,
    SNS,
    CloudWatch
} = require('aws-sdk');
const RequestError = require('../models/RequestError');
const {
    Client
} = require('@elastic/elasticsearch')
const client = new Client({
    node: process.env.ES_HOST
});



// Lambda environment variables
const SMS_SUBJECT = process.env.SMS_SUBJECT;
const ENVIRONMENT = process.env.ENVIRONMENT;
const REGION = process.env.REGION;
const ROUTINES_INDEX_NAME = process.env.ROUTINES_INDEX_NAME;
const DEMOS_INDEX_NAME = process.env.DEMOS_INDEX_NAME;

module.exports = class AWSService {

    constructor() {
        this.lambda = new Lambda();
        this.sms = new SNS({
            region: REGION
        });
        this.cloudWatch = new CloudWatch();

        // if (!ENVIRONMENT || !SMS_SUBJECT) {
        //     throw new RequestError(HttpCodesEnum.SERVER_ERROR, 'Environment variables APPOINTMENTS_URL and/or SMS_SUBJECT are not configured', {});
        // }
    }

    /**
     * getInstance - Returns AWSService instance
     */
    static getInstance() {
        if (!this.instance) {
            // Create an instance of this AWSService class and return it
            this.instance = new AWSService();
        }
        return this.instance;
    }
    /**
     * 
     * @param {string} name 
     * @param {any} payload 
     */
    async invokeLambda(name, payload) {
        console.log(`Calling lambda ${name} with payload`, payload);
        const params = {
            FunctionName: name,
            Payload: JSON.stringify(payload),
            InvocationType: 'RequestResponse'
        };
        const response = await this.lambda.invoke(params).promise();
        return JSON.parse(JSON.parse(response.Payload).body);
    }

    /**
     * sendTextMessage
     * @param {string} phoneNumber 
     * @param {string} inviteCode 
     * @param {string} message 
     */
    async sendTextMessage(phoneNumber, message) {
        console.log('Sending text message');
        const params = {
            Message: message,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: SMS_SUBJECT
                }
            }
        };
        return this.sms.publish(params).promise();
    }

    /**
     * sendNumericMetric - Send a numeric metric to the cloud watch
     * @param {string} name 
     * @param {number} value 
     * Ref: https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html
     */
    async sendNumericMetric(name, value) {
        console.log(`Sending metric ${name}: ${value}`);
        const params = {
            MetricData: [{
                MetricName: name,
                Value: value,
                Dimensions: [{
                    Name: 'Environment',
                    Value: ENVIRONMENT
                }]
            }],
            Namespace: 'userQueue'
        };
        return this.cloudWatch.putMetricData(params).promise();
    }

    // search the index
    async searchAllRoutines() {
        console.log('> searchAllRoutines');
        console.log('... index name:', ROUTINES_INDEX_NAME);

        const response = await client.search({
            index: ROUTINES_INDEX_NAME,
            // filter the source to only include the quote field
            //_source: ['quote'],
            _source: ["name", "_id"],
            body: {
                query: {
                    match_all: {}
                }
            }
        });

        return response.body.hits.hits;
    }

    /**
     * [getRoutineByTag description]
     * @param  {[type]} tagIds [tag array]
     * @return {[type]}        [json object]
     */
    async getRoutineByTag(tagIds) {
        console.log('...tags =', tagIds);
        console.log('> awsService - getRoutineByTag');
        console.log('... index name:', ROUTINES_INDEX_NAME);

        const response = await client.search({
            index: ROUTINES_INDEX_NAME,
            body: {
                "query": {
                    "terms": {
                        "tags.keyword": tagIds
                    }
                }
            }
        });

        console.log('.....-', JSON.stringify(response.body.hits.hits));

        return response.body.hits.hits;
    };


    /**
     * [getDemoByTag description]
     * @param  {[type]} tagIds [tag id arrays]
     * @return {[type]}        [description]
     */
    async getDemoByTag(tagIds) {
        console.log('...tags =', tagIds.tagIds);
        console.log('> awsService - getDemoByTag');
        console.log('... index name:', DEMOS_INDEX_NAME);

        const response = await client.search({
            index: DEMOS_INDEX_NAME,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "type.keyword": {
                                        "value": process.env.SEARCHABLE_TYPE
                                    }
                                }
                            },
                            {
                                "terms": {
                                    "tags.keyword": tagIds.tagIds
                                }
                            }
                        ]
                    }
                }
            }
        });

        console.log(response);

        return response.body.hits.hits;
    };


};