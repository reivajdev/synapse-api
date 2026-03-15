/*
    Estrategia POST refactorizada con QueryBuilder
*/
import { type RouteStrategy } from './RouteStrategy.js';
import { ResponseHandler } from '../ResponseHandler.js';

export class PostStrategy implements RouteStrategy {
    async handle(request: any, reply: any, dbConnector: any, ep: any, settings: any) {
        const body = request.body;

        // Validación dinámica (se mantiene igual, usando el conector)
        const validation = await dbConnector.validate(ep.main_table, body, ep.schema);
        if (!validation.success) {
            return reply.status(400).send(
                ResponseHandler.error('Validation Error', validation.error.format())
            );
        }

        // Obtenemos el builder (agnóstico a la base de datos)
        const qb = dbConnector.getQueryBuilder();

        try {
            // Delegamos la inserción al Builder
            const result = await qb.insert(ep.main_table, body);
            
            return reply.status(201).send(ResponseHandler.success(result));

        } catch (error: any) {
            return reply.status(500).send(
                ResponseHandler.error('Database error during insertion', error.message)
            );
        }
    }
}