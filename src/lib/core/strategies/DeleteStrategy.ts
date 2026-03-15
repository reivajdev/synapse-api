import { type RouteStrategy } from './RouteStrategy.js';
import { ResponseHandler } from '../ResponseHandler.js';

export class DeleteStrategy implements RouteStrategy {
    async handle(request: any, reply: any, dbConnector: any, ep: any, settings: any) {
        // Obtenemos el ID de los parámetros de la ruta (/:id)
        const id = request.params.id;

        if (!id) {
            return reply.status(400).send(ResponseHandler.error('Missing ID in request', null));
        }

        const qb = dbConnector.getQueryBuilder();

        try {
            const result = await qb.delete(ep.main_table, id);

            if (!result) {
                return reply.status(404).send(ResponseHandler.error('Resource not found', null));
            }

            return reply.send(ResponseHandler.success({ message: 'Deleted successfully', data: result }));
        } catch (error: any) {
            return reply.status(500).send(ResponseHandler.error('Database error during deletion', error.message));
        }
    }
}