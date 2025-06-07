import React from 'react';
import {StatusBar, Text, TouchableOpacity, View} from 'react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSettingsPress?: () => void;
  showSettings?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSettingsPress,
  showSettings = true,
}) => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View className="bg-white border-b border-gray-200 px-4 py-4 pt-12">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">{title}</Text>
            {subtitle && (
              <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text>
            )}
          </View>

          {showSettings && onSettingsPress && (
            <TouchableOpacity
              onPress={onSettingsPress}
              className="p-2 bg-gray-100 rounded-lg"
              activeOpacity={0.7}>
              <Text className="text-lg">⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};
