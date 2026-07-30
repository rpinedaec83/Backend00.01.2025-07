# Sistema de Courier Online — ExpressJS + Socket.io + MySQL + OAuth

**Objetivo:** Sistema persistente que guarda paquetes, mensajes y ubicaciones hasta su recepción, con clientes autenticados por OAuth (Google). Incluye tiempo real con Socket.io.

## Stack
- Express 4, Socket.io 4
- Sequelize + MySQL
- Passport Google OAuth 2.0
- Sessions para mantener la sesión OAuth
- Demo cliente estático en /public

## Requisitos
- Node 18+
- MySQL 8+
- Credenciales de Google OAuth (Client ID/Secret)
- Variables .env (ver .env.example)

## Setup
```bash
npm i
cp .env.example .env
# Edita .env con tus credenciales de DB y Google OAuth
npm run db:sync   # crea/actualiza tablas
npm run dev
```

Abre: http://localhost:3000 y usa Login con Google.

## Modelos
- User(id, provider, email, name, avatar, role)
- Package(id, title, description, status, origin, destination, senderId, courierId)
- PackageLocation(id, packageId, lat, lng, note, timestamps)
- Message(id, packageId, authorId, content, timestamps)

Relaciones:
- Package.belongsTo(User, { as: 'sender' })
- Package.belongsTo(User, { as: 'courier' })
- PackageLocation.belongsTo(Package)
- Message.belongsTo(Package), Message.belongsTo(User, as author)

## Endpoints principales
### Auth
- GET /auth/google
- GET /auth/google/callback
- POST /auth/logout
- GET /auth/me

### Paquetes
- POST /api/packages  (auth: client) — crea paquete { title, description, origin, destination }
- POST /api/packages/:id/assign (auth: admin) — asigna courier { courierId }
- POST /api/packages/:id/location (auth: courier/admin) — añade ubicación { lat, lng, note } — emite location:update
- POST /api/packages/:id/deliver (auth: courier/admin) — marca entregado — emite package:delivered
- POST /api/packages/:id/message (auth) — agrega mensaje { content } — emite package:message
- GET  /api/packages/:id — detalle + ubicaciones + mensajes (sender/courier/admin)
- GET  /api/packages — lista según rol

## WebSocket (Socket.io)
- Unirse a sala: socket.emit('package:join', { packageId })
- Eventos: location:update, package:message, package:delivered

## Roles sugeridos
- client (default), courier, admin

## Notas producción
- Usa Redis/MySQL session store para sesiones y escalado de Socket.io (adapter).
- Configura CORS y cabeceras de seguridad (helmet ya incluido).
