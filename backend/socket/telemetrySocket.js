let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
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
    targetId,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to rooms and global telemetry stream for instant delivery
  ioInstance.emit('telemetry:step', payload);
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
