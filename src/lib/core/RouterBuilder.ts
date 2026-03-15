import { GetStrategy } from './strategies/GetStrategy.js';
import { PostStrategy } from './strategies/PostStrategy.js';
import { type RouteStrategy } from './strategies/RouteStrategy.js';
import { ConnectorFactory } from '../database/ConnectorFactory.js';
import type { SynapseConfigFile } from '../../interfaces/ISynapse.js';

/*
    Clase que construye las rutas a partir de la configuración y aplica las estrategias
*/
export class RouterBuilder {
    
    private static strategies: Record<string, RouteStrategy> = {
        'GET': new GetStrategy(),
        'POST': new PostStrategy()
    };

    /*
     * Construye las rutas para una configuración específica
     */
    static async build(fastify: any, config: SynapseConfigFile) {
        const { databases, endpoints } = config;

        // Validamos que existan endpoints
        if (!endpoints || !Array.isArray(endpoints)) return;

        for (const ep of endpoints) {
            for (const [methodName, settings] of Object.entries(ep.methods)) {
                const httpMethod = methodName.toUpperCase();
                const strategy = this.strategies[httpMethod];

                if (!strategy) continue;

                // Registramos la ruta en la instancia de fastify
                fastify.route({
                    method: httpMethod,
                    url: `/${ep.endpoint}`,
                    handler: async (request: any, reply: any) => {
                        const db = await ConnectorFactory.getConnector(
                            ep.use_db, 
                            databases[ep.use_db]
                        );
                        return strategy.handle(request, reply, db, ep, settings);
                    }
                });
            }
        }
    }
}