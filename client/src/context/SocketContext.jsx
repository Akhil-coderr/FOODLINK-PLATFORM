import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { showSuccess, showInfo } from '../utils/notification';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const processedEventsRef = useRef(new Set());

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? '/' : 'https://foodlink-platform.onrender.com
');
    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    const isDuplicateSocketEvent = (eventId) => {
      if (!eventId) return false;
      if (processedEventsRef.current.has(eventId)) return true;
      processedEventsRef.current.add(eventId);
      if (processedEventsRef.current.size > 200) {
        const first = processedEventsRef.current.values().next().value;
        processedEventsRef.current.delete(first);
      }
      return false;
    };

    const handleNewNotification = (notification) => {
      if (!notification) return;
      const eventId = notification._id || `notif_${notification.title}_${notification.createdAt || Date.now()}`;
      if (isDuplicateSocketEvent(eventId)) return;

      setUnreadCount((prev) => prev + 1);
      showInfo(notification.title || 'New Notification', {
        eventId,
        icon: '🔔',
        duration: 4000,
      });
    };

    const handleDonationCreated = (data) => {
      if (!data) return;
      if (user.role === 'ngo' || user.role === 'admin') {
        const eventId = `donation_${data._id || `${data.foodName}_${data.quantity}`}`;
        if (isDuplicateSocketEvent(eventId)) return;

        showSuccess(`New Food Available: ${data.foodName} (${data.quantity} ${data.unit})!`, {
          eventId,
        });
      }
    };

    const handleRequestCreated = (data) => {
      if (!data) return;
      if (user.role === 'donor' || user.role === 'admin') {
        const eventId = `request_${data._id || data.donationName}`;
        if (isDuplicateSocketEvent(eventId)) return;

        showInfo(`NGO requested your donation: ${data.donationName}`, {
          eventId,
          icon: '📦',
        });
      }
    };

    const handleAssignmentCreated = (data) => {
      if (!data) return;
      if (user.role === 'volunteer') {
        const eventId = `assignment_${data._id || data.foodName}`;
        if (isDuplicateSocketEvent(eventId)) return;

        showSuccess(`New Pickup Assigned: ${data.foodName}!`, {
          eventId,
        });
      }
    };

    socketInstance.on('notification:new', handleNewNotification);
    socketInstance.on('donation:created', handleDonationCreated);
    socketInstance.on('request:created', handleRequestCreated);
    socketInstance.on('assignment:created', handleAssignmentCreated);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('notification:new', handleNewNotification);
      socketInstance.off('donation:created', handleDonationCreated);
      socketInstance.off('request:created', handleRequestCreated);
      socketInstance.off('assignment:created', handleAssignmentCreated);
      socketInstance.disconnect();
    };
  }, [token, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, unreadCount: 0, setUnreadCount: () => {} };
};
