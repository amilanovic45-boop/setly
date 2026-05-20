import React, { useCallback, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface PromptInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  minHeight?: number;
}

export function PromptInput({
  value,
  onChangeText,
  maxLength = 1500,
  label = 'Prompt',
  placeholder = 'Describe what you want to create...',
  minHeight = 140,
  ...rest
}: PromptInputProps) {
  const focused = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = useCallback(() => {
    focused.value = withTiming(1, { duration: 200 });
  }, [focused]);

  const handleBlur = useCallback(() => {
    focused.value = withTiming(0, { duration: 200 });
  }, [focused]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focused.value,
      [0, 1],
      [Colors.border, Colors.primary],
    ),
  }));

  const charsLeft = maxLength - value.length;
  const isNearLimit = charsLeft < 100;
  const isAtLimit = charsLeft <= 0;

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View style={[styles.container, borderStyle]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={maxLength}
          style={[styles.input, { minHeight }]}
          textAlignVertical="top"
          {...rest}
        />
        <View style={styles.footer}>
          <Text
            style={[
              styles.counter,
              isNearLimit && styles.counterWarning,
              isAtLimit && styles.counterError,
            ]}
          >
            {value.length}/{maxLength}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  counter: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  counterWarning: {
    color: Colors.warning,
  },
  counterError: {
    color: Colors.error,
  },
});
