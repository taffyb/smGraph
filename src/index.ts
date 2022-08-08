import { DynamoDBSvc } from './classes/DynamoDBSvc';
import { IQueryResult } from './classes/IQueryResult';
import { DynamoQueries } from './dynamodb/dynamoQueries';
import * as readline from 'readline';
import { toNumber } from 'neo4j-driver-core';

const menuOption = {option: 1, params: [{name: '', value: ''}]};

const execute = async () => {
    const dynamoDBSvc = DynamoDBSvc.getInstance();
    const docClient = dynamoDBSvc.getDocClient();
    let result: IQueryResult;

    // console.log(menuOption);

    switch (menuOption.option) {
        case 1:
            console.log(`Total Games:\n ${JSON.stringify(DynamoQueries.getGameCount(docClient).result)}`);
            break;
        case 2:
            result = await  DynamoQueries.getPlayerDetails(docClient, menuOption.params[0].value);
            if (!result.error) {
                console.log(`Player Details:\n ${JSON.stringify(result.result, null, 2)}`);
            } else {
                console.error(`Player Details Error:\n ${JSON.stringify(result.error, null, 2)}`);
            }
            break;
        case 3:
            result = await  DynamoQueries.getPlayerOpponents(docClient, menuOption.params[0].value);
            console.log(`${menuOption.params[0].name}: ${menuOption.params[0].value}`);
            if (!result.error) {
                console.log(`Player Opponents:\n ${JSON.stringify(result.result.length, null, 2)}`);
                console.log(`${JSON.stringify(result.result, null, 2)}`);
            } else {
                console.error(`Player Opponents Error:\n ${JSON.stringify(result.error, null, 2)}`);

            }
            console.log(`Finished`);
    }

};

const getParams = (rl: any, paramOptions: any, idx: number, paramValues: any[]): Promise<any[]> => {
    // console.log(`${idx} < ${paramOptions.length - 1}`);
    return new Promise<any[]>((resolve, reject) => {
        if (idx < paramOptions.length - 1) {
            getParams(rl, paramOptions, idx++, paramValues);
        } else {
            rl.question(`Enter a value for <${paramOptions[idx].name}>:`, (val: string) => {
                // switch (paramOptions[idx].type) {
                //     case 'string':
                console.log(`val:${val}`);

                        paramValues.push(val);
                    //     break;
                    // case 'integer':
                    //     paramValues.push(Number.parseInt(val, 10));
                    //     break;
                // }
                resolve(paramValues);
            });
        }
    });
};
const displayMenu = async () => {

    const menu: {[index: string]: any} = {
        '1': {
            'name': 'getGameCount'
            },
        '2': {
            'name': 'getPlayerDetails',
            'params': [{
                'name': 'playerUuid',
                'type': 'string'
                }]
            },
        '3': {
            'name': 'getPlayerOpponents',
            'params': [{
                'name': 'playerUuid',
                'type': 'string'
                }]
            }
    };
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    (Object.keys(menu) as (keyof typeof menu)[]).forEach((key, index) => {
        console.log(key, menu[key].name);
    });

    rl.question(`Select Option to run:`, async (option) => {
        // console.log(`You selected to run [${menu[option].name}]`);
        menuOption.option = toNumber(option);
        const params: any[] = [];
        if (menu[option].params) {
            await getParams(rl, menu[option].params, 0, params);
            const paramArr: any[] = [];
            for (let i = 0; i < menu[option].params.length; i++) {
                // console.log(`${menu[option].params[i].name} = ${params[i]}`);
                paramArr.push({name: menu[option].params[i].name, value: params[i]}) ;
            }

            menuOption.params = paramArr;
            console.log(`\n\n\n${menu[option].name}\n`);

            execute();
        }
        rl.close();
    });
};
displayMenu();
// const playerUuid = '108dc293-f638-4b10-b50b-d1baa70c4271';
