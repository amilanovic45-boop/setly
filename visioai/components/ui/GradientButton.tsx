import React, { useCallback } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';

interface GradientButtonProps {
  onPress: () => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  glowEffect?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GradientButton({
  onPress,
  label,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  textStyle,
  glowEffect = true,
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    if (!disabled && !loading) {
      glow.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true,
      );
    } else {
      glow.value = 0;
    }
  }, [disabled, loading, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glow.value, [0, 1], [0.3, 0.6]);
    return {
      shadowOpacity: glowEffect ? opacity : 0,
    };
  });

  const handlePress = useCallback(async () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }, 100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, loading, onPress, scale]);

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
    md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16 },
  };

  const textSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          animatedStyle,
          glowStyle,
          styles.glowShadow,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <LinearGradient
          colors={disabled ? ['#3A3A50', '#2A2A38'] : Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={[styles.text, { fontSize: textSizes[size] }, textStyle]}>
              {label}
            </Text>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === 'outline') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          animatedStyle,
          styles.outlineButton,
          sizeStyles[size],
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <Text style={[styles.outlineText, { fontSize: textSizes[size] }, textStyle]}>
            {label}
          </Text>
        )}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        styles.secondaryButton,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textPrimary} size="small" />
      ) : (
        <Text style={[styles.text, { fontSize: textSizes[size] }, textStyle]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  glowShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 8,
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDim,
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fullWidth: {
    width: '100%',
  },
});
