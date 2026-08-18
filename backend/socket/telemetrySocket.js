let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client joins their personal telemetry channel or role room
    socket.on('join', (data) => {
      if (data && data.userId) {
        socket.join(`user:${data.userId}`);
      }
      if (data && data.role) {
        socket.join(`role:${data.role}`);
      }
      if (data && data.clientId) {
        socket.join(`session:${data.clientId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

/**
 * Emit real-time X-Ray telemetry step to a specific socket or session
 */
const emitTelemetryStep = (targetId, stepPayload) => {
  if (!ioInstance) return;

  const payload = {
    ...stepPayload,
    timestamp: new Date().toISOString(),
  };

  // Emit to direct socketId, or session room, or user room
  ioInstance.to(targetId).emit('telemetry:step', payload);
  if (targetId.startsWith('session:') || targetId.startsWith('user:')) {
    ioInstance.to(targetId).emit('telemetry:step', payload);
  } else {
    ioInstance.to(`session:${targetId}`).emit('telemetry:step', payload);
    ioInstance.to(`user:${targetId}`).emit('telemetry:step', payload);
  }
};

/**
 * Broadcast ticket updates to Developers and Managers in real-time
 */
const broadcastTicketEvent = (event, data) => {
  if (!ioInstance) return;
  ioInstance.emit(event, data);
};

module.exports = {
  initSocket,
  getIO,
  emitTelemetryStep,
  broadcastTicketEvent,
};
