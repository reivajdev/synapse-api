# Synapse API

**Synapse API** es un framework de orquestación de APIs dinámicas construido sobre **Fastify** y **TypeScript**. Su objetivo principal es permitir la generación automática de endpoints mediante archivos de configuración YAML, abstrayendo la lógica de conexión a bases de datos y la implementación de rutas mediante patrones de diseño como *Strategy* y *Factory*.

## Características Principales

* **Arquitectura Basada en Estrategias**: Implementación limpia de verbos HTTP (GET, POST) mediante el patrón *Strategy*.
* **Configuración Declarativa**: Define tus modelos de datos, bases de datos y endpoints en archivos YAML (`endpoints/*.yml`).
* **Soporte Multi-Database**: Conector extensible (actualmente con soporte para PostgreSQL) gestionado por una `ConnectorFactory`.
* **Inyección de Variables de Entorno**: Resolución dinámica de variables `${VAR}` dentro de los archivos de configuración.
* **Alto Rendimiento**: Construido sobre Fastify para garantizar la mínima latencia.

---

##️ Tecnologías

* **Runtime**: Node.js (ESM).
* **Framework**: Fastify.
* **Lenguaje**: TypeScript.
* **Gestor de Paquetes**: pnpm.
* **Base de Datos**: PostgreSQL (vía `pg`).

---

## Instalación y Configuración

### 1. Requisitos previos

* Node.js >= 18
* pnpm instalado (`npm install -g pnpm`)

### 2. Clonar e instalar

```bash
git clone https://github.com/reivajdev/synapse-api.git
cd synapse-api
pnpm install

```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en el ejemplo:

```bash
# Directorios de la App
APP_ROOT=./
APP_ENDPOINTS=./endpoints
APP_LOGS=./logs

# Configuración del servidor
PORT=4000
HOST=localhost
BIND_ADDRESS=0.0.0.0
NODE_ENV=development

DB_PG_SERVER=tu_servidor
DB_PG_DATABASE=tu_base_de_datos
DB_PG_PORT=puerto
DB_PG_USER=usuario_bbdd
DB_PG_PASS=password_bbdd

```

---

##️ Estructura del Proyecto

```text
src/
├── config/             # Configuración global y carga de .env
├── interfaces/         # Definiciones de tipos y contratos
├── lib/
│   ├── core/           # Motor principal de la API
│   │   └── strategies/ # Lógica por cada método HTTP (GET, POST)
│   └── database/       # Capa de persistencia y conectores
├── loader.ts           # Cargador de configuraciones YAML
└── index.ts            # Punto de entrada de la aplicación
endpoints/              # Definiciones YAML de la API

```

---

## Uso

### Definir un nuevo Endpoint

Añade un archivo `.yml` en la carpeta `/endpoints`. Ejemplo de estructura:

```yaml
apiVersion: v1
prefix: 'synapse-api/{apiVersion:}'

#Pendiente de definir
permissions:

# Definimos las bases de datos que queramos usar
# Tipo de base de datos, y parametros de conexión
# las variables la tenemos que poner en el .env
databases:
  users_db: 
    type: "postgres"
    server: "${DB_PG_SERVER}"
    database: "${DB_PG_DATABASE}"
    port: "${DB_PG_PORT}"
    user: "${DB_PG_USER}"
    pass: "${DB_PG_PASS}"

#Definimos los endpoints, donde se va a publicar, descripción, base de datos que vamos a usar, el esquema y los metodos
endpoints:
  - endpoint: "users"
    description: "Gestión de usuarios del sistema"
    use_db: "users_db" 
    main_table: "tester.users" 
    query_table: "tester.users" 
    
    # IMPLEMENTAR Definimos el esquema que queremos se puede poner all para todos los campos 
    schema:
      id: "int"
      username: "string"
      email: "email"
      active: "bool"
      created_at: "datetime"

    # Definimos las metodos http con los permisos.
    methods:
      get:
        filters: ["id", "username", "active"] # Aquí el "all" es opcional
      post:
        required: ["username", "email"] # Campos obligatorios para crear
```

### Scripts disponibles

* `pnpm dev`: Inicia el servidor en modo desarrollo con `tsx watch`.
* `pnpm build`: Compila el proyecto a JavaScript en la carpeta `dist`.
* `pnpm start`: Ejecuta la versión compilada.

---

## Arquitectura Técnica

El core del sistema utiliza un `RouterBuilder` que:

1. Lee las configuraciones YAML a través del `loader`.
2. Identifica el tipo de operación y selecciona la `RouteStrategy` adecuada (GET, POST, etc.).
3. Instancia los conectores de base de datos necesarios mediante la `ConnectorFactory`.

---

## Contribuciones

1. Haz un Fork del proyecto.
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`).
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Push a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

---

## Licencia

Este proyecto está bajo la Licencia **MIT**. Consulte el archivo `LICENSE` para más detalles.

---

*Desarrollado por [reivajdev](https://github.com/reivajdev)