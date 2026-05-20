import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import type { Balance } from '../../types';

interface CreditsDisplayProps {
  balance: Balance | null;
  compact?: boolean;
}

export function CreditsDisplay({ balance, compact = false }: CreditsDisplayProps) {
  if (compact) {
    return (
      <View style={styles.compact}>
        <Text style={styles.compactIcon}>⚡</Text>
        <Text style={styles.compactText}>
          {balance?.credits?.toFixed(0) ?? '—'}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(124, 58, 237, 0.2)', 'rgba(6, 182, 212, 0.1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Credits Balance</Text>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{balance?.plan ?? 'Free'}</Text>
        </View>
      </View>
      <Text style={styles.credits}>
        {balance?.credits?.toLocaleString() ?? '—'}
      </Text>
      <Text style={styles.creditsLabel}>credits remaining</Text>
      {balance?.renewalDate && (
        <Text style={styles.renewal}>
          Renews {new Date(balance.renewalDate).toLocaleDateString()}
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planBadge: {
    backgroundColor: Colors.primaryDim,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  planText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  credits: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  creditsLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  renewal: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactIcon: {
    fontSize: 13,
  },
  compactText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
