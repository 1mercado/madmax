import React from 'react';
import { useDigiCash } from '../../context/DigiCashContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  borderCyan?: boolean;
  borderGold?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  borderCyan = false,
  borderGold = false,
}) => {
  const { theme } = useDigiCash();
  const isLight = theme === 'light';

  let borderColor = isLight ? 'border-slate-300 shadow-md' : 'border-[#00e5ff]/20';
  if (borderCyan) borderColor = isLight ? 'border-[#0284c7] shadow-md' : 'border-[#00e5ff]/60';
  if (borderGold) borderColor = isLight ? 'border-[#d97706] shadow-md' : 'border-[#ffb300]/60';

  const baseBg = isLight ? 'bg-white text-slate-900 border-2' : 'bg-[#0c2240]/80 text-white';
  const hoverBg = isLight ? 'hover:bg-slate-50' : 'hover:bg-[#0f2c52]/90';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl ${baseBg} border ${borderColor} shadow-xl backdrop-blur-md transition-all ${
        onClick ? `cursor-pointer ${hoverBg} active:scale-[0.99]` : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
