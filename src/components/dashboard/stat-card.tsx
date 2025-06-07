import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {DashboardStats} from '../../types';

interface StatsCardProps {
  stats: DashboardStats;
  onRefresh: () => void;
  onClearOld: () => void;
  onMarkAllAsRead: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  stats,
  onRefresh,
  onClearOld,
  onMarkAllAsRead,
}) => {
  return (
    <View className="mx-4 my-2 bg-white rounded-xl shadow-lg p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Quick Stats</Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="p-2 bg-blue-100 rounded-lg"
          activeOpacity={0.7}>
          <Text className="text-blue-600 text-sm font-medium">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center">
          <Text className="text-xl font-bold text-blue-600">
            {stats.weekCount}
          </Text>
          <Text className="text-xs text-gray-500">This Week</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-purple-600">
            {stats.topApps.length}
          </Text>
          <Text className="text-xs text-gray-500">Active Apps</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-orange-600">
            {stats.total > 0 ? Math.round(stats.total / 7) : 0}
          </Text>
          <Text className="text-xs text-gray-500">Daily Avg</Text>
        </View>
      </View>

      {/* Top Apps */}
      {stats.topApps.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Top Apps
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stats.topApps.slice(0, 5).map((app, index) => (
              <View key={app.packageName} className="mr-3 items-center">
                <View className="w-12 h-12 bg-gray-100 rounded-full justify-center items-center mb-1">
                  <Text className="text-lg">
                    {app.appName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text
                  className="text-xs text-gray-600 text-center w-16"
                  numberOfLines={1}>
                  {app.appName}
                </Text>
                <Text className="text-xs font-semibold text-blue-600">
                  {app.count}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={onMarkAllAsRead}
          className="flex-1 mr-1 p-3 bg-green-100 rounded-lg"
          activeOpacity={0.7}>
          <Text className="text-green-600 text-sm font-medium text-center">
            Mark All Read
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClearOld}
          className="flex-1 mx-1 p-3 bg-orange-100 rounded-lg"
          activeOpacity={0.7}>
          <Text className="text-orange-600 text-sm font-medium text-center">
            Clear Old
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 ml-1 p-3 bg-blue-100 rounded-lg"
          activeOpacity={0.7}>
          <Text className="text-blue-600 text-sm font-medium text-center">
            Export Data
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
