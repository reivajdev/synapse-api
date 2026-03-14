import 'dotenv/config'; // Esto carga automáticamente el archivo .env
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para resolver las rutas relativas al proyecto
const resolvePath = (envPath: string | undefined, defaultPath: string) => {
    return path.resolve(__dirname, '../../', envPath || defaultPath);
};

// Obtenemos la configuración de las bariables de entorno.
export const CONFIG = {
    server: {
        port: Number(process.env.PORT) || 4000,
        env: process.env.NODE_ENV || 'development',
        bind: process.env.BIND_ADDRESS || '0.0.0.0',
        host: process.env.HOST || 'localhost',
    },

    paths: {
        root: resolvePath(process.env.APP_ROOT, './'),
        endpoints: resolvePath(process.env.APP_ENDPOINTS, './endpoints'),
        logs: resolvePath(process.env.APP_LOGS, './logs'),
    }
} as const;

export type AppConfig = typeof CONFIG;