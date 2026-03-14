/*
    Fichero donde manejamos las conexiones a la base de datos
*/
import { BaseConnector } from './BaseConnector.js';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';

export class ConnectorFactory {
    
    private static instances = new Map<string, BaseConnector>();

    static async getConnector(dbId: string, dbConfig: any): Promise<BaseConnector> {
        
        // Comprobamos la instacia por si ya hay (singelton).
        if (this.instances.has(dbId)) {
            return this.instances.get(dbId)!;
        }

        const { type } = dbConfig;
        if (!type) {
            throw new Error(`[SynapseAPI] Error: El campo "type" no está definido en la base de datos "${dbId}"`);
        }

        
        
        const currentDir = path.dirname(new URL(import.meta.url).pathname);
        const normalizedDir = process.platform === 'win32' && currentDir.startsWith('/') 
            ? currentDir.substring(1) 
            : currentDir;

        /* 
            Comprobamos la ruta interna y externa de los conectores aqui de podria añadir mas conectores abase de datos
            en la carpeta plugins, esto es por si se quiere personalizar las conexiones de un motor de base de datos.
            Se tiene que implementar la clase abstracta BaseConnector 
        */
        const internalPath = path.resolve(normalizedDir, 'connectors', `${type.toLowerCase()}.js`);
        const externalPath = path.resolve(process.cwd(), 'plugins/connectors', `${type.toLowerCase()}.js`);

        let finalPath: string = "";

        if (fs.existsSync(externalPath)) {
            finalPath = externalPath;
        } else if (fs.existsSync(internalPath) || fs.existsSync(internalPath.replace('.js', '.ts'))) {
        
            finalPath = fs.existsSync(internalPath) ? internalPath : internalPath.replace('.js', '.ts');
        }

        if (!finalPath) {
            throw new Error(`[SynapseAPI] Error: No se encontró el conector para "${type}". 
            Asegúrate de que el archivo existe en ./plugins/connectors/${type.toLowerCase()}.js 
            o en el core del sistema.`);
        }

        try {
            //Se exporta el modulo dinamicamente
            const module = await import(pathToFileURL(finalPath).href);
            
            
            if (!module.Connector) {
                throw new Error(`El módulo en ${finalPath} no exporta una clase llamada 'Connector'`);
            }
            const instance: BaseConnector = new module.Connector(dbConfig);
            await instance.connect(); //Conectamos con la intancia.
            this.instances.set(dbId, instance);
            
            console.log(`[SynapseAPI] Conector "${type}" cargado para "${dbId}" desde: ${finalPath}`);
            return instance;

        } catch (error: any) {
            throw new Error(`Error al inicializar el conector "${type}" para "${dbId}": ${error.message}`);
        }
    }
}