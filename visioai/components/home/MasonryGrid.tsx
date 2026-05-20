import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { GenerationCard } from '../ui/GenerationCard';
import type { Generation } from '../../types';

interface MasonryGridProps {
  generations: Generation[];
  onPress: (generation: Generation) => void;
  onLongPress: (generation: Generation) => void;
  numColumns?: number;
  spacing?: number;
}

function AnimatedCard({
  generation,
  index,
  onPress,
  onLongPress,
  width,
}: {
  generation: Generation;
  index: number;
  onPress: (g: Generation) => void;
  onLongPress: (g: Generation) => void;
  width: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    const delay = (index % 10) * 60;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, [index, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <GenerationCard
        generation={generation}
        onPress={onPress}
        onLongPress={onLongPress}
        width={width}
      />
    </Animated.View>
  );
}

export function MasonryGrid({
  generations,
  onPress,
  onLongPress,
  numColumns = 2,
  spacing = 8,
}: MasonryGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const columnWidth = (screenWidth - spacing * (numColumns + 1)) / numColumns;

  const columns = useMemo(() => {
    const cols: Generation[][] = Array.from({ length: numColumns }, () => []);
    generations.forEach((gen, i) => {
      cols[i % numColumns]?.push(gen);
    });
    return cols;
  }, [generations, numColumns]);

  return (
    <View style={[styles.container, { paddingHorizontal: spacing }]}>
      {columns.map((column, colIndex) => (
        <View key={colIndex} style={[styles.column, { marginLeft: colIndex > 0 ? spacing : 0 }]}>
          {column.map((generation, rowIndex) => (
            <AnimatedCard
              key={generation.id}
              generation={generation}
              index={colIndex + rowIndex * numColumns}
              onPress={onPress}
              onLongPress={onLongPress}
              width={columnWidth}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
});
