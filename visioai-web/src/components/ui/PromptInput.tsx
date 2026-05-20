'use client';

import { useRef, useEffect } from 'react';
import clsx from 'clsx';

const MAX_CHARS = 1500;

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number;
}

export default function PromptInput({
  value,
  onChange,
  placeholder = 'Describe what you want to create...',
  disabled = false,
  className,
  minHeight,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = MAX_CHARS - value.length;
  const isNearLimit = remaining < 100;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [value]);

  return (
    <div
      className={clsx(
        'relative rounded-xl border bg-surface transition-all duration-200',
        'focus-within:border-primary focus-within:shadow-glow-sm',
        disabled ? 'border-border opacity-50' : 'border-border',
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        style={minHeight ? { minHeight } : undefined}
        className={clsx(
          'w-full bg-transparent text-text-primary placeholder-text-muted resize-none',
          'px-4 pt-3 pb-2 text-sm leading-relaxed rounded-xl',
          'focus:outline-none',
          disabled ? 'cursor-not-allowed' : 'cursor-text',
        )}
      />
      <div className="flex items-center justify-end px-4 pb-2">
        <span
          className={clsx('text-xs font-mono', isNearLimit ? 'text-warning' : 'text-text-muted')}
        >
          {value.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
