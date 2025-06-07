import SQLite from 'react-native-sqlite-2';
import {
  DashboardStats,
  DatabaseNotification,
  NotificationData,
  SearchFilters,
} from '../types';

class DatabaseService {
  private db: any = null;

  async initialize(): Promise<void> {
    try {
      // Open database - react-native-sqlite-2 uses a simpler API
      this.db = SQLite.openDatabase(
        'NotificationTracker.db',
        '1.0',
        '',
        200000,
      );

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        package_name TEXT NOT NULL,
        app_name TEXT NOT NULL,
        title TEXT NOT NULL,
        text TEXT NOT NULL,
        big_text TEXT,
        timestamp INTEGER NOT NULL,
        priority INTEGER DEFAULT 0,
        category TEXT,
        ongoing INTEGER DEFAULT 0,
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        UNIQUE(id)
      );
    `;

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_timestamp ON notifications(timestamp);',
      'CREATE INDEX IF NOT EXISTS idx_app_name ON notifications(app_name);',
      'CREATE INDEX IF NOT EXISTS idx_is_read ON notifications(is_read);',
      'CREATE INDEX IF NOT EXISTS idx_created_at ON notifications(created_at);',
    ];

    // Execute table creation
    await this.executeSql(createTableQuery);

    // Execute index creation
    for (const indexQuery of createIndexes) {
      await this.executeSql(indexQuery);
    }
  }

  // Helper method to promisify executeSql for react-native-sqlite-2
  private executeSql(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          query,
          params,
          (tx: any, results: any) => {
            resolve(results);
          },
          (tx: any, error: any) => {
            reject(error);
          },
        );
      });
    });
  }

  async insertNotification(notification: NotificationData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const insertQuery = `
      INSERT OR REPLACE INTO notifications 
      (id, package_name, app_name, title, text, big_text, timestamp, priority, category, ongoing, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      notification.id,
      notification.packageName,
      notification.appName,
      notification.title,
      notification.text,
      notification.bigText || '',
      notification.timestamp,
      notification.priority,
      notification.category || '',
      notification.ongoing ? 1 : 0,
      notification.isRead ? 1 : 0,
      notification.createdAt || new Date().toISOString(),
    ];

    try {
      await this.executeSql(insertQuery, params);
    } catch (error) {
      console.error('Failed to insert notification:', error);
      throw error;
    }
  }

  async getNotifications(
    filters: SearchFilters = {query: ''},
    limit: number = 50,
    offset: number = 0,
  ): Promise<NotificationData[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params: any[] = [];

    // Search query filter
    if (filters.query) {
      query += ' AND (title LIKE ? OR text LIKE ? OR app_name LIKE ?)';
      const searchTerm = `%${filters.query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // App name filter
    if (filters.appName) {
      query += ' AND app_name = ?';
      params.push(filters.appName);
    }

    // Read status filter
    if (filters.isRead !== undefined) {
      query += ' AND is_read = ?';
      params.push(filters.isRead ? 1 : 0);
    }

    // Date range filter
    if (filters.dateRange) {
      query += ' AND created_at BETWEEN ? AND ?';
      params.push(
        filters.dateRange.start.toISOString(),
        filters.dateRange.end.toISOString(),
      );
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      const results = await this.executeSql(query, params);
      const notifications: NotificationData[] = [];

      for (let i = 0; i < results.rows.length; i++) {
        const row: DatabaseNotification = results.rows.item(i);
        notifications.push({
          id: row.id,
          packageName: row.package_name,
          appName: row.app_name,
          title: row.title,
          text: row.text,
          bigText: row.big_text,
          timestamp: row.timestamp,
          priority: row.priority,
          category: row.category,
          ongoing: row.ongoing === 1,
          isRead: row.is_read === 1,
          createdAt: row.created_at,
        });
      }

      return notifications;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Total notifications
      const totalResult = await this.executeSql(
        'SELECT COUNT(*) as count FROM notifications',
      );
      const total = totalResult.rows.item(0).count;

      // Read notifications
      const readResult = await this.executeSql(
        'SELECT COUNT(*) as count FROM notifications WHERE is_read = 1',
      );
      const read = readResult.rows.item(0).count;

      // Unread notifications
      const unread = total - read;

      // Today's notifications
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayResult = await this.executeSql(
        'SELECT COUNT(*) as count FROM notifications WHERE created_at >= ?',
        [todayStart.toISOString()],
      );
      const todayCount = todayResult.rows.item(0).count;

      // Week's notifications
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekResult = await this.executeSql(
        'SELECT COUNT(*) as count FROM notifications WHERE created_at >= ?',
        [weekStart.toISOString()],
      );
      const weekCount = weekResult.rows.item(0).count;

      // Top apps
      const appsResult = await this.executeSql(`
        SELECT app_name, package_name, COUNT(*) as count, MAX(timestamp) as last_notification
        FROM notifications 
        GROUP BY app_name, package_name 
        ORDER BY count DESC 
        LIMIT 10
      `);

      const topApps = [];
      for (let i = 0; i < appsResult.rows.length; i++) {
        const row = appsResult.rows.item(i);
        topApps.push({
          appName: row.app_name,
          packageName: row.package_name,
          count: row.count,
          lastNotification: row.last_notification,
        });
      }

      return {
        total,
        read,
        unread,
        todayCount,
        weekCount,
        topApps,
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.executeSql(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [id],
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.executeSql('UPDATE notifications SET is_read = 1');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.executeSql('DELETE FROM notifications WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  async clearOldNotifications(daysOld: number = 30): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      const result = await this.executeSql(
        'DELETE FROM notifications WHERE created_at < ?',
        [cutoffDate.toISOString()],
      );
      return result.rowsAffected;
    } catch (error) {
      console.error('Failed to clear old notifications:', error);
      throw error;
    }
  }

  async getUniqueApps(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.executeSql(`
        SELECT DISTINCT app_name 
        FROM notifications 
        ORDER BY app_name
      `);

      const apps: string[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        apps.push(result.rows.item(i).app_name);
      }
      return apps;
    } catch (error) {
      console.error('Failed to get unique apps:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
