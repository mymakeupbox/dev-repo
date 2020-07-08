const { Lambda, SNS, CloudWatch } = require('aws-sdk');
const RequestError = require('../models/RequestError');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ES_HOST })



// Lambda environment variables
const SMS_SUBJECT = process.env.SMS_SUBJECT;
const ENVIRONMENT = process.env.ENVIRONMENT;
const REGION = process.env.REGION;
const INDEX_NAME = process.env.INDEX_NAME;

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
    static getInstance(){
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
    async searchElasticSearch(){

        await client.indices.refresh({ index: INDEX_NAME});

        // Let's search!
        const { body } = await client.search({
            index: INDEX_NAME,
            body: {
                query: {
                    match: { quote: 'winter' }
                }
            }
        })

  console.log(body.hits.hits)

    }
};
