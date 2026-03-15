/*
    Generamos una estrategia para la logica de los metodos HTTP (GET, POST, PUT, DELETE).
*/
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { BaseConnector } from '../../database/BaseConnector.js';

export interface RouteStrategy {
    handle(
        request: FastifyRequest, 
        reply: FastifyReply, 
        db: BaseConnector, 
        endpointConfig: any, 
        methodSettings: any
    ): Promise<void>;
}