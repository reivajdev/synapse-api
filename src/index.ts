// src/index.ts
import Fastify from 'fastify';
import { loadSynapseConfig } from './loader.js';
import { CONFIG } from './config/Config.js'; //
import { RouterBuilder } from './lib/core/RouterBuilder.js';
import type { SynapseConfigFile } from './interfaces/ISynapse.js';

const fastify = Fastify({ logger: true });

async function bootstrap() {
    try {
        // Cargamos la configuración agrupada
        const groupedConfig = loadSynapseConfig();
        
        // Forzamos el tipado de las entradas para evitar el error "unknown"
        const entries = Object.entries(groupedConfig) as [string, SynapseConfigFile][];

        for (const [groupKey, config] of entries) {
            
            // Resolvemos el prefijo
            let apiPrefix = config.prefix || 'api/v{apiVersion:}';
            apiPrefix = apiPrefix.replace('{apiVersion:}', config.apiVersion);

            // Normalizamos la ruta
            const finalPrefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;

            console.log(`[Synapse] Registrando versión ${config.apiVersion} en: http://${CONFIG.server.host}:${CONFIG.server.port}${finalPrefix}`);
            
            // Registramos el grupo en Fastify
            await fastify.register(async (instance) => {
                await RouterBuilder.build(instance, config);
            }, { prefix: finalPrefix });
        }

        // Arrancamos con bind y port de la configuración
        await fastify.listen({ 
            port: CONFIG.server.port, 
            host: CONFIG.server.bind 
        });

    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

bootstrap();