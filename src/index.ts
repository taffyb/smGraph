import { DynamoDBSvc } from './classes/DynamoDBSvc';
import { IQueryResult } from './classes/IQueryResult';
import { DynamoQueries } from './dynamodb/dynamoQueries';

const execute = async () => {
    const dynamoDBSvc = DynamoDBSvc.getInstance();
    const docClient = dynamoDBSvc.getDocClient();
    let result: IQueryResult;

    // console.log(`Total Games:\n ${JSON.stringify(DynamoQueries.getGameCount(docClient).result)}`);
    // result = await  DynamoQueries.getPlayerDetails(docClient, 'fcf28683-5f23-4ecd-ab81-be41e341c9f4');
    // if (!result.error) {
    //     console.log(`Player Details:\n ${JSON.stringify(result.result, null, 2)}`);
    // } else {
    //     console.error(`Player Details Error:\n ${JSON.stringify(result.error, null, 2)}`);

    // }
    const playerUuid = '108dc293-f638-4b10-b50b-d1baa70c4271';
    result = await  DynamoQueries.getPlayerOpponents(docClient, playerUuid);
    console.log(`Player: ${playerUuid}`);
    if (!result.error) {
        console.log(`Player Opponents:\n ${JSON.stringify(result.result.length, null, 2)}`);
        console.log(`${JSON.stringify(result.result, null, 2)}`);
    } else {
        console.error(`Player Opponents Error:\n ${JSON.stringify(result.error, null, 2)}`);

    }
    console.log(`Finished`);
};

execute();
