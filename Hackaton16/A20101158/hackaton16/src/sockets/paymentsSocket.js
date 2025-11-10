export default function paymentsSocket(io) {
  // Escuchar conexión de nuevos clientes
  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Escuchar eventos de pago emitidos por el cliente
    socket.on('new-payment', (data) => {
      console.log('Nuevo pago recibido:', data);

      // Emitir el evento a todos los clientes conectados
      io.emit('payment-update', {
        message: `Nuevo pago de ${data.user} por el producto ${data.product}`,
        amount: data.amount,
        time: new Date(),
      });
    });

    // Escuchar eventos de reembolso
    socket.on('refund-processed', (data) => {
      console.log('Reembolso procesado:', data);

      io.emit('refund-update', {
        message: `Reembolso de ${data.amount} procesado para ${data.user}`,
        time: new Date(),
      });
    });

    // Detectar desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
    });
  });
}
