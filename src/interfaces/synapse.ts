// Definimos la interfaz que contendrá la configuración del YAML
export interface SynapseConfigFile {
    apiVersion: string;
    prefix: string;
    databases: Record<string, any>;
    endpoints: SynapseEndpoint[];
}

// Interfaz para agrupar múltiples versiones por su identificador (v1, v2, etc.)
export type SynapseGroupedConfig = Record<string, SynapseConfigFile>;

// Definimos la interfaz para los endpoints
export interface SynapseEndpoint {
    endpoint: string;
    description?: string;
    use_db: string;
    methods: Record<string, any>;
}