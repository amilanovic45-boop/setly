'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useGenerations, useDeleteGeneration } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import GenerationCard from '@/components/ui/GenerationCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import type { GenerationType } from '@/types';

type Filter = 'all' | GenerationType;

export default function HistoryPage() {
  const { generations } = useAppStore();
  const { isLoading } = useGenerations();
  const { mutate: del } = useDeleteGeneration();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() =>
    generations.filter((g) => {
      const matchSearch = !search.trim() || g.prompt.toLowerCase().includes(search.toLowerCase());
      const matchType = filter === 'all' || g.type === filter;
      return matchSearch && matchType;
    }),
    [generations, search, filter],
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Library</h1>
          <p className="text-sm text-text-secondary mt-0.5">{generations.length} total generations</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
          <span className="text-text-muted">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by prompt…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-text-muted hover:text-text-primary text-xs">✕</button>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'image', 'video'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                filter === f
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-card text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-3">
              <SkeletonLoader height={i % 3 === 0 ? 280 : 200} className="rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <span className="text-5xl mb-4">{search ? '🔍' : '📭'}</span>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {search ? 'No results' : 'Nothing here yet'}
          </h2>
          <p className="text-text-secondary max-w-xs">
            {search ? `No generations match "${search}"` : 'Create your first image or video to see it here.'}
          </p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {filtered.map((gen, i) => (
            <motion.div
              key={gen.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="mb-3 break-inside-avoid group relative"
            >
              <GenerationCard generation={gen} />
              <button
                onClick={() => {
                  if (confirm('Delete this generation?')) {
                    del(gen.id);
                    toast.success('Deleted');
                  }
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
