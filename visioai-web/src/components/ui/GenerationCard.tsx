'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Download, Play, ImageIcon, VideoIcon } from 'lucide-react';
import clsx from 'clsx';
import type { Generation } from '@/types';

interface GenerationCardProps {
  generation: Generation;
  onClick?: () => void;
}

export default function GenerationCard({ generation, onClick }: GenerationCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isVideo = generation.type === 'video';
  const mediaUrl = generation.thumbnailUrl ?? generation.mediaUrls[0];
  const hasMedia = !!mediaUrl && !imgError;

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const url = generation.mediaUrls[0];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `visioai-${generation.id}.${isVideo ? 'mp4' : 'jpg'}`;
    a.target = '_blank';
    a.click();
  }

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={clsx(
        'relative overflow-hidden rounded-2xl bg-card border border-border',
        'cursor-pointer group',
        'mb-4',
      )}
    >
      <div className="relative aspect-square bg-surface">
        {hasMedia ? (
          <Image
            src={mediaUrl}
            alt={generation.prompt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isVideo ? (
              <VideoIcon className="w-10 h-10 text-text-muted" />
            ) : (
              <ImageIcon className="w-10 h-10 text-text-muted" />
            )}
          </div>
        )}

        {isVideo && hasMedia && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/60 flex flex-col justify-between p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    isVideo
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-primary/20 text-primary border border-primary/30',
                  )}
                >
                  {isVideo ? (
                    <VideoIcon className="w-3 h-3" />
                  ) : (
                    <ImageIcon className="w-3 h-3" />
                  )}
                  {isVideo ? 'Video' : 'Image'}
                </span>

                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
              </div>

              <p className="text-white text-xs leading-relaxed line-clamp-3">{generation.prompt}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
