// src/services/NotificationService.ts

import {AppState, DeviceEventEmitter, NativeModules} from 'react-native';
import type {NotificationData, NotificationModule} from '../types';
import DatabaseService from './database-service';

const {NotificationModule} = NativeModules as {
  NotificationModule: NotificationModule;
};

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notification: NotificationData) => void)[] = [];
  private subscription: any = null;
  private isListening = false;

  async initialize(): Promise<void> {
    try {
      await DatabaseService.initialize();
      await this.setupEventListeners();
      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      throw error;
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Listen for app state changes to handle background
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  private handleAppStateChange(nextAppState: string): void {
    if (nextAppState === 'active' && this.isListening) {
      // Refresh notifications when app becomes active
      this.refreshNotifications();
    }
  }

  async hasPermission(): Promise<boolean> {
    try {
      return await NotificationModule.hasPermission();
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      return await NotificationModule.requestPermission();
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async startListening(): Promise<boolean> {
    if (this.isListening) {
      console.log('Already listening for notifications');
      return true;
    }

    try {
      await NotificationModule.startListening();

      if (this.subscription) {
        this.subscription.remove();
      }

      this.subscription = DeviceEventEmitter.addListener(
        'NotificationReceived',
        this.handleNotificationReceived.bind(this),
      );

      this.isListening = true;
      console.log('Started listening for notifications');
      return true;
    } catch (error) {
      console.error('Error starting listener:', error);
      return false;
    }
  }

  private async handleNotificationReceived(
    rawNotification: any,
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        id: rawNotification.id,
        packageName: rawNotification.packageName,
        appName: rawNotification.appName,
        title: rawNotification.title || '',
        text: rawNotification.text || '',
        bigText: rawNotification.bigText,
        timestamp: rawNotification.timestamp,
        priority: rawNotification.priority || 0,
        category: rawNotification.category,
        ongoing: rawNotification.ongoing || false,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      console.log(
        'New notification received:',
        notification.appName,
        notification.title,
      );

      // Save to database
      await DatabaseService.insertNotification(notification);

      // Add to local array
      this.notifications.unshift(notification);

      // Keep only latest 500 notifications in memory
      if (this.notifications.length > 500) {
        this.notifications = this.notifications.slice(0, 500);
      }

      // Notify listeners
      this.listeners.forEach(listener => listener(notification));
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }

  addListener(callback: (notification: NotificationData) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async refreshNotifications(): Promise<void> {
    try {
      const notifications = await DatabaseService.getNotifications(
        {query: ''},
        100,
        0,
      );
      this.notifications = notifications;
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }

  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await DatabaseService.markAsRead(id);

      // Update local array
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications[index].isRead = true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await DatabaseService.markAllAsRead();

      // Update local array
      this.notifications = this.notifications.map(n => ({...n, isRead: true}));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await DatabaseService.deleteNotification(id);

      // Remove from local array
      this.notifications = this.notifications.filter(n => n.id !== id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  cleanup(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isListening = false;
    this.listeners = [];
    console.log('NotificationService cleaned up');
  }
}

export default new NotificationService();
