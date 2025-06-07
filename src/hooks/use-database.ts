import {useCallback, useEffect, useState} from 'react';
import DatabaseService from '../services/database-service';
import {DashboardStats} from '../types';

export const useDatabase = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    read: 0,
    unread: 0,
    todayCount: 0,
    weekCount: 0,
    topApps: [],
  });
  const [uniqueApps, setUniqueApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardStats = await DatabaseService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUniqueApps = useCallback(async () => {
    try {
      const apps = await DatabaseService.getUniqueApps();
      setUniqueApps(apps);
    } catch (error) {
      console.error('Failed to load unique apps:', error);
    }
  }, []);

  const clearOldNotifications = useCallback(
    async (daysOld: number = 30) => {
      try {
        const deletedCount = await DatabaseService.clearOldNotifications(
          daysOld,
        );
        await loadStats();
        await loadUniqueApps();
        return deletedCount;
      } catch (error) {
        console.error('Failed to clear old notifications:', error);
        throw error;
      }
    },
    [loadStats, loadUniqueApps],
  );

  const refreshData = useCallback(async () => {
    await Promise.all([loadStats(), loadUniqueApps()]);
  }, [loadStats, loadUniqueApps]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    stats,
    uniqueApps,
    loading,
    loadStats,
    loadUniqueApps,
    clearOldNotifications,
    refreshData,
  };
};
