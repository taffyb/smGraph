import { DynamoDB } from 'aws-sdk';
import { IQueryResult, QueryResult } from '../classes/IQueryResult';

export class DynamoQueries {
    static getGameCount(docClient: DynamoDB.DocumentClient): IQueryResult {
        const result = new QueryResult();
        result.result = {'count': 0};
        return result;
    }

    static getPlayerDetails(docClient: DynamoDB.DocumentClient, playerUuid: String): Promise<IQueryResult> {
        let result: IQueryResult ;
        return new Promise<IQueryResult>((resolve, reject) => {
            const TABLE_NAME = 'sm_players';
            const item = {
                TableName: TABLE_NAME,
                Key: {
                    'uuid': playerUuid
                }
            };
            docClient.get(item, function (err, data) {
                result = new QueryResult();
                if (err) {
                    result.error = err;
                } else {
                    result.result = data.Item;
                }
                resolve(result);
            });
        });
    }
    static getPlayerOpponents(docClient: DynamoDB.DocumentClient, playerUuid: String): Promise<IQueryResult> {
        const result: IQueryResult = new QueryResult();
        return new Promise<IQueryResult>((resolve, reject) => {

            const opponents$: Promise<IQueryResult>[] = [];
            const opponentUuids: any = {};
            const params = {
                TableName: 'sm_opponents',
                KeyConditionExpression: 'p1Uuid = :p1Uuid',
                ExpressionAttributeValues: {
                    ':p1Uuid': playerUuid
                },
                ProjectionExpression: 'p1Uuid, p2Uuid, score_card'
            };

            docClient.query(params, (err, data) => {
                if (err) {
                    console.error(`Unable to get opponents for:${playerUuid} .
                                    Error JSON:${JSON.stringify(err, null, 2)}`);
                    result.error = err;
                    resolve(result);
                } else {
                    // console.log(`Opponents: ${data.Items.length}`);
                    data.Items.forEach((o) => {

                        opponents$.push(new Promise<IQueryResult>((res, rej) => {
                            const r = new QueryResult();
                            const item = {
                                TableName: 'sm_players',
                                Key: {
                                    'uuid': o.p2Uuid
                                },
                                AttributesToGet: ['name']
                            };
                            // For each opponent get their name
                            docClient.get(item, (e, d) => {
                                if (e) {
                                    console.error(`Unable to get Item:${JSON.stringify(item)} .
                                                    Error JSON:${JSON.stringify(e, null, 2)}`);
                                    r.result = e;
                                    res(r);
                                } else {
                                    if (d.Item) {
                                        o['p2Name'] = d.Item.name;
                                    }
                                    r.result = o;
                                    res(r);
                                }
                            });
                        }));
                    });
                    // console.log(`Opponents$: ${opponents$.length}`);
                    Promise.all(opponents$).then((opponents) => {
                        // console.log(`opopponents: ${JSON.stringify(opponents, null, 2)}`);

                        result.result = opponents;
                        resolve(result);
                    });
                }
            });
        });
    }
}
