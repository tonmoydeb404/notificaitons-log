import React, {useCallback, useEffect} from 'react';
import {
  Alert,
  BackHandler,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Header} from '../components/common/header';
import {LoadingSpinner} from '../components/common/loading-spinner';
import {DashboardCards} from '../components/dashboard/cards';
import {StatsCard} from '../components/dashboard/stat-card';
import {NotificationList} from '../components/notifications/list';
import {SearchBar} from '../components/search/search-bar';
import {useDatabase} from '../hooks/use-database';
import {useNotifications} from '../hooks/use-notifications';
import {useSearch} from '../hooks/use-search';
import {NotificationData, SearchFilters} from '../types';

export const HomeScreen: React.FC = () => {
  const {
    notifications,
    loading: notificationsLoading,
    error,
    hasPermission,
    requestPermission,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    setError,
  } = useNotifications();

  const {
    stats,
    uniqueApps,
    loading: statsLoading,
    clearOldNotifications,
    refreshData: refreshStats,
  } = useDatabase();

  const {filters, hasActiveFilters, updateFilters, clearFilters} = useSearch();

  // Handle search
  const handleSearch = useCallback(
    async (searchFilters: SearchFilters) => {
      updateFilters(searchFilters);
      await loadNotifications(searchFilters);
    },
    [updateFilters, loadNotifications],
  );

  // Handle dashboard card press
  const handleCardPress = useCallback(
    async (type: 'total' | 'read' | 'unread') => {
      let newFilters: SearchFilters = {query: ''};

      if (type === 'read') {
        newFilters.isRead = true;
      } else if (type === 'unread') {
        newFilters.isRead = false;
      }

      await handleSearch(newFilters);
    },
    [handleSearch],
  );

  // Handle notification press
  const handleNotificationPress = useCallback(
    (notification: NotificationData) => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    },
    [markAsRead],
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshNotifications(), refreshStats()]);

    if (hasActiveFilters) {
      await loadNotifications(filters);
    }
  }, [
    refreshNotifications,
    refreshStats,
    hasActiveFilters,
    loadNotifications,
    filters,
  ]);

  // Handle clear old notifications
  const handleClearOld = useCallback(() => {
    Alert.alert(
      'Clear Old Notifications',
      'Delete notifications older than 30 days?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const deletedCount = await clearOldNotifications(30);
              Alert.alert(
                'Success',
                `Deleted ${deletedCount} old notifications`,
              );
              await handleRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear old notifications');
            }
          },
        },
      ],
    );
  }, [clearOldNotifications, handleRefresh]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    Alert.alert('Mark All as Read', 'Mark all notifications as read?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Mark All',
        onPress: async () => {
          try {
            await markAllAsRead();
            await refreshStats();
          } catch (error) {
            Alert.alert('Error', 'Failed to mark all as read');
          }
        },
      },
    ]);
  }, [markAllAsRead, refreshStats]);

  // Handle delete notification
  const handleDeleteNotification = useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id);
        await refreshStats();
      } catch (error) {
        Alert.alert('Error', 'Failed to delete notification');
      }
    },
    [deleteNotification, refreshStats],
  );

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please enable notification access in settings to track notifications.',
        [{text: 'OK'}],
      );
    }
  }, [requestPermission]);

  // Handle back button (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (hasActiveFilters) {
          clearFilters();
          loadNotifications({query: ''});
          return true; // Prevent default back action
        }
        return false; // Allow default back action
      },
    );

    return () => backHandler.remove();
  }, [hasActiveFilters, clearFilters, loadNotifications]);

  // Show permission screen if no permission
  if (!hasPermission) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <Header title="Notification Tracker" showSettings={false} />

        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-6xl mb-6">🔐</Text>
          <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
            Permission Required
          </Text>
          <Text className="text-base text-gray-600 text-center leading-relaxed mb-8">
            This app needs permission to access your notifications to track and
            organize them.
          </Text>

          <TouchableOpacity
            onPress={handleRequestPermission}
            className="px-8 py-4 bg-blue-500 rounded-xl shadow-lg"
            activeOpacity={0.8}>
            <Text className="text-white font-bold text-lg">
              Grant Permission
            </Text>
          </TouchableOpacity>

          <Text className="text-sm text-gray-500 text-center mt-4 px-4">
            You'll be taken to settings where you can enable notification access
          </Text>
        </View>
      </View>
    );
  }

  // Show loading screen
  if (notificationsLoading && notifications.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <Header
          title="Notification Tracker"
          subtitle="Loading notifications..."
        />
        <LoadingSpinner message="Setting up notification tracking..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <Header
        title="Notification Tracker"
        subtitle={`${stats.total} total notifications`}
        onSettingsPress={() => {
          // TODO: Navigate to settings
          Alert.alert('Settings', 'Settings screen coming soon!');
        }}
      />

      {/* Dashboard Cards */}
      <DashboardCards stats={stats} onCardPress={handleCardPress} />

      {/* Stats Card */}
      <StatsCard
        stats={stats}
        onRefresh={handleRefresh}
        onClearOld={handleClearOld}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        uniqueApps={uniqueApps}
        initialFilters={filters}
      />

      {/* Error Message */}
      {error && (
        <View className="mx-4 mb-2 p-3 bg-red-100 border border-red-200 rounded-lg">
          <Text className="text-red-700 text-sm">{error}</Text>
          <TouchableOpacity
            onPress={() => setError(null)}
            className="absolute right-2 top-2">
            <Text className="text-red-500">✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <NotificationList
        notifications={notifications}
        loading={notificationsLoading}
        onRefresh={handleRefresh}
        onNotificationPress={handleNotificationPress}
        onMarkAsRead={markAsRead}
        onDelete={handleDeleteNotification}
      />
    </View>
  );
};
