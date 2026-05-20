'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ModelInfo } from '@/types';

const MODEL_EMOJIS: Record<string, string> = {
  soul_2: '✨',
  nano_banana_pro: '🎨',
  ms_image: '📢',
  seedance_2_0: '🎬',
  kling3_0: '🎥',
  marketing_studio_video: '📱',
};

interface ModelCardProps {
  model: ModelInfo;
  selected: boolean;
  onSelect: (model: ModelInfo) => void;
}

export default function ModelCard({ model, selected, onSelect }: ModelCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(model)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'relative text-left w-full rounded-2xl p-4 transition-all duration-200 cursor-pointer',
        'bg-card border',
        selected
          ? 'border-primary shadow-glow-sm'
          : 'border-border hover:border-primary/40',
      )}
    >
      {selected && (
        <motion.div
          layoutId="model-glow"
          className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none"
          initial={false}
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl',
            selected ? 'bg-primary/20' : 'bg-surface',
          )}
        >
          {MODEL_EMOJIS[model.id] ?? '🤖'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-text-primary text-sm">{model.name}</span>
            {selected && (
              <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                Selected
              </span>
            )}
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-2">{model.description}</p>
          <span className="inline-block bg-surface border border-border text-text-muted text-xs px-2 py-0.5 rounded-md">
            Best for: {model.bestFor}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
