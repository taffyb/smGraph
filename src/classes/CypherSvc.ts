import path from 'path';
import fs from 'fs';

export class CypherSvc {
    static readCypherFromFile(filename: string): string {
        let file: any;

        file = path.join( __dirname, '../cypher', filename);
        if (!file.endsWith('.cyp')) {
            file += '.cyp';
        }

    //  console.log(`Filename: ${file}`);
        const cypher: string = fs.readFileSync(file, 'utf8');
        return cypher;
    }

    static replaceTokens(text: string, values: any): string {
        const tokens: string[] = Object.keys( values);

        for (let i = 0; i < tokens.length; i++) {
            const token: string = tokens[i];
            text = text.replace('__(' + tokens[i] + ')__', values[token]);
        }
        return text;
    }
}
