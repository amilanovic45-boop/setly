import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGenerations, useDeleteGeneration } from '../../lib/hooks/useGenerations';
import { useAppStore } from '../../lib/store';
import { MasonryGrid } from '../../components/home/MasonryGrid';
import { Colors } from '../../constants/colors';
import { GenerationSkeleton } from '../../components/ui/SkeletonLoader';
import type { Generation, GenerationType } from '../../types';

type FilterType = 'all' | GenerationType;

export default function HistoryScreen() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const { generations } = useAppStore();
  const { isLoading, refetch } = useGenerations();
  const { mutate: deleteGen } = useDeleteGeneration();

  const filtered = useMemo(() => {
    return generations.filter(g => {
      const matchesSearch = search.trim() === '' || g.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || g.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [generations, search, typeFilter]);

  const handleLongPress = (gen: Generation) => {
    Alert.alert('Options', gen.prompt.slice(0, 60) + '...', [
      { text: 'View Details', onPress: () => router.push(`/generation/${gen.id}`) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteGen(gen.id),
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.count}>{generations.length} items</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by prompt..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.typeFilters}>
        {(['all', 'image', 'video'] as FilterType[]).map(type => (
          <Pressable
            key={type}
            onPress={() => setTypeFilter(type)}
            style={[styles.typeBtn, typeFilter === type && styles.typeBtnActive]}
          >
            <Text style={[styles.typeBtnText, typeFilter === type && styles.typeBtnTextActive]}>
              {type === 'all' ? 'All' : type === 'image' ? 'Images' : 'Videos'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {isLoading ? (
          <View style={styles.skeletons}>
            {[...Array(4)].map((_, i) => (
              <GenerationSkeleton key={i} width={180} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>
              {search ? '🔍' : '📭'}
            </Text>
            <Text style={styles.emptyTitle}>
              {search ? 'No results found' : 'Nothing here yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `No generations match "${search}"`
                : 'Your generations will appear here after creating them.'}
            </Text>
          </View>
        ) : (
          <MasonryGrid
            generations={filtered}
            onPress={(gen) => router.push(`/generation/${gen.id}`)}
            onLongPress={handleLongPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: 12,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textSecondary,
    padding: 4,
  },
  typeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtnActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
  },
  typeBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  typeBtnTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 32,
  },
  skeletons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});
