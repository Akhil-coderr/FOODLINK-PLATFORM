const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/token");
const Notification = require("../models/Notification");

let ioInstance = null;

const initSocket = (server, corsOrigin) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin || [
        "https://foodlink-platform.onrender.com",
        "http://127.0.0.1:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid or expired socket token"));
    }
  });

  io.on("connection", (socket) => {
    const { id: userId, role } = socket.user;

    // Join personal user room and role-based room
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);

    socket.on("disconnect", () => {
      // socket disconnected
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => {
  return ioInstance;
};

// Helper to broadcast notification to a specific user and persist in database
const notifyUser = async ({
  recipientId,
  title,
  message,
  type = "info",
  relatedEntityId = null,
  entityType = null,
}) => {
  try {
    const notif = await Notification.create({
      recipientId,
      title,
      message,
      type,
      relatedEntityId,
      entityType,
    });

    if (ioInstance) {
      ioInstance.to(`user:${recipientId}`).emit("notification:new", notif);
    }
    return notif;
  } catch (err) {
    console.error("Error creating notification:", err.message);
  }
};

// Helper to broadcast to an entire role
const notifyRole = (role, event, data) => {
  if (ioInstance) {
    ioInstance.to(`role:${role}`).emit(event, data);
  }
};

module.exports = { initSocket, getIO, notifyUser, notifyRole };
