'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';
import { useGenerations } from '@/lib/hooks';
import { saveApiKey, checkBalance } from '@/lib/api';
import GenerationCard from '@/components/ui/GenerationCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import type { GenerationType } from '@/types';

type Filter = 'all' | GenerationType;

export default function HomePage() {
  const { generations, isOnboarded, setOnboarded, setApiKey, setBalance, apiKey } = useAppStore();
  const { isLoading, refetch } = useGenerations();
  const [filter, setFilter] = useState<Filter>('all');
  const [keyInput, setKeyInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  const filtered = generations.filter((g) =>
    filter === 'all' ? true : g.type === filter,
  );

  const handleConnect = async () => {
    const k = keyInput.trim();
    if (!k) return;
    setConnecting(true);
    try {
      saveApiKey(k);
      setApiKey(k);
      const bal = await checkBalance();
      setBalance(bal);
      setOnboarded(true);
      toast.success(`Connected! ${bal.credits} credits available`);
      refetch();
    } catch {
      setApiKey(null);
      toast.error('Connection failed. Check your API key.');
    } finally {
      setConnecting(false);
    }
  };

  if (!isOnboarded || !apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-violet-700 flex items-center justify-center text-4xl shadow-glow-primary">
              ✦
            </div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-3">VisioAI</h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              AI-powered creative studio. Generate stunning images and cinematic videos.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: '🎨', label: 'Images', desc: 'Soul 2 & more' },
              { icon: '🎬', label: 'Videos', desc: 'Seedance 2.0' },
              { icon: '⚡', label: 'Fast', desc: 'Real-time gen' },
            ].map((f) => (
              <div key={f.label} className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs font-semibold text-text-primary">{f.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* API Key form */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-text-primary mb-4">Connect your Higgsfield account</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-surface rounded-xl border border-border overflow-hidden">
                <input
                  type={show ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  placeholder="hf-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono"
                />
                <button
                  onClick={() => setShow(!show)}
                  className="px-3 text-text-muted hover:text-text-primary transition-colors"
                >
                  {show ? '🙈' : '👁'}
                </button>
              </div>
              <button
                onClick={handleConnect}
                disabled={!keyInput.trim() || connecting}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-primary transition-shadow glow-pulse"
              >
                {connecting ? 'Connecting…' : 'Connect'}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-3 flex items-start gap-2">
              <span>🔒</span>
              Key stored locally in your browser. Never sent to our servers.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Discover</h1>
          <p className="text-sm text-text-secondary mt-0.5">{generations.length} generations</p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          ↺ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'image', 'video'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-card text-text-secondary border border-border hover:text-text-primary'
            }`}
          >
            {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-3 rounded-2xl overflow-hidden">
              <SkeletonLoader height={i % 2 === 0 ? 260 : 180} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <span className="text-5xl mb-4">✨</span>
          <h2 className="text-xl font-bold text-text-primary mb-2">Start Creating</h2>
          <p className="text-text-secondary mb-6 max-w-xs">
            Your generated images and videos will appear here.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/studio/image')}
              className="px-5 py-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-sm font-semibold hover:bg-primary/25 transition-colors"
            >
              🎨 Create Image
            </button>
            <button
              onClick={() => router.push('/studio/video')}
              className="px-5 py-2.5 rounded-xl bg-card text-text-secondary border border-border text-sm font-medium hover:text-text-primary transition-colors"
            >
              🎬 Create Video
            </button>
          </div>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {filtered.map((gen, i) => (
            <motion.div
              key={gen.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="mb-3 break-inside-avoid"
            >
              <GenerationCard generation={gen} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
