import AWS from 'aws-sdk';
import {DynamoDB} from 'aws-sdk';
// import {fromIni} from 'aws-sdk/credential-providers';

export class DynamoDBSvc {
    private static dynamoDBSvc: DynamoDBSvc;
    private docClient: DynamoDB.DocumentClient;

    private constructor() {

        AWS.config.update({'region': 'eu-west-2'});

        this.docClient = new DynamoDB.DocumentClient({
            apiVersion: '2012-08-10'
            // ,
            // credentials: fromIni({profile: 'default'})
        });
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
