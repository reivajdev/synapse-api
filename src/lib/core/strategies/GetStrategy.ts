/*
    Soporta tanto listas como búsqueda por ID único.
*/
import { type RouteStrategy } from './RouteStrategy.js';
import { ResponseHandler } from '../ResponseHandler.js';

export class GetStrategy implements RouteStrategy {
    async handle(request: any, reply: any, dbConnector: any, ep: any, settings: any) {
        const queryParams = request.query; // Importante definir esto
        const id = request.params.id;
        const filters: Record<string, any> = {};

        if (id) {
            // Si hay ID en la URL, el único filtro es el ID
            filters['id'] = id;
        } else if (settings.filters) {
            // Si no hay ID, procesamos los filtros del YAML y QueryParams
            for (const f of settings.filters) {
                if (f !== 'all' && queryParams[f] !== undefined) {
                    filters[f] = queryParams[f];
                }
            }
        }

        // Obtenemos el builder del conector
        const qb = dbConnector.getQueryBuilder();

        try {
            // Consultamos la base de datos
            const rows = await qb.select(ep.query_table, filters);
            
            // Manejo de respuesta detallado
            if (id) {
                if (rows.length === 0) {
                    return reply.status(404).send(ResponseHandler.error('Resource not found', null));
                }
                // Si es por ID, devolvemos solo el objeto, no un array de un solo elemento
                return reply.send(ResponseHandler.success(rows[0]));
            }

            // Si es lista, devolvemos el array completo
            return reply.send(ResponseHandler.success(rows));

        } catch (error: any) {
            return reply.status(500).send(ResponseHandler.error('Database error', error.message));
        }
    }
}