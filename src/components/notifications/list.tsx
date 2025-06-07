import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {DashboardStats, NotificationData, SearchFilters} from '../../types';
import {DashboardCards} from '../dashboard/cards';
import {StatsCard} from '../dashboard/stat-card';
import {SearchBar} from '../search/search-bar';
import {NotificationCard} from './card';
import {EmptyState} from './empty-state';

interface NotificationListProps {
  notifications: NotificationData[];
  loading: boolean;
  error: string | null;
  stats: DashboardStats;
  uniqueApps: string[];
  filters: SearchFilters;
  onRefresh: () => void;
  onNotificationPress: (notification: NotificationData) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onSearch: (filters: SearchFilters) => void;
  onCardPress: (type: 'total' | 'read' | 'unread') => void;
  onClearOld: () => void;
  onMarkAllAsRead: () => void;
  onClearError: () => void;
  onLoadMore?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  stats,
  uniqueApps,
  filters,
  onRefresh,
  onNotificationPress,
  onMarkAsRead,
  onDelete,
  onSearch,
  onCardPress,
  onClearOld,
  onMarkAllAsRead,
  onClearError,
  onLoadMore,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const renderItem = useCallback(
    ({item, index}: {item: NotificationData; index: number}) => (
      <NotificationCard
        notification={item}
        onPress={() => onNotificationPress(item)}
        onMarkAsRead={() => onMarkAsRead(item.id)}
        onDelete={() => onDelete(item.id)}
        isFirst={index === 0}
        isLast={index === notifications.length - 1}
      />
    ),
    [onNotificationPress, onMarkAsRead, onDelete, notifications.length],
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        icon="📭"
        title="No notifications found"
        description="Your notifications will appear here as they arrive"
        actionText="Refresh"
        onAction={onRefresh}
      />
    ),
    [onRefresh],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Dashboard Cards */}
        <DashboardCards stats={stats} onCardPress={onCardPress} />

        {/* Stats Card */}
        <StatsCard
          stats={stats}
          onRefresh={onRefresh}
          onClearOld={onClearOld}
          onMarkAllAsRead={onMarkAllAsRead}
        />

        {/* Search Bar */}
        <SearchBar
          onSearch={onSearch}
          uniqueApps={uniqueApps}
          initialFilters={filters}
        />

        {/* Error Message */}
        {error && (
          <View className="mx-4 mb-2 p-3 bg-red-100 border border-red-200 rounded-lg">
            <Text className="text-red-700 text-sm">{error}</Text>
            <TouchableOpacity
              onPress={onClearError}
              className="absolute right-2 top-2 p-1">
              <Text className="text-red-500 font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List Count Header */}
        {notifications.length > 0 && (
          <View className="px-4 py-3 bg-white border-b border-gray-200 mx-4 mt-2 rounded-t-lg">
            <Text className="text-sm font-semibold text-gray-700">
              {notifications.length} notification
              {notifications.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    ),
    [
      stats,
      onCardPress,
      onRefresh,
      onClearOld,
      onMarkAllAsRead,
      onSearch,
      uniqueApps,
      filters,
      error,
      onClearError,
      notifications.length,
    ],
  );

  const keyExtractor = useCallback((item: NotificationData) => item.id, []);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={['#3B82F6']}
        tintColor="#3B82F6"
      />
    ),
    [refreshing, handleRefresh],
  );

  const contentContainerStyle = useMemo(() => {
    if (notifications.length === 0) {
      return {flex: 1};
    }
    return {paddingBottom: 20};
  }, [notifications.length]);

  return (
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={refreshControl}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={15}
      contentContainerStyle={contentContainerStyle}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
    />
  );
};
