export const getIO = () => {
  if (!global.io) {
    throw new Error("Socket.io not initialized");
  }
  return global.io;
};