import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'green' | 'orange' | 'cyan' | 'red' | 'gray' | 'neutral';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'green', pulse = false }) => {
  const normalizedVariant = variant === 'neutral' ? 'gray' : variant;
  const styles = {
    green: {
      bg: 'bg-[#00FF00]/10',
      border: 'border-[#00FF00]/30',
      text: 'text-[#00FF00]',
      dot: 'bg-[#00FF00]',
      shadow: 'shadow-[0_0_8px_rgba(0,255,0,0.5)]',
    },
    orange: {
      bg: 'bg-[#FFAE00]/10',
      border: 'border-[#FFAE00]/30',
      text: 'text-[#FFAE00]',
      dot: 'bg-[#FFAE00]',
      shadow: 'shadow-[0_0_8px_rgba(255,174,0,0.5)]',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      dot: 'bg-cyan-400',
      shadow: 'shadow-[0_0_8px_rgba(34,211,238,0.5)]',
    },
    red: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      dot: 'bg-rose-400',
      shadow: 'shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    },
    gray: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      text: 'text-neutral-400',
      dot: 'bg-neutral-500',
      shadow: '',
    },
  }[normalizedVariant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[10px] uppercase font-mono tracking-wider border ${styles.bg} ${styles.border} ${styles.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${styles.shadow} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      {label}
    </span>
  );
};

export const TelemetryTag: React.FC<{ children: React.ReactNode; color?: 'green' | 'orange' | 'white' }> = ({
  children,
  color = 'green',
}) => {
  const textColor = {
    green: 'text-[#00FF00]',
    orange: 'text-[#FFAE00]',
    white: 'text-neutral-300',
  }[color];

  return (
    <span className={`font-mono text-xs tracking-wider ${textColor}`}>
      {children}
    </span>
  );
};
