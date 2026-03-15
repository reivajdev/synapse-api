/*
    Clase abstracta que define como se tienen que implementar los conectores a base de datos.
*/
import { z } from 'zod';
import { BaseQueryBuilder } from './BaseQueryBuilder.js';

export abstract class BaseConnector {
    protected pool: any;
    protected config: any;
    public db: any;

    constructor(config: any) {
        this.config = config;
    }
    /*
        Todos los conectores tiene que implementar estos metodos, para que se puedan ejectuar querys, 
        obtener los esquemas y gestionar las conexiones
            -> abstract connect(): Promise<void>;
            -> abstract execute(query: string, params?: any[]): Promise<any[]>;
            -> abstract disconnect(): Promise<void>;
            -> abstract getTableMetadata(tableName: string): Promise<any[]>;
    */
    abstract connect(): Promise<void>;
    abstract execute(query: string, params?: any[]): Promise<any[]>;
    abstract disconnect(): Promise<void>;
    abstract getTableMetadata(tableName: string): Promise<any[]>;
    abstract getQueryBuilder(): BaseQueryBuilder;
    
    async validate(tableName: string, data: any, yamlSchema?: Record<string, string>) {
        const dbMetadata = await this.getTableMetadata(tableName);
        const dynamicSchema = this.buildDynamicSchema(dbMetadata, yamlSchema);
        return dynamicSchema.safeParse(data);
    }

    //Metodo que genera el esquema dinamicamente.
    private buildDynamicSchema(dbMetadata: any[], yamlSchema?: Record<string, string>) {
        const shape: any = {};

        dbMetadata.forEach(col => {
            const colName = col.column_name;
            const dbType = col.data_type;

            if (yamlSchema && yamlSchema[colName]) {
                shape[colName] = this.mapTypeToZod(yamlSchema[colName]);
            } 
            else {
                shape[colName] = this.mapTypeToZod(dbType);
            }
            if (col.is_nullable === 'YES') {
                shape[colName] = shape[colName].optional().nullable();
            }
        });

        return z.object(shape);
    }
    //Metodo que valida los datos
    private mapTypeToZod(type: string) {
        const t = type.toLowerCase();
        if (t.includes('int') || t.includes('num') || t === 'number') return z.coerce.number().optional();
        if (t.includes('char') || t === 'text' || t === 'string') return z.string().optional();
        if (t === 'boolean' || t === 'bool') return z.boolean().optional();
        if (t === 'email') return z.email().optional(); 
        if (t === 'date') return z.string().datetime().optional();
        return z.any();
    }
}