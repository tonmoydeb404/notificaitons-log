import React, {useEffect, useRef} from 'react';
import {Animated, Text} from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );

    spinAnimation.start();

    return () => {
      spinAnimation.stop();
    };
  }, [spinValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <Animated.View
      className="flex-1 justify-center items-center"
      style={{opacity: fadeValue}}>
      <Animated.View
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full mb-4`}
        style={{transform: [{rotate: spin}]}}
      />

      <Text className={`${textSizeClasses[size]} text-gray-600 text-center`}>
        {message}
      </Text>
    </Animated.View>
  );
};
