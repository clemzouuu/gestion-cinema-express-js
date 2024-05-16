import { DataSource } from "typeorm";
import * as dotenv from 'dotenv'

dotenv.config();
export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: 3307,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: true, 
    synchronize: true,
    entities: [
        "src/database/entities/*.ts"
    ],

})