import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  indeterminate?: boolean;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  size = 60,
  strokeWidth = 4,
  progress = 0,
  indeterminate = false,
  color = Colors.primary,
  trackColor = Colors.border,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressValue = useSharedValue(indeterminate ? 0.25 : progress);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (indeterminate) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false,
      );
      progressValue.value = 0.25;
    } else {
      progressValue.value = withTiming(progress, { duration: 500 });
    }
  }, [indeterminate, progress, progressValue, rotation]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value),
  }));

  const rotationStyle = {
    transform: [{ rotate: `${rotation.value}deg` }],
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[{ width: size, height: size }, indeterminate && rotationStyle]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
