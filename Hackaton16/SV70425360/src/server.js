const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const initSocket = require('./config/socket');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Inicializar Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

initSocket(io);

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
