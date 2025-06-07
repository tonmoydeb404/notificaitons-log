import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {DashboardStats} from '../../types';

interface DashboardCardsProps {
  stats: DashboardStats;
  onCardPress?: (type: 'total' | 'read' | 'unread') => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  stats,
  onCardPress,
}) => {
  const cards = [
    {
      type: 'total' as const,
      title: 'Total',
      value: stats.total,
      subtitle: `${stats.todayCount} today`,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: '📊',
    },
    {
      type: 'unread' as const,
      title: 'Unread',
      value: stats.unread,
      subtitle: `${
        Math.round((stats.unread / stats.total) * 100) || 0
      }% of total`,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      icon: '🔴',
    },
    {
      type: 'read' as const,
      title: 'Read',
      value: stats.read,
      subtitle: `${
        Math.round((stats.read / stats.total) * 100) || 0
      }% of total`,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: '✅',
    },
  ];

  return (
    <View className="flex-row justify-between px-4 py-2">
      {cards.map(card => (
        <TouchableOpacity
          key={card.type}
          onPress={() => onCardPress?.(card.type)}
          className={`flex-1 mx-1 p-4 rounded-xl ${card.bgColor} shadow-lg`}
          activeOpacity={0.8}>
          <View className="items-center">
            <Text className="text-2xl mb-1">{card.icon}</Text>
            <Text className={`text-2xl font-bold ${card.textColor}`}>
              {card.value.toLocaleString()}
            </Text>
            <Text
              className={`text-sm font-medium ${card.textColor} opacity-90`}>
              {card.title}
            </Text>
            <Text
              className={`text-xs ${card.textColor} opacity-75 text-center mt-1`}>
              {card.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
