import { motion } from 'motion/react';

const INFINITY_PATH =
  "M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className = '' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size }}
      className={className}
    >
      {/* Faint track */}
      <path
        d={INFINITY_PATH}
        stroke="#e6192b"
        strokeOpacity="0.25"
        strokeWidth="1.8"
      />

      {/* Orbiting pass 1 */}
      <motion.path
        d={INFINITY_PATH}
        stroke="#e6192b"
        strokeWidth="2.2"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 0.6, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting pass 2 (offset) */}
      <motion.path
        d={INFINITY_PATH}
        stroke="#e6192b"
        strokeWidth="2.2"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 0.6, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.75 }}
      />
    </svg>
  );
}
