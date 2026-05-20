import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGenerations, useDeleteGeneration } from '../../lib/hooks/useGenerations';
import { useAppStore } from '../../lib/store';
import { MasonryGrid } from '../../components/home/MasonryGrid';
import { CreditsDisplay } from '../../components/shared/CreditsDisplay';
import { Colors } from '../../constants/colors';
import { GenerationSkeleton } from '../../components/ui/SkeletonLoader';
import type { Generation, GenerationType } from '../../types';

type FilterTab = 'all' | GenerationType;

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { generations, balance } = useAppStore();
  const { isLoading, refetch, isRefetching } = useGenerations();
  const { mutate: deleteGen } = useDeleteGeneration();

  const filtered = generations.filter(g =>
    activeFilter === 'all' ? true : g.type === activeFilter,
  );

  const handlePress = useCallback((gen: Generation) => {
    router.push(`/generation/${gen.id}`);
  }, []);

  const handleLongPress = useCallback((gen: Generation) => {
    Alert.alert(
      'Options',
      gen.prompt.slice(0, 60) + (gen.prompt.length > 60 ? '...' : ''),
      [
        { text: 'View', onPress: () => router.push(`/generation/${gen.id}`) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete generation?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteGen(gen.id) },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, [deleteGen]);

  const FilterButton = ({ label, value }: { label: string; value: FilterTab }) => (
    <Pressable
      onPress={() => setActiveFilter(value)}
      style={[styles.filterButton, activeFilter === value && styles.filterButtonActive]}
    >
      <Text style={[styles.filterText, activeFilter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>VisioAI</Text>
          <Text style={styles.subtitle}>Your Creative Studio</Text>
        </View>
        <CreditsDisplay balance={balance} compact />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.filters}>
          <FilterButton label="All" value="all" />
          <FilterButton label="Images" value="image" />
          <FilterButton label="Videos" value="video" />
        </View>

        {isLoading ? (
          <View style={styles.skeletonGrid}>
            {[...Array(4)].map((_, i) => (
              <GenerationSkeleton key={i} width={180} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => router.push('/(tabs)/create')} />
        ) : (
          <MasonryGrid
            generations={filtered}
            onPress={handlePress}
            onLongPress={handleLongPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={styles.emptyTitle}>Start Creating</Text>
      <Text style={styles.emptySubtitle}>
        Your generated images and videos will appear here.
      </Text>
      <Pressable onPress={onCreate} style={styles.createCTA}>
        <Text style={styles.createCTAText}>Create your first generation →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  createCTA: {
    backgroundColor: Colors.primaryDim,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  createCTAText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
});
