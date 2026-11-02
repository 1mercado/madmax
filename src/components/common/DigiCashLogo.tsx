import React from 'react';

interface DigiCashLogoProps {
  size?: number;
  showGlow?: boolean;
  className?: string;
}

export const DigiCashLogo: React.FC<DigiCashLogoProps> = ({
  size = 48,
  showGlow = false,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Optional ambient radial glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.45) 0%, rgba(136, 249, 83, 0.2) 50%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="digiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#00F5A0" />
            <stop offset="100%" stopColor="#88F953" />
          </linearGradient>
        </defs>

        {/* 1. Left Speed Bars (3 rounded pills) */}
        {/* Top Bar */}
        <rect x="8" y="28" width="20" height="8" rx="4" fill="url(#digiGradient)" />
        {/* Middle Bar (longer) */}
        <rect x="3" y="46" width="28" height="8" rx="4" fill="url(#digiGradient)" />
        {/* Bottom Bar */}
        <rect x="8" y="64" width="20" height="8" rx="4" fill="url(#digiGradient)" />

        {/* 2. Main "D" Emblem with outer sweep and inner cutout */}
        <path
          d="M 44 18
             L 64 18
             C 86 18, 94 34, 94 50
             C 94 66, 86 82, 64 82
             L 44 82
             Q 38 82, 38 76
             L 38 24
             Q 38 18, 44 18
             Z
             M 55 32
             L 63 32
             C 75 32, 79 40, 79 50
             C 79 60, 75 68, 63 68
             L 55 68
             Q 52 68, 52 65
             L 52 35
             Q 52 32, 55 32
             Z"
          fill="url(#digiGradient)"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};
