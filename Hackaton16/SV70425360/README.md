# Sistema de Pagos Online - Hackathon

Plantilla de proyecto para el hackathon semanal con **ExpressJS, NodeJS, Socket.io, MySQL, OAuth y Stripe** (Culqi como borrador).

## Requisitos

- NodeJS >= 18
- MySQL
- Cuenta de Google (para OAuth)
- Cuenta Stripe (modo test)

## Instalación

```bash
npm install
```

Crea la base de datos y tablas:

```bash
mysql -u root -p < src/models/schema.sql
```

Copia el archivo `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Configura:

- Credenciales de MySQL
- Claves de Google OAuth
- Claves de Stripe (modo test)

## Ejecutar en desarrollo

```bash
npm run dev
```

Servidor por defecto en: `http://localhost:4000`

## Flujo básico

1. Visita `/auth/google` para iniciar sesión con Google.
2. Usa los endpoints:
   - `GET /api/products`
   - `POST /api/orders` (requiere login)
   - `POST /api/payments/order/:orderId/pay` (Stripe PaymentIntent)
3. Configura el webhook de Stripe apuntando a `POST /api/webhooks/stripe`.

## Socket.io

El servidor Socket.io se inicializa en `src/server.js`.  
El cliente debe conectarse enviando `userId` en la query:

```js
const socket = io('http://localhost:4000', {
  query: { userId: '1' }
});

socket.on('payment-status', (data) => {
  console.log('Estado de pago actualizado:', data);
});
```

Esta plantilla está pensada para fines **educativos** y para usarla como base durante el hackathon.
