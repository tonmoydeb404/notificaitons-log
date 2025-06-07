import {useCallback, useEffect, useState} from 'react';
import DatabaseService from '../services/database-service';
import NotificationService from '../services/notification-service';
import {NotificationData, SearchFilters} from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const checkPermission = useCallback(async () => {
    try {
      const permission = await NotificationService.hasPermission();
      setHasPermission(permission);
      return permission;
    } catch (err) {
      setError('Failed to check permission');
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const granted = await NotificationService.requestPermission();
      if (granted) {
        await checkPermission();
      }
      return granted;
    } catch (err) {
      setError('Failed to request permission');
      return false;
    }
  }, [checkPermission]);

  const startListening = useCallback(async () => {
    try {
      const success = await NotificationService.startListening();
      if (!success) {
        setError('Failed to start listening for notifications');
      }
      return success;
    } catch (err) {
      setError('Failed to start notification service');
      return false;
    }
  }, []);

  const loadNotifications = useCallback(
    async (filters: SearchFilters = {query: ''}) => {
      try {
        setLoading(true);
        const data = await DatabaseService.getNotifications(filters);
        setNotifications(data);
        setError(null);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? {...n, isRead: true} : n)),
      );
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError('Failed to delete notification');
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await NotificationService.refreshNotifications();
    await loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await NotificationService.initialize();
        const permission = await checkPermission();

        if (permission) {
          await startListening();
          await loadNotifications();

          // Listen for new notifications
          const unsubscribe = NotificationService.addListener(notification => {
            setNotifications(prev => [notification, ...prev]);
          });

          return unsubscribe;
        }
      } catch (err) {
        setError('Failed to initialize notification service');
      } finally {
        setLoading(false);
      }
    };

    const cleanup = initialize();

    return () => {
      cleanup.then(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
        NotificationService.cleanup();
      });
    };
  }, [checkPermission, startListening, loadNotifications]);

  return {
    notifications,
    loading,
    error,
    hasPermission,
    checkPermission,
    requestPermission,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    setError,
  };
};
