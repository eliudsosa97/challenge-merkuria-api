## Reto Técnico — Backend de Gestión de Productos (NestJS)

Aplicación backend para gestionar un catálogo de productos: CRUD, filtros, ordenamiento, estadísticas y utilidades para el frontend (Next.js). Desarrollado con NestJS + TypeORM + PostgreSQL y probado con Jest (unitarias y e2e).

Demo: https://challenge-merkuria-app-qnov-one.vercel.app/

---

## Stack y características

- NestJS 11, TypeScript, TypeORM 0.3
- PostgreSQL (local o en la nube). Soporte para `DATABASE_URL` con SSL (p. ej. Render/Neon/Railway)
- Validación con class-validator/class-transformer y `ValidationPipe` global (whitelist + transform)
- Prefijo global de API: `/api`
- Migraciones y seeding inicial de productos
- Tests unitarios y end-to-end con Jest y Supertest

---

## Estructura de datos (tabla `products`)

Columns:

- id (uuid, PK)
- name (varchar)
- category (varchar)
- price (decimal 10,2)
- rating (decimal 2,1, default 0)
- stock (int, default 0)
- createdAt (timestamp, auto)
- updatedAt (timestamp, auto)

Véase `src/products/entities/product.entity.ts` y la migración `src/database/migrations/*InitialSetup*.ts`.

---

## Requisitos previos

- Node.js 18+ y npm
- PostgreSQL 13+

---

## Configuración rápida

1. Clonar e instalar dependencias:

```bash
git clone https://github.com/eliudsosa97/challenge-merkuria-api
cd challenge-merkuria-api
npm install
```

2. Variables de entorno (crea `.env` en la raíz):

Usa una URL completa (recomendado en cloud) o credenciales separadas.

```env
# Opción A: URL única (con SSL en cloud)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Opción B: credenciales por campo (para local)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=challenge

# Puerto del servidor
PORT=3000
```

3. Migraciones y seed inicial:

```bash
# Genera esquema
npm run migration:run

# Inserta productos de ejemplo
npm run seed
```

4. Levantar servidor:

```bash
# desarrollo (watch)
npm run start:dev

# producción (requiere build previo si usas dist)
npm run start:prod
```

La API quedará en: http://localhost:${PORT:-3000}/api

---

## Endpoints principales

Base URL: `/api/products`

- POST `/` — Crear producto
- GET `/` — Listar con filtros/ordenamiento/paginación
- GET `/categories` — Categorías únicas
- GET `/statistics` — Estadísticas (total, precio promedio, conteo por categoría)
- GET `/:id` — Obtener por id (uuid)
- PATCH `/:id` — Actualizar
- DELETE `/:id` — Eliminar

### Cuerpo de creación/actualización

```json
{
  "name": "Croquetas para Cachorro 10kg",
  "category": "Alimento",
  "price": 899.99,
  "rating": 4.8,
  "stock": 30
}
```

Validaciones clave:

- name, category: string
- price: number >= 0
- rating: number 1..5 (opcional)
- stock: number >= 0 (opcional)

### Query params de listado y estadísticas

- `category`: string
- `minPrice`, `maxPrice`: number
- `search`: string (ILIKE sobre name)
- `sortBy`: `name` | `price`
- `sortOrder`: `ASC` | `DESC`
- `page`: number >= 1 (default 1)
- `limit`: number >= 1 (default 10)

Ejemplo:

`GET /api/products?category=Alimento&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=ASC&page=1&limit=12`

---

## Scripts útiles

- `npm run start:dev` — desarrollo con watch
- `npm run start:prod` — producción (usa `Procfile` para plataformas tipo Heroku/Railway)
- `npm run build` — compilar a `dist`
- `npm run migration:run` — ejecutar migraciones (usa `src/data-source.ts`)
- `npm run migration:generate` — generar nueva migración desde los entities
- `npm run seed` — ejecutar seeding inicial
- `npm run test` — tests unitarios
- `npm run test:e2e` — tests end-to-end
- `npm run test:cov` — cobertura

Nota: Los scripts `db:*` que refieren a `src/config/database.config.ts` no se usan en este repo; utiliza los de `migration:*`.

---

## Pruebas

Ejecutar unitarias y e2e:

```bash
npm run test
npm run test:e2e
npm run test:cov
```

Estructura de tests:

- Unitarias: `src/**/*.spec.ts`
- E2E: `test/*.e2e-spec.ts` (usa Supertest contra la app Nest)

---

## Despliegue

- Estado actual: backend y base de datos están desplegados en Heroku (Heroku Postgres).
  - URL de producción (API): https://challenge-merkuria-api-215ba9385fca.herokuapp.com/api/
  - En Heroku, configura `DATABASE_URL` y `PORT` en Config Vars. El `Procfile` ya está incluido (`web: npm run start:prod`).
  - Al usar `DATABASE_URL`, el proyecto activa SSL automáticamente (`ssl: { rejectUnauthorized: false }`).
- Backend: compatible también con Render, Railway y Fly.io.
- Frontend (Next.js): despliegue recomendado en Vercel. El frontend consumirá este backend vía la URL pública del servicio.

Recuerda ejecutar migraciones y (opcionalmente) el seed en el entorno remoto.

---

## Seguridad y consideraciones

- CORS habilitado por defecto
- Validación estricta (whitelist, transform y `forbidNonWhitelisted`)
- Endpoints públicos para el reto; para producción, se recomienda proteger escritura (POST/PATCH/DELETE) con autenticación y añadir rate limiting

---

## Uso de asistentes de IA durante el desarrollo

Se utilizaron asistentes de IA de forma complementaria:

- Gemini Pro (chat): para resolver dudas variadas, pedir explicaciones rápidas y ayudar a interpretar/leer mensajes de error.
- GitHub Copilot (con GPT-5): para completaciones en el editor, corrección de bugs sencillos, creación de tests (unitarios y e2e) y añadir comentarios puntuales en el código.

Ejemplos de prompts usados:

- “Crea un servicio NestJS para productos con filtros por categoría, rango de precio y búsqueda por nombre usando TypeORM QueryBuilder.”
- “Genera DTOs con class-validator para crear y actualizar un producto; rating opcional 1..5.”
- “Escribe un test e2e que cree un producto y lo consulte por id.”
- “Explícame este error de TypeORM y sugiere posibles causas.” (Gemini Pro)
- "Ayudame a verificar la estructura de mi API"

Todo con revisión humana.
Todas las salidas de IA se verificaron con linters, pruebas y pruebas manuales antes de integrarlas.

---

## Estructura del proyecto (alto nivel)

- `src/products` — módulo de productos (controller, service, DTOs, entity)
- `src/database/migrations` — migraciones
- `src/database/seeds` — seeding de datos de ejemplo
- `src/data-source.ts` — configuración de TypeORM CLI (migraciones)
- `test/` — pruebas e2e

---

Eliud Sosa | 2025
