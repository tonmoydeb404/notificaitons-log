import React from 'react';
import {Modal, Pressable, Text, TouchableOpacity, View} from 'react-native';

interface ActionSheetOption {
  text: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  options,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          className="bg-white rounded-t-3xl"
          onPress={e => e.stopPropagation()}>
          {/* Header */}
          {(title || subtitle) && (
            <View className="px-6 py-4 border-b border-gray-200">
              {title && (
                <Text className="text-lg font-bold text-gray-900 text-center">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text className="text-sm text-gray-600 text-center mt-1">
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* Options */}
          <View className="py-2">
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                disabled={option.disabled}
                className={`px-6 py-4 ${option.disabled ? 'opacity-50' : ''}`}
                activeOpacity={0.7}>
                <Text
                  className={`text-center font-medium ${
                    option.destructive
                      ? 'text-red-600'
                      : option.disabled
                      ? 'text-gray-400'
                      : 'text-blue-600'
                  }`}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <View className="border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="px-6 py-4"
              activeOpacity={0.7}>
              <Text className="text-center font-semibold text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
