'use client';

import clsx from 'clsx';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  height?: number;
}

function SkeletonItem({ aspectRatio = 'square' }: { aspectRatio?: string }) {
  return (
    <div
      className={clsx(
        'skeleton rounded-2xl mb-4',
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'portrait' && 'aspect-[3/4]',
        aspectRatio === 'landscape' && 'aspect-[4/3]',
      )}
    />
  );
}

export default function SkeletonLoader({
  className,
  count = 6,
  aspectRatio = 'square',
  height,
}: SkeletonLoaderProps) {
  if (height !== undefined) {
    return (
      <div
        className={clsx('skeleton rounded-2xl w-full', className)}
        style={{ height }}
      />
    );
  }
  return (
    <div className={clsx('w-full', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} aspectRatio={aspectRatio} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('rounded-2xl overflow-hidden bg-card border border-border mb-4', className)}>
      <div className="skeleton aspect-square" />
    </div>
  );
}
