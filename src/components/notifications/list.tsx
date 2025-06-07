// src/components/notifications/NotificationList.tsx

import React, {useState} from 'react';
import {FlatList, RefreshControl, Text, View} from 'react-native';
import {NotificationData} from '../../types';
import {NotificationCard} from './card';
import {EmptyState} from './empty-state';

interface NotificationListProps {
  notifications: NotificationData[];
  loading: boolean;
  onRefresh: () => void;
  onNotificationPress: (notification: NotificationData) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadMore?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  onRefresh,
  onNotificationPress,
  onMarkAsRead,
  onDelete,
  onLoadMore,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationData;
    index: number;
  }) => (
    <NotificationCard
      notification={item}
      onPress={() => onNotificationPress(item)}
      onMarkAsRead={() => onMarkAsRead(item.id)}
      onDelete={() => onDelete(item.id)}
      isFirst={index === 0}
      isLast={index === notifications.length - 1}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="📭"
      title="No notifications found"
      description="Your notifications will appear here as they arrive"
      actionText="Refresh"
      onAction={onRefresh}
    />
  );

  const renderHeader = () => (
    <View className="px-4 py-2 bg-gray-50">
      <Text className="text-sm font-semibold text-gray-700">
        {notifications.length} notification
        {notifications.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={notifications.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          notifications.length === 0 ? {flex: 1} : undefined
        }
      />
    </View>
  );
};
