/*
    Generamos la estrategia POST
*/
import { type RouteStrategy } from './RouteStrategy.js';
import { ResponseHandler } from '../ResponseHandler.js';

export class PostStrategy implements RouteStrategy {
    async handle(request: any, reply: any, db: any, ep: any, settings: any) {
        const body = request.body;
        
        // Validación con Zod
        const validation = await db.validate(ep.main_table, body, ep.schema);
        if (!validation.success) {
            return reply.status(400).send(ResponseHandler.error('Validation Error', validation.error.format()));
        }

        const keys = Object.keys(body);
        const values = Object.values(body);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${ep.main_table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        
        const result = await db.execute(sql, values);
        return reply.status(201).send(ResponseHandler.success(result));
    }
}