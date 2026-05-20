import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs = [
  { name: 'index', label: 'Discover', icon: '◈', activeIcon: '◈' },
  { name: 'create', label: 'Create', icon: '+', activeIcon: '+' },
  { name: 'history', label: 'Library', icon: '⊞', activeIcon: '⊞' },
  { name: 'profile', label: 'Profile', icon: '◉', activeIcon: '◉' },
];

function TabButton({
  label,
  icon,
  isFocused,
  onPress,
  isCreate = false,
}: {
  label: string;
  icon: string;
  isFocused: boolean;
  onPress: () => void;
  isCreate?: boolean;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 200 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }, 100);
    await Haptics.selectionAsync();
    onPress();
  };

  if (isCreate) {
    return (
      <Pressable onPress={handlePress} style={styles.createButtonWrapper}>
        <Animated.View style={[styles.createButton, animStyle]}>
          <Text style={styles.createIcon}>{icon}</Text>
        </Animated.View>
        <Text style={styles.createLabel}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, animStyle]}>
        <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
          <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
            {icon}
          </Text>
        </View>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => {
        return (
          <View
            style={[
              styles.tabBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            {state.routes.map((route, index) => {
              const tab = tabs[index];
              if (!tab) return null;
              const isFocused = state.index === index;
              const isCreate = route.name === 'create';

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TabButton
                  key={route.key}
                  label={tab.label}
                  icon={tab.icon}
                  isFocused={isFocused}
                  onPress={onPress}
                  isCreate={isCreate}
                />
              );
            })}
          </View>
        );
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryDim,
  },
  tabIcon: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  tabIconActive: {
    color: Colors.primary,
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  createButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    marginTop: -20,
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  createIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 34,
  },
  createLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
