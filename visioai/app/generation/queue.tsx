import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { ProgressRing } from '../../components/ui/ProgressRing';

export default function QueueScreen() {
  const pulse = useSharedValue(0);
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
    dot1.value = withRepeat(withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 400 }),
    ), -1);
    setTimeout(() => {
      dot2.value = withRepeat(withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ), -1);
    }, 200);
    setTimeout(() => {
      dot3.value = withRepeat(withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ), -1);
    }, 400);
  }, [pulse, dot1, dot2, dot3]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.4, 0.8]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.95, 1.05]) }],
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -4]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -4]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -4]) }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[Colors.background, Colors.surface, Colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, glowStyle]}>
          <LinearGradient
            colors={[Colors.primary, '#5B21B6']}
            style={styles.iconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.iconEmoji}>🎬</Text>
          </LinearGradient>
        </Animated.View>

        <ProgressRing size={80} strokeWidth={5} indeterminate color={Colors.primary} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>Generating</Text>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
          </View>
        </View>

        <Text style={styles.subtitle}>
          Your video is being created by Higgsfield AI. This usually takes 1-5 minutes.
        </Text>

        <View style={styles.stepsContainer}>
          {[
            { label: 'Analyzing prompt', done: true },
            { label: 'Generating frames', done: false, active: true },
            { label: 'Compositing video', done: false },
            { label: 'Finalizing', done: false },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={[
                styles.stepDot,
                step.done && styles.stepDotDone,
                step.active && styles.stepDotActive,
              ]}>
                {step.done && <Text style={styles.stepCheck}>✓</Text>}
                {step.active && <View style={styles.stepActivePulse} />}
              </View>
              <Text style={[
                styles.stepLabel,
                step.done && styles.stepLabelDone,
                step.active && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.hint}>
          You can navigate away. Your generation will complete in the background.
        </Text>

        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Studio</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  iconEmoji: {
    fontSize: 44,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepDotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  stepCheck: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
  },
  stepActivePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  stepLabelDone: {
    color: Colors.success,
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backBtnText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
