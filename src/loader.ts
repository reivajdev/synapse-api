/*
    Función que se encarga de cargar el fichero de configuracion 
    y asignarlo a la interfaz corespondiente.
*/
import { CONFIG } from './config/Config.js'; // Verifica que la ruta sea esta
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import type { SynapseConfigFile, SynapseGroupedConfig } from './interfaces/ISynapse.js';

export function loadSynapseConfig(): SynapseGroupedConfig {
    const endpointsDir = CONFIG.paths.endpoints; // Aquí es donde fallaba
    const groupedConfig: SynapseGroupedConfig = {};

    try {
        if (!fs.existsSync(endpointsDir)) return groupedConfig;

        const scanDirectory = (directory: string) => {
            const items = fs.readdirSync(directory, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(directory, item.name);

                if (item.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.name.endsWith('.yml') || item.name.endsWith('.yaml')) {
                    const content = fs.readFileSync(fullPath, 'utf8');

                    const replacedYaml = content.replace(/\${(\w+)}/g, (match, key) => {
                        return process.env[key] || match; // Si no existe en .env, deja el texto original
                    });
                    const parsed = yaml.load(replacedYaml) as SynapseConfigFile;

                    if (parsed && parsed.apiVersion) {
                        const version = parsed.apiVersion;
                        const prefix = parsed.prefix || 'api/v{apiVersion:}';
                        const groupKey = `${version}-${prefix}`; 

                        if (!groupedConfig[groupKey]) {
                            groupedConfig[groupKey] = {
                                apiVersion: version,
                                prefix: prefix,
                                databases: {},
                                endpoints: []
                            };
                        }

                        Object.assign(groupedConfig[groupKey].databases, parsed.databases || {});
                        if (parsed.endpoints) {
                            groupedConfig[groupKey].endpoints.push(...parsed.endpoints);
                        }
                    }
                }
            }
        };

        scanDirectory(endpointsDir);
    } catch (error) {
        console.error('Error al cargar la configuración:', error);
    }

    return groupedConfig;
}