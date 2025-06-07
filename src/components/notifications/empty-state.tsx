import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-gray-800 text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 text-center leading-relaxed mb-6">
        {description}
      </Text>

      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="px-6 py-3 bg-blue-500 rounded-xl"
          activeOpacity={0.8}>
          <Text className="text-white font-semibold">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
