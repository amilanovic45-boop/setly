'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

export default function GradientButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  fullWidth = false,
}: GradientButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      className={clsx(
        'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none',
        {
          'text-sm px-4 py-2': size === 'sm',
          'text-sm px-5 py-2.5': size === 'md',
          'text-base px-7 py-3.5': size === 'lg',
          'w-full': fullWidth,
          'bg-gradient-to-r from-primary to-violet-700 text-white shadow-glow-sm hover:shadow-glow-primary':
            variant === 'primary',
          'bg-transparent border border-primary text-primary hover:bg-primary/10':
            variant === 'outline',
          'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5':
            variant === 'ghost',
          'opacity-50 cursor-not-allowed': isDisabled,
          'cursor-pointer': !isDisabled,
        },
        className,
      )}
    >
      {loading && (
        <span className="mr-2 inline-block">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </span>
      )}
      {children}
    </motion.button>
  );
}
