/*
    Esta clase proporciona el conector específico de postgres
    extiende de BaseConnector e integra Kysely.
*/
import { BaseConnector } from '../BaseConnector.js';
import { KyselyQueryBuilder } from '../builders/KyselyQueryBuilder.js';
import { Kysely, PostgresDialect } from 'kysely';

export class Connector extends BaseConnector {
    async connect() {
        const { default: pg } = await import('pg');
        
        // Creamos el pool de conexiones
        this.pool = new pg.Pool({
            host: this.config.server,
            database: this.config.database,
            user: this.config.user,
            password: this.config.pass,
            port: this.config.port
        });

        // Inicializamos Kysely
        this.db = new Kysely<any>({
            dialect: new PostgresDialect({
                pool: this.pool
            })
        });

        const client = await this.pool.connect();
        client.release();
        console.log(`Conector Postgres acoplado con Kysely: ${this.config.database}`);
    }

    async execute(query: string, params: any[] = []) {
        const res = await this.pool.query(query, params);
        return res.rows;
    }

    async disconnect() {
        await this.db.destroy(); 
    }
    
    async getTableMetadata(tableName: string): Promise<any[]> {
        const [schema, table] = tableName.includes('.') 
            ? tableName.split('.') 
            : ['public', tableName];

        const query = `
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = $2
            ORDER BY ordinal_position;
        `;
        
        return await this.execute(query, [table, schema]);
    }

    // Implementamos el Builder
    getQueryBuilder(): KyselyQueryBuilder {
        return new KyselyQueryBuilder(this.db);
    }
}