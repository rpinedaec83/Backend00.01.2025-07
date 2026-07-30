# Hackatón — Autenticación y Sesiones en Express

## Objetivos
- Sesión + cookies seguras (HttpOnly/SameSite/secure), regeneración (anti-fixation), logout que invalida.
- JWT access + refresh con expiración, rotación y revocación.
- Rutas protegidas + roles (RBAC).
- Hardening: helmet, rate-limit, CSRF (para sesión), CORS restringido, blacklist opcional de access.
- Pruebas automáticas (supertest) y checklist OWASP breve.

## Requisitos
Node 18+, Mongo/Redis opcional. Variables en `.env` (ver `.env.example`).

## Instalación
```bash
npm i
cp .env.example .env
npm run dev
```

## Endpoints mínimos
- **Sesión**: `POST /session/login`, `POST /session/logout`, `GET /session/me`
- **JWT**: `POST /jwt/login`, `POST /jwt/refresh`, `POST /jwt/logout`, `GET /jwt/me`
- **Privados**: `GET /private/profile` (sesión), `GET /private/admin/stats` (JWT + admin)
- **CSRF demo**: `GET /csrf` (obtiene token), `POST /x-form` (requiere token)

## Diagrama rápido
```
[Cliente] --(POST /session/login + CSRF)--> [Express + session]
   |<-- sid cookie (HttpOnly, Lax) ---------
   |--(GET /session/me con cookie)--------->

[Cliente] --(POST /jwt/login)----------------> [Express]
   |<-- access (JSON) + refresh cookie ------
   |--(GET /jwt/me Authorization: Bearer)---->
   |--(POST /jwt/refresh con cookie)---------> (rota refresh, revoca anterior)
```

## Seguridad
- `helmet` por defecto.
- Rate limit global y específico en `/session/login` y `/jwt/login`.
- `SameSite=Lax`, `HttpOnly`, `secure` en producción, `trust proxy`=1.
- **CSRF** solo en flujos con sesión/formularios; **no** en JWT stateless.
- Regeneración de sesión en login.
- Rotación/revocación de refresh; blacklist opcional de access por jti (vida corta).

## Pruebas
- `npm test` (usa `node --test` + `supertest`).
- Casos: éxito/error de login, /me, rol admin, refresh/logout.

## Variables
Ver `.env.example`. Cambia secretos.

## Entrega
- Repositorio con código.
- README + `.env.example`.
- Pruebas ejecutando OK (captura o reporte).
- Colección Postman en `/collections` (opcional).

## Extras sugeridos (+10)
- 2FA TOTP (speakeasy + qrcode).
- Remember-me: cookie secundaria larga con reemisión de sid/access.
- Redis store para sesiones y refresh, auditoría de eventos.
