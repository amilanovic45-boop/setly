import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🌌</Text>
        <Text style={styles.title}>404 — Lost in Space</Text>
        <Text style={styles.subtitle}>This page doesn't exist in our universe.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Return Home →</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});
