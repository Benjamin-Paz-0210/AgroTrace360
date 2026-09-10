# AgroTrace 360

Pasaporte digital de trazabilidad agro (Hackatón FIIS UNAS 2026).  
Agricultor, acopio y exportadora sobre Postgres.

## Desarrollo local

```bash
npm install
cp .env.example .env
# Ajusta Postgres local o deja DATABASE_URL de Supabase
npm run migrate
npm run dev
```

Clave demo: `demo123`  
Cuentas: `jose@agrotrace.pe`, `maria@agrotrace.pe`, `export@agrotrace.pe`

## Base de datos (Supabase)

Host: `aws-0-us-west-2.pooler.supabase.com`  
Puerto: `5432` (pooler de sesión)  
Base: `postgres`  
Usuario: `postgres.rmfgzyymkdkoyozlrlgv`

```
DATABASE_URL=postgresql://postgres.rmfgzyymkdkoyozlrlgv:TU_PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres
PGSSL=true
```

Nunca subas la contraseña a Git. Las migraciones están en `db/migrations/` y también se aplican al arrancar el servidor (`initSchema`).

```bash
npm run migrate
```

## Despliegue en Render

1. Sube el repo a GitHub (`https://github.com/Benjamin-Paz-0210/AgroTrace360.git`).
2. En [Render](https://dashboard.render.com) → **New** → **Web Service** → conecta ese repo.
3. Runtime: **Node**.
4. Build: `npm ci && npm run build`
5. Start: `npm start`
6. Variables de entorno:
   - `NODE_ENV` = `production`
   - `PGSSL` = `true`
   - `DATABASE_URL` = la URI de Supabase (con tu password, sin corchetes)
7. Deploy. La primera vez crea tablas y datos demo sola.
8. Abre la URL de Render. Prueba `/api/health`.

El plan free se duerme sin tráfico. Las fotos que suban los usuarios no son persistentes en el disco efímero; el catálogo de demo sí viaja en el repo.
