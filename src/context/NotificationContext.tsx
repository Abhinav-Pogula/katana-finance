import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppNotification,
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from '../utils/notificationStorage';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notifId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notifId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uid, authReady } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !authReady) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotifications(uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid, authReady]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (notifId: string) => {
      if (!uid) return;
      await markNotificationRead(uid, notifId);
    },
    [uid]
  );

  const markAllAsRead = useCallback(async () => {
    if (!uid) return;
    await markAllNotificationsRead(uid);
  }, [uid]);

  const removeNotification = useCallback(
    async (notifId: string) => {
      if (!uid) return;
      await deleteNotification(uid, notifId);
    },
    [uid]
  );

  const clearAll = useCallback(async () => {
    if (!uid) return;
    await clearAllNotifications(uid);
  }, [uid]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};