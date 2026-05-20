import React, { useCallback } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import type { Generation } from '../../types';

interface GenerationCardProps {
  generation: Generation;
  onPress: (generation: Generation) => void;
  onLongPress?: (generation: Generation) => void;
  width: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GenerationCard({
  generation,
  onPress,
  onLongPress,
  width,
}: GenerationCardProps) {
  const scale = useSharedValue(1);
  const aspectRatioMap: Record<string, number> = {
    '1:1': 1,
    '9:16': 16 / 9,
    '16:9': 9 / 16,
    '3:4': 4 / 3,
    '4:3': 3 / 4,
  };
  const heightRatio = aspectRatioMap[generation.aspectRatio] ?? 1;
  const height = width * heightRatio;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(async () => {
    scale.value = withSpring(0.96, { damping: 15 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 15 }); }, 100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(generation);
  }, [generation, onPress, scale]);

  const handleLongPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(generation);
  }, [generation, onLongPress]);

  const mediaUrl = generation.thumbnailUrl ?? generation.mediaUrls[0];

  if (generation.status === 'processing' || generation.status === 'pending') {
    return (
      <AnimatedPressable style={[animStyle, styles.card, { width, height }]}>
        <View style={[styles.loadingContainer, { width, height }]}>
          <View style={styles.loadingShimmer} />
          <View style={styles.loadingBadge}>
            <Text style={styles.loadingText}>Generating...</Text>
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[animStyle, styles.card, { width, height }]}
    >
      {mediaUrl ? (
        <Image
          source={{ uri: mediaUrl }}
          style={[styles.image, { width, height }]}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.placeholder, { width, height }]}>
          <Text style={styles.placeholderText}>
            {generation.status === 'failed' ? '❌' : '🖼'}
          </Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={[styles.typeBadge, generation.type === 'video' && styles.videoBadge]}>
          <Text style={styles.typeText}>
            {generation.type === 'video' ? '▶' : '◼'} {generation.type}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    marginBottom: 8,
  },
  image: {
    borderRadius: 12,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  placeholderText: {
    fontSize: 32,
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  videoBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.8)',
  },
  typeText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingShimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.card,
    opacity: 0.6,
  },
  loadingBadge: {
    backgroundColor: Colors.primaryDim,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
