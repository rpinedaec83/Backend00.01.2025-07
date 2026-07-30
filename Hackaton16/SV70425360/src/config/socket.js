let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    const { userId } = socket.handshake.query || {};
    if (userId) {
      socket.join(String(userId));
      console.log(`Usuario ${userId} conectado a Socket.io`);
    } else {
      console.log('Cliente conectado sin userId');
    }

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
}

function emitPaymentStatus(userId, payload) {
  if (!ioInstance) return;
  ioInstance.to(String(userId)).emit('payment-status', payload);
}

module.exports = {
  initSocket,
  emitPaymentStatus
};

// Exportar como función por defecto para server.js
module.exports.default = initSocket;
