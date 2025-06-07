// src/services/NotificationService.ts
import {DeviceEventEmitter, NativeModules} from 'react-native';
import type {NotificationData, NotificationModule} from '../types';

const {NotificationModule} = NativeModules as {
  NotificationModule: NotificationModule;
};

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notification: NotificationData) => void)[] = [];
  private subscription: any = null;

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
    try {
      await NotificationModule.startListening();

      this.subscription = DeviceEventEmitter.addListener(
        'NotificationReceived',
        this.handleNotificationReceived.bind(this),
      );

      return true;
    } catch (error) {
      console.error('Error starting listener:', error);
      return false;
    }
  }

  private handleNotificationReceived(notification: NotificationData): void {
    console.log('New notification:', notification);
    this.notifications.unshift(notification);
    this.listeners.forEach(listener => listener(notification));
  }

  addListener(callback: (notification: NotificationData) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  cleanup(): void {
    if (this.subscription) {
      this.subscription.remove();
    }
  }
}

export default new NotificationService();
