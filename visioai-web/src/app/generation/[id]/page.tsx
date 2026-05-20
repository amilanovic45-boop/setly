'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';
import { useDeleteGeneration } from '@/lib/hooks';
import ProgressRing from '@/components/ui/ProgressRing';

export default function GenerationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { generations } = useAppStore();
  const { mutate: del } = useDeleteGeneration();
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [looping, setLooping] = useState(true);

  const gen = generations.find((g) => g.id === id);

  if (!gen) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 text-center gap-4">
        <span className="text-5xl">🔍</span>
        <h2 className="text-xl font-bold text-text-primary">Not found</h2>
        <Link href="/" className="text-primary hover:underline text-sm">← Back home</Link>
      </div>
    );
  }

  if (gen.status === 'processing' || gen.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-6 text-center">
        <ProgressRing size={72} indeterminate />
        <div>
          <p className="text-xl font-bold text-text-primary">
            {gen.type === 'video' ? 'Creating video…' : 'Generating image…'}
          </p>
          <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">{gen.prompt.slice(0, 80)}</p>
        </div>
        <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">← Back</Link>
      </div>
    );
  }

  if (gen.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4 text-center">
        <span className="text-5xl">❌</span>
        <p className="text-xl font-bold text-text-primary">Generation Failed</p>
        <p className="text-sm text-text-secondary">{gen.errorMessage ?? 'Unknown error'}</p>
        <Link href="/" className="text-primary hover:underline text-sm">← Back home</Link>
      </div>
    );
  }

  const mediaUrl = gen.mediaUrls[activeIdx] ?? gen.mediaUrls[0];

  const handleDownload = () => {
    if (!mediaUrl) return;
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = `visioai-${gen.id}.${gen.type === 'video' ? 'mp4' : 'jpg'}`;
    a.target = '_blank';
    a.click();
    toast.success('Download started');
  };

  const handleShare = async () => {
    if (navigator.share && mediaUrl) {
      try {
        await navigator.share({ title: 'VisioAI Generation', text: gen.prompt, url: mediaUrl });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(mediaUrl ?? '');
      toast.success('URL copied to clipboard');
    }
  };

  const handleDelete = () => {
    if (!confirm('Delete this generation? This cannot be undone.')) return;
    del(gen.id);
    router.push('/');
    toast.success('Deleted');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border text-text-secondary hover:text-text-primary transition-colors">
          ←
        </Link>
        <div className="flex-1">
          <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
            gen.type === 'video' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
          }`}>
            {gen.type === 'video' ? '▶ Video' : '◼ Image'}
          </span>
        </div>
        <button onClick={handleDelete} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-colors text-sm">
          🗑
        </button>
      </div>

      {/* Media */}
      <div className="rounded-2xl overflow-hidden border border-border bg-surface mb-4">
        {gen.type === 'video' && mediaUrl ? (
          <video
            key={mediaUrl}
            src={mediaUrl}
            controls
            loop={looping}
            autoPlay
            className="w-full max-h-[60vh] object-contain"
          />
        ) : mediaUrl ? (
          <div className="relative w-full">
            <Image
              src={mediaUrl}
              alt={gen.prompt.slice(0, 60)}
              width={1200}
              height={1200}
              className="w-full h-auto max-h-[70vh] object-contain"
              unoptimized
            />
          </div>
        ) : null}
      </div>

      {/* Thumbnails for multi-image */}
      {gen.mediaUrls.length > 1 && (
        <div className="flex gap-2 mb-4">
          {gen.mediaUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                i === activeIdx ? 'border-primary' : 'border-border'
              }`}
            >
              <Image src={url} alt={`${i + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        {[
          { icon: '⬇', label: 'Download', onClick: handleDownload },
          { icon: '↗', label: 'Share', onClick: handleShare },
          {
            icon: '🔄',
            label: 'Remake',
            onClick: () => router.push(gen.type === 'video' ? '/studio/video' : '/studio/image'),
          },
          ...(gen.type === 'video' ? [{
            icon: looping ? '∞' : '→',
            label: looping ? 'Loop: On' : 'Loop: Off',
            onClick: () => setLooping(!looping),
          }] : []),
        ].map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={action.onClick}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors"
          >
            <span className="text-lg">{action.icon}</span>
            <span className="text-xs text-text-secondary font-semibold">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Metadata */}
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-text-secondary mb-2">Prompt</p>
          <p className="bg-card border border-border rounded-2xl px-4 py-3.5 text-sm text-text-primary leading-relaxed">
            {gen.prompt}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Model', value: gen.model.replace(/_/g, ' ') },
            { label: 'Ratio', value: gen.aspectRatio },
            { label: 'Type', value: gen.type },
            { label: 'Created', value: new Date(gen.createdAt).toLocaleDateString() },
          ].map((m) => (
            <div key={m.label} className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-1">{m.label}</p>
              <p className="text-sm font-semibold text-text-primary capitalize">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
