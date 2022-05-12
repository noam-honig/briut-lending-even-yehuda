import { remultExpress } from 'remult/remult-express';
import { createPostgresConnection } from 'remult/postgres';
import { Item } from '../app/items/item';
import { Lending } from '../app/lengdings/lending';


const dataProvider = async () => {
    if (process.env['NODE_ENV'] === "production")
        return createPostgresConnection({ configuration: "heroku" })
    return undefined;
}
export const api = remultExpress({
    entities: [Item, Lending],
    dataProvider
});