import { remultExpress } from 'remult/remult-express';
import { createPostgresConnection, PostgresClient, PostgresDataProvider, PostgresPool, PostgresSchemaBuilder } from 'remult/postgres';
import { Item } from '../app/items/item';
import { Lending } from '../app/lengdings/lending';
import { Pool, QueryResult } from 'pg';
import { Remult, SqlDatabase } from 'remult';



export class PostgresSchemaWrapper implements PostgresPool {
    constructor(private pool: Pool, private schema: string) {

    }
    async connect(): Promise<PostgresClient> {
        let r = await this.pool.connect();

        await r.query('set search_path to ' + this.schema);
        return r;
    }
    async query(queryText: string, values?: any[]): Promise<QueryResult> {
        let c = await this.connect();
        try {
            return await c.query(queryText, values);
        }
        finally {
            c.release();
        }

    }
}

const dataProvider = async () => {
    if (process.env['NODE_ENV'] === "production") {
        const pool = new Pool({
            connectionString: process.env['DATABASE_URL'],
            ssl: {
                rejectUnauthorized: false
            }
        });
        const schema = process.env['SCHEMA'] || 'brey';
        const result = new SqlDatabase(new PostgresDataProvider(new PostgresSchemaWrapper(pool, schema)));
        var remult = new Remult();
        remult._dataSource = result;
        new PostgresSchemaBuilder(result, schema).verifyStructureOfAllEntities(remult)
        return result;
    }
    return undefined;
}
export const api = remultExpress({
    entities: [Item, Lending],
    dataProvider,
    initApi: async remult => {
    }
});
