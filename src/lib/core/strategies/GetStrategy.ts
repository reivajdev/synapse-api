/*
    Generamos la estrategia GET
*/
import { type RouteStrategy } from './RouteStrategy.js';
import { ResponseHandler } from '../ResponseHandler.js';

export class GetStrategy implements RouteStrategy {
    async handle(request: any, reply: any, db: any, ep: any, settings: any) {
        const queryParams = request.query;
        
        // Lógica de filtros que ya tenías...
        let sql = `SELECT * FROM ${ep.query_table}`;
        const values: any[] = [];
        const whereClauses: string[] = [];

        if (settings.filters) {
            for (const f of settings.filters) {
                if (f !== 'all' && queryParams[f] !== undefined) {
                    values.push(queryParams[f]);
                    whereClauses.push(`${f} = $${values.length}`);
                }
            }
            if (whereClauses.length > 0) sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        const rows = await db.execute(sql, values);
        return reply.send(ResponseHandler.success(rows));
    }
}