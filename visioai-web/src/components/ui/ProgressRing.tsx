'use client';

import { useEffect, useRef } from 'react';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  indeterminate?: boolean;
  color?: string;
  trackColor?: string;
  className?: string;
}

export default function ProgressRing({
  size = 48,
  strokeWidth = 4,
  progress = 0,
  indeterminate = false,
  color = '#7C3AED',
  trackColor = '#2A2A38',
  className,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    if (!indeterminate) {
      const offset = circumference - (progress / 100) * circumference;
      circle.style.strokeDashoffset = `${offset}`;
    }
  }, [progress, circumference, indeterminate]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        ref={circleRef}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={indeterminate ? circumference * 0.25 : circumference}
        style={
          indeterminate
            ? {
                animation: 'spin 1s linear infinite',
                transformOrigin: 'center',
                transformBox: 'fill-box',
              }
            : {
                transition: 'stroke-dashoffset 0.3s ease-in-out',
              }
        }
      />
    </svg>
  );
}
