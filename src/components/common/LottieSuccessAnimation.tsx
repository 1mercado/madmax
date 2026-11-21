import React, { useState } from 'react';
import { motion } from 'motion/react';

interface LottieSuccessAnimationProps {
  size?: number;
  variant?: 'transfer' | 'payment' | 'incoming' | 'reward';
  className?: string;
}

const PARTICLES = [
  { angle: 0, distance: 46, size: 5, color: '#00f5a0', delay: 0.22, shape: 'diamond' },
  { angle: 45, distance: 52, size: 4, color: '#00e5ff', delay: 0.26, shape: 'circle' },
  { angle: 90, distance: 44, size: 5, color: '#88f953', delay: 0.2, shape: 'diamond' },
  { angle: 135, distance: 50, size: 4, color: '#00f5a0', delay: 0.28, shape: 'circle' },
  { angle: 180, distance: 46, size: 5, color: '#00e5ff', delay: 0.24, shape: 'diamond' },
  { angle: 225, distance: 52, size: 4, color: '#88f953', delay: 0.3, shape: 'circle' },
  { angle: 270, distance: 44, size: 5, color: '#00f5a0', delay: 0.21, shape: 'diamond' },
  { angle: 315, distance: 50, size: 4, color: '#00e5ff', delay: 0.27, shape: 'circle' },
];

export const LottieSuccessAnimation: React.FC<LottieSuccessAnimationProps> = ({
  size = 88,
  variant = 'transfer',
  className = '',
}) => {
  const [replayKey, setReplayKey] = useState(0);

  const primaryColor =
    variant === 'incoming'
      ? '#00f5a0'
      : variant === 'reward'
      ? '#ffb300'
      : '#00e5ff';

  const secondaryColor =
    variant === 'reward' ? '#00f5a0' : '#88f953';

  return (
    <div
      key={replayKey}
      onClick={() => setReplayKey((prev) => prev + 1)}
      title="Tap to replay animation"
      className={`relative mx-auto flex items-center justify-center select-none cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle Expanding Ripple Ring 1 */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0.75 }}
        animate={{ scale: 1.55, opacity: 0 }}
        transition={{
          duration: 1.15,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.12,
        }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `2px solid ${primaryColor}`,
        }}
      />

      {/* Subtle Expanding Ripple Ring 2 */}
      <motion.div
        initial={{ scale: 0.65, opacity: 0.5 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{
          duration: 1.35,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.28,
        }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `1.5px dashed ${secondaryColor}`,
        }}
      />

      {/* Ambient Soft Glow Aura */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.85, 1.12, 1], opacity: [0, 0.55, 0.35] }}
        transition={{
          duration: 0.9,
          ease: 'easeOut',
        }}
        className="absolute inset-1 rounded-full blur-md pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 60%, transparent 100%)`,
        }}
      />

      {/* Radial Burst Particles (Lottie-style vector micro-burst) */}
      {PARTICLES.map((p, idx) => {
        const rad = (p.angle * Math.PI) / 180;
        const targetX = Math.cos(rad) * (p.distance * (size / 88));
        const targetY = Math.sin(rad) * (p.distance * (size / 88));

        return (
          <motion.span
            key={idx}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{
              x: [0, targetX * 0.85, targetX],
              y: [0, targetY * 0.85, targetY],
              scale: [0, 1.25, 0],
              opacity: [0, 1, 0],
              rotate: [0, 45, 90],
            }}
            transition={{
              duration: 0.75,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '9999px' : '1.5px',
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        );
      })}

      {/* Main Lottie-Style Vector SVG Canvas */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 overflow-visible"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 18,
        }}
      >
        <defs>
          <linearGradient id="digicashSuccessGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#88f953" />
            <stop offset="50%" stopColor="#00f5a0" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
          <linearGradient id="digicashRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#00f5a0" />
          </linearGradient>
        </defs>

        {/* Outer Rotating Orbital Dash Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#digicashRingGrad)"
          strokeWidth="1.75"
          strokeDasharray="6 6"
          strokeLinecap="round"
          initial={{ opacity: 0, rotate: -60 }}
          animate={{ opacity: 0.55, rotate: 60 }}
          transition={{
            duration: 1.4,
            ease: 'easeOut',
            delay: 0.1,
          }}
          style={{ transformOrigin: '50% 50%' }}
        />

        {/* Progressive Stroke-Draw Outer Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#digicashRingGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{
            duration: 0.55,
            ease: [0.33, 1, 0.68, 1],
            delay: 0.05,
          }}
          style={{ transformOrigin: '50% 50%', rotate: '-90deg' }}
        />

        {/* Core Glowing Gradient Disc */}
        <motion.circle
          cx="50"
          cy="50"
          r="33"
          fill="url(#digicashSuccessGrad)"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.08, 1] }}
          transition={{
            duration: 0.48,
            times: [0, 0.7, 1],
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.1,
          }}
          style={{ transformOrigin: '50% 50%' }}
        />

        {/* Subtle Inner Highlight Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="29"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        />

        {/* Animated Vector Checkmark Path (Lottie trim-path style) */}
        <motion.path
          d="M35.5 51.5 L45.2 61.2 L65.5 39.5"
          fill="none"
          stroke="#012420"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              delay: 0.26,
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: {
              delay: 0.26,
              duration: 0.08,
            },
          }}
        />
      </motion.svg>
    </div>
  );
};
