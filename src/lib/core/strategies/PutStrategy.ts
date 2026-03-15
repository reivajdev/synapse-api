import { type RouteStrategy } from './RouteStrategy.js';
import { ResponseHandler } from '../ResponseHandler.js';

export class PutStrategy implements RouteStrategy {
    async handle(request: any, reply: any, dbConnector: any, ep: any, settings: any) {
        const id = request.params.id;
        const body = request.body;

        if (!id) {
            return reply.status(400).send(ResponseHandler.error('Missing ID in request', null));
        }

        // Validamos los datos recibidos con el esquema Zod
        const validation = await dbConnector.validate(ep.main_table, body, ep.schema);
        if (!validation.success) {
            return reply.status(400).send(
                ResponseHandler.error('Validation Error', validation.error.format())
            );
        }

        const qb = dbConnector.getQueryBuilder();

        try {
            // Ejecutamos la actualización
            const result = await qb.update(ep.main_table, id, body);

            if (!result) {
                return reply.status(404).send(ResponseHandler.error('Resource not found', null));
            }

            return reply.send(ResponseHandler.success(result));
        } catch (error: any) {
            return reply.status(500).send(ResponseHandler.error('Database error during update', error.message));
        }
    }
}