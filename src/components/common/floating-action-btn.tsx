import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  text?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'small' | 'medium' | 'large';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '➕',
  text,
  position = 'bottom-right',
  size = 'medium',
}) => {
  const positionClasses = {
    'bottom-right': 'absolute bottom-6 right-6',
    'bottom-left': 'absolute bottom-6 left-6',
    'bottom-center': 'absolute bottom-6 self-center',
  };

  const sizeClasses = {
    small: text ? 'px-4 py-2' : 'w-12 h-12',
    medium: text ? 'px-6 py-3' : 'w-14 h-14',
    large: text ? 'px-8 py-4' : 'w-16 h-16',
  };

  const iconSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${positionClasses[position]} ${
        sizeClasses[size]
      } bg-blue-500 rounded-full shadow-lg justify-center items-center ${
        text ? 'flex-row' : ''
      }`}
      activeOpacity={0.8}
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}>
      <Text className={`${iconSizeClasses[size]} ${text ? 'mr-2' : ''}`}>
        {icon}
      </Text>
      {text && <Text className="text-white font-semibold">{text}</Text>}
    </TouchableOpacity>
  );
};
