import Neo4j from 'neo4j-driver';
import {CypherSvc} from './CypherSvc';
import dotenv from 'dotenv';

export class Neo4jSvc {
    private static neo4jSvc: Neo4jSvc;
    private session: typeof Neo4j.Session;
    private lastSession: number =  Date.now();
    private RESET_INTERVAL = 1 * 60 * 1000; // 1 minute
    private driver: typeof Neo4j.Driver = Neo4j.Driver;
    private connection: string;
    private auth: any;

    constructor() {
        dotenv.config();
        this.connection = process.env.NEO4J_PROTOCOL + '://' + process.env.NEO4J_HOST + ':' + process.env.NEO4J_PORT;

        console.log( `connection:${ this.connection }` );

        this.auth = Neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD);
        this.driver = Neo4j.driver(this.connection, this.auth);
        this.session = this.driver.session();

        console.log( `Neo4jSvc initialised` );
    }

    static getInstance(): Neo4jSvc {
        if (!this.neo4jSvc) {
            this.neo4jSvc = new Neo4jSvc();
        }
        return this.neo4jSvc;
    }

    private getNewSession() {
        const now = Date.now();
        if (!this.lastSession || (now - this.lastSession) > this.RESET_INTERVAL ) {
            if (this.lastSession) { // there is an existing driver connection so close it.
                this.driver.close();
            }
            this.driver = Neo4j.driver(this.connection, this.auth);
    /*
            driver.onCompleted = function () {
                console.log("Sucessful connection "+connection);
            };
            driver.onError = function (error) {
                console.log('Driver instantiation failed', error);
            };
    */
            this.lastSession = now;
        }
        const session = this.driver.session();
        return session;
    }

    executeCypher(query: string, params: any, debug: boolean= false): Promise<any> {
        const me = this;
        const results = new Promise((resolve, reject) => {
            const session = this.getNewSession();
            const myParams: any = params || {};
            let cypher;
            if (query.endsWith('.cyp')) {
                cypher = CypherSvc.readCypherFromFile(query);
            } else {
                cypher = query;
            }
            if (debug) {
                console.log(`***executeCypher***\nQueryName: ${query.endsWith('.cyp') ? query : ''}\nCypher:\n${cypher}\n:param ${JSON.stringify(myParams)}`);
            }
            session
            .run(cypher, myParams)
            .then(function (result: {records: Array<typeof Neo4j.Record>, summary: typeof Neo4j.ResultSummary}) {
                session.close();
                const cleanResults: typeof Neo4j.Record[] = [];
                if (debug) {
                    console.log(`executeCypher RESULT:\n${JSON.stringify(result)}`);
                }
                if (result.records) {
                   if (result.records.length === 1) {
                      resolve([me.cleanRecord(me, result.records[0])]);
                   } else {
                      result.records.forEach((record: typeof Neo4j.Record) => {
                          cleanResults.push(me.cleanRecord(me, record));
                      });
                      resolve(cleanResults);
                    }
                  }
            })
            .catch(function (error: typeof Neo4j.Neo4jError) {
                session.close();
                console.log(`executeCypher ERROR: ${error.code}\n${error.message}`);
                reject(error);
            });
        });
        return results;
    }

    private cleanRecord(me: Neo4jSvc, record: typeof Neo4j.Record): any {
        const cleanResult: any = {};

        record.keys.forEach((key: string) => {
            if (record.get(key).properties) {
                cleanResult[key] = me.clean(me, record.get(key).properties);
            } else if (Array.isArray(record.get(key))) {
                cleanResult[key] = me.clean(me, record.get(key));
            } else if (me.isObject(record.get(key))) {
                cleanResult[key] = me.clean(me, record.get(key));
            } else {
                cleanResult[key] = record.get(key);
            }
        });
        return cleanResult;
    }

    private clean(me: Neo4jSvc, obj: any): any {
//        console.log(`**** clean ****`);
        let rtn: any;
        if (Array.isArray(obj)) {
            rtn = [];
            obj.forEach((o) => {
               rtn.push( me.clean(me, o));
            });
        } else if (obj.properties) {
                rtn = {};
                for (const p in obj.properties) {
                    if (me.isObject(obj.properties[p])) {
//                        console.log(`${p}: ${JSON.stringify(obj.properties[p])}`);
                        const o: any = obj.properties[p];
                        if (me.isNeo4jNumber(o)) {
                            rtn[p] = Neo4j.integer.toNumber(o);
                        } else if (o.properties) {
//                            console.log(`more properties ... ${JSON.stringify(o)}`);
                            rtn[p] = me.clean(me, o);
                        } else {
                            rtn[p] = o;
                        }
                    } else {
                        rtn[p] = obj.properties[p];
                    }
                }
         } else {
            if (me.isObject(obj)) {
                rtn = {};
//                console.log(`obj is an Object keys:${JSON.stringify(Object.keys(obj))} length ${Object.keys(obj).length}`);
                for (let k = 0; k < Object.keys(obj).length; k++) {
                    const key = Object.keys(obj)[k];
                    const o: any = obj[key];
                    if (me.isNeo4jNumber(o)) {
                        rtn[key] = Neo4j.integer.toNumber(o);
                    } else if (o.properties) {
//                        console.log(`more properties ... ${JSON.stringify(o)}`);
                        rtn[key] = me.clean(me, o);
                    } else if (me.isObject(o)) {
                        rtn[key] = me.clean(me, o);
                    } else {
                        rtn[key] = o;
                    }
                }
            } else {
//                console.log(`obj not an Object ${obj}`);
                rtn = obj;
            }

        }
        return rtn;
    }

    isObject(obj: any): boolean {
        return obj === Object(obj);
    }

    isArray(obj: any): boolean {
        return Array.isArray(obj);
    }

    isNeo4jNumber(obj: any): boolean {
        return obj.hasOwnProperty('low') && obj.hasOwnProperty('high');
    }
}
