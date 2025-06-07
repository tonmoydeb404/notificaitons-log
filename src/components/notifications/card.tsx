import React, {useState} from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {NotificationData} from '../../types';

interface NotificationCardProps {
  notification: NotificationData;
  onPress: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
  isFirst,
  isLast,
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 1) return 'bg-red-500';
    if (priority === 0) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: onDelete},
      ],
    );
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
    if (!notification.isRead) {
      onMarkAsRead();
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggleExpanded}
      className={`mx-4 bg-white border border-gray-200 ${
        isFirst ? 'rounded-t-xl' : ''
      } ${isLast ? 'rounded-b-xl' : ''} ${
        !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
      }`}
      activeOpacity={0.7}>
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center flex-1">
            <View
              className={`w-3 h-3 rounded-full mr-3 ${getPriorityColor(
                notification.priority,
              )}`}
            />
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-gray-800"
                numberOfLines={1}>
                {notification.appName}
              </Text>
              <Text className="text-xs text-gray-500">
                {formatTime(notification.timestamp)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            {!notification.isRead && (
              <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
            )}
            <TouchableOpacity
              onPress={handleDelete}
              className="p-1"
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text className="text-red-500">🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="mb-2">
          <Text
            className="text-base font-medium text-gray-900 mb-1"
            numberOfLines={expanded ? undefined : 2}>
            {notification.title}
          </Text>

          {notification.text && (
            <Text
              className="text-sm text-gray-700 leading-relaxed"
              numberOfLines={expanded ? undefined : 3}>
              {notification.text}
            </Text>
          )}

          {expanded &&
            notification.bigText &&
            notification.bigText !== notification.text && (
              <Text className="text-sm text-gray-600 mt-2 leading-relaxed">
                {notification.bigText}
              </Text>
            )}
        </View>

        {/* Expanded Content */}
        {expanded && (
          <View className="pt-2 border-t border-gray-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500 mr-4">
                  Priority:{' '}
                  {notification.priority === 1
                    ? 'High'
                    : notification.priority === 0
                    ? 'Normal'
                    : 'Low'}
                </Text>
                {notification.category && (
                  <Text className="text-xs text-gray-500 mr-4">
                    Category: {notification.category}
                  </Text>
                )}
                {notification.ongoing && (
                  <Text className="text-xs text-orange-600 font-medium">
                    Ongoing
                  </Text>
                )}
              </View>

              {!notification.isRead && (
                <TouchableOpacity
                  onPress={onMarkAsRead}
                  className="px-3 py-1 bg-blue-100 rounded-full"
                  activeOpacity={0.7}>
                  <Text className="text-blue-600 text-xs font-medium">
                    Mark Read
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Expand/Collapse Indicator */}
        <View className="items-center mt-2">
          <Text className="text-gray-400 text-xs">
            {expanded ? '▲ Tap to collapse' : '▼ Tap to expand'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
