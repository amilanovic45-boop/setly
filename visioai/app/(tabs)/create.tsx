import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CreateCard({
  emoji,
  title,
  subtitle,
  gradientColors,
  onPress,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  gradientColors: [string, string];
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    scale.value = withSpring(0.97, { damping: 15 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 15 }); }, 100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable onPress={handlePress} style={[styles.card, animStyle]}>
      <LinearGradient
        colors={[`${gradientColors[0]}20`, `${gradientColors[1]}08`]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.cardBorder} />

      <View style={styles.cardHeader}>
        <LinearGradient
          colors={gradientColors}
          style={styles.emojiContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </LinearGradient>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>

      <View style={styles.modelTags}>
        {title === 'Image Studio' ? (
          <>
            <Tag label="Soul 2" />
            <Tag label="Nano Banana" />
            <Tag label="DTC Ads" />
          </>
        ) : (
          <>
            <Tag label="Seedance 2.0" />
            <Tag label="Kling 3.0" />
            <Tag label="Marketing" />
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Create</Text>
        <Text style={styles.subtitle}>Choose your medium</Text>
      </View>

      <View style={styles.content}>
        <CreateCard
          emoji="🎨"
          title="Image Studio"
          subtitle="Generate stunning images from text prompts with multiple AI models and styles."
          gradientColors={[Colors.primary, '#5B21B6']}
          onPress={() => router.push('/studio/image')}
        />

        <CreateCard
          emoji="🎬"
          title="Video Studio"
          subtitle="Create cinematic videos from text or reference images with cutting-edge models."
          gradientColors={[Colors.accent, '#0891B2']}
          onPress={() => router.push('/studio/video')}
        />

        <View style={styles.proTip}>
          <Text style={styles.proTipIcon}>💡</Text>
          <Text style={styles.proTipText}>
            Pro tip: Use reference images for more consistent and personalized results.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  arrowText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  modelTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  proTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proTipIcon: {
    fontSize: 16,
  },
  proTipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
