import AWS from 'aws-sdk';
import {DynamoDB} from 'aws-sdk';
import dotenv from 'dotenv';

export class DynamoDBSvc {
    private static dynamoDBSvc: DynamoDBSvc;
    private docClient: DynamoDB.DocumentClient;

    private constructor() {
        dotenv.config();
        const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
        const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

        AWS.config.update({
            'region': 'eu-west-2',
            'accessKeyId': AWS_ACCESS_KEY_ID,
            'secretAccessKey': AWS_SECRET_ACCESS_KEY
        });

        this.docClient = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    }

    static getInstance(): DynamoDBSvc {
        if (!this.dynamoDBSvc) {
            this.dynamoDBSvc = new DynamoDBSvc();
        }
        return this.dynamoDBSvc;
    }
    getDocClient(): DynamoDB.DocumentClient {
        return this.docClient;
    }
}
