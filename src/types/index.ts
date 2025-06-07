// src/types/index.ts
export interface NotificationData {
  id: string;
  packageName: string;
  appName: string;
  title: string;
  text: string;
  bigText?: string;
  timestamp: number;
  priority: number;
  category?: string;
  ongoing: boolean;
}

export interface NotificationModule {
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  startListening(): Promise<boolean>;
}
