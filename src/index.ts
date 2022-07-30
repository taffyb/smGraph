import { DynamoDBSvc } from './classes/DynamoDBSvc';

const dynamoDBSvc = DynamoDBSvc.getInstance();
const docClient = dynamoDBSvc.getDocClient();

console.log(`Finished`);
