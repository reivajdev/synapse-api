export abstract class BaseQueryBuilder {
    protected db: any; // Usamos protected para que las clases hijas puedan acceder

    constructor(db: any) {
        this.db = db;
    }

    // Definimos los tipos de retorno como Promise<any> o Promise<any[]> 
    // para que las estrategias reciban los datos.
    abstract select(table: string, filters: Record<string, any>): Promise<any[]>;
    abstract insert(table: string, data: any): Promise<any>;
    abstract update(table: string, id: any, data: any): Promise<any>;
    abstract delete(table: string, id: any): Promise<any>;
}