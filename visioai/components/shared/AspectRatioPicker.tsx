import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import type { AspectRatio } from '../../types';

interface AspectRatioPickerProps {
  selected: AspectRatio;
  options: AspectRatio[];
  onChange: (ratio: AspectRatio) => void;
}

const ratioPreview: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 24, height: 24 },
  '9:16': { width: 15, height: 26 },
  '16:9': { width: 26, height: 15 },
  '3:4': { width: 18, height: 24 },
  '4:3': { width: 24, height: 18 },
};

export function AspectRatioPicker({ selected, options, onChange }: AspectRatioPickerProps) {
  const handleSelect = async (ratio: AspectRatio) => {
    await Haptics.selectionAsync();
    onChange(ratio);
  };

  return (
    <View>
      <Text style={styles.label}>Aspect Ratio</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {options.map((ratio) => {
            const isSelected = ratio === selected;
            const dims = ratioPreview[ratio];
            return (
              <Pressable
                key={ratio}
                onPress={() => handleSelect(ratio)}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <View
                  style={[
                    styles.preview,
                    { width: dims.width, height: dims.height },
                    isSelected && styles.previewSelected,
                  ]}
                />
                <Text style={[styles.ratioText, isSelected && styles.ratioTextSelected]}>
                  {ratio}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
    minWidth: 70,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  preview: {
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  previewSelected: {
    backgroundColor: Colors.primary,
  },
  ratioText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  ratioTextSelected: {
    color: Colors.primary,
  },
});
