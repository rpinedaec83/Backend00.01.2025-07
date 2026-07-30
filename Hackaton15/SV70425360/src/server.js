import http from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.CORS_ORIGIN, credentials: true }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  socket.on('package:join', ({ packageId }) => {
    if (packageId) socket.join(packageId);
  });
});

server.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
