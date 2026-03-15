// src/lib/database/builders/KyselyQueryBuilder.ts
import { Kysely } from 'kysely';
import { BaseQueryBuilder } from '../BaseQueryBuilder.js';

export class KyselyQueryBuilder extends BaseQueryBuilder {
    
    // Tipamos el constructor específicamente para Kysely
    constructor(db: Kysely<any>) {
        super(db);
    }

    async select(table: string, filters: Record<string, any> = {}): Promise<any[]> {
        let query = this.db.selectFrom(table).selectAll();

        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined) {
                query = query.where(key as any, '=', value);
            }
        }

        return await query.execute();
    }

    async insert(table: string, data: any): Promise<any> {
        return await this.db
            .insertInto(table)
            .values(data)
            .returningAll()
            .executeTakeFirst();
    }

    async update(table: string, id: any, data: any): Promise<any> {
        return await this.db
            .updateTable(table)
            .set(data)
            .where('id' as any, '=', id)
            .returningAll()
            .executeTakeFirst();
    }

    async delete(table: string, id: any): Promise<any> {
        return await this.db
            .deleteFrom(table)
            .where('id' as any, '=', id)
            .returningAll()
            .executeTakeFirst();
    }
}