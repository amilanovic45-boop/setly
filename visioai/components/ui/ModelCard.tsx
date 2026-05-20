import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import type { ModelInfo } from '../../types';

interface ModelCardProps {
  model: ModelInfo;
  selected: boolean;
  onSelect: (model: ModelInfo) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ModelCard({ model, selected, onSelect }: ModelCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 250 });
  }, [selected, progress]);

  const borderAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.border, Colors.primary],
    ),
    borderWidth: selected ? 1.5 : 1,
  }));

  const handlePress = async () => {
    await Haptics.selectionAsync();
    onSelect(model);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.card, borderAnimStyle]}
    >
      {selected && (
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.12)', 'rgba(124, 58, 237, 0.04)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      <View style={styles.header}>
        <View style={[styles.iconBadge, selected && styles.iconBadgeActive]}>
          <Text style={styles.iconText}>
            {model.type === 'image' ? '🎨' : '🎬'}
          </Text>
        </View>
        {selected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>Active</Text>
          </View>
        )}
      </View>

      <Text style={[styles.modelName, selected && styles.modelNameActive]}>
        {model.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {model.description}
      </Text>

      <View style={styles.tag}>
        <Text style={styles.tagText}>{model.bestFor.split(',')[0]?.trim()}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.card,
    marginRight: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeActive: {
    backgroundColor: Colors.primaryDim,
  },
  iconText: {
    fontSize: 18,
  },
  selectedBadge: {
    backgroundColor: Colors.primaryDim,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  selectedBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  modelName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  modelNameActive: {
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '500',
  },
});
