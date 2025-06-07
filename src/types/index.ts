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
  isRead: boolean;
  createdAt: string;
}

export interface NotificationModule {
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  startListening(): Promise<boolean>;
}

export interface DashboardStats {
  total: number;
  read: number;
  unread: number;
  todayCount: number;
  weekCount: number;
  topApps: AppStats[];
}

export interface AppStats {
  appName: string;
  packageName: string;
  count: number;
  lastNotification: number;
}

export interface SearchFilters {
  query: string;
  appName?: string;
  isRead?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DatabaseNotification {
  id: string;
  package_name: string;
  app_name: string;
  title: string;
  text: string;
  big_text: string;
  timestamp: number;
  priority: number;
  category: string;
  ongoing: number;
  is_read: number;
  created_at: string;
}
