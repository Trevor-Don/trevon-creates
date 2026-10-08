import React from 'react';
import { useApp } from '../../store/AppContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  theme: explicitTheme,
  className = '',
}) => {
  const { theme: appTheme } = useApp();
  const theme = explicitTheme || appTheme;
  const dimensions = {
    sm: { icon: 26, title: 'text-sm', sub: 'text-[11px]' },
    md: { icon: 34, title: 'text-base', sub: 'text-xs' },
    lg: { icon: 46, title: 'text-xl', sub: 'text-sm' },
    xl: { icon: 58, title: 'text-2xl', sub: 'text-base' },
  }[size];

  const strokeColor = theme === 'dark' ? '#FFFFFF' : '#111827';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Trevon Creates Mark (Replicating logo.png) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          width={dimensions.icon}
          height={dimensions.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Main geometric T outline with bracket motif on left */}
          {/* Left code bracket hook: { */}
          <path
            d="M 28 42 C 28 42 22 42 22 46 C 22 50 18 53 15 55 C 18 57 22 60 22 64 C 22 68 28 68 28 68"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top Left Horizontal Cap */}
          <path
            d="M 24 42 C 20 42 18 40 18 36 L 18 30 C 18 24 22 20 28 20 L 46 20"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Diagonal slash bridging top and stem */}
          <path
            d="M 30 52 L 48 34"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Top Right Bar & Right Wing Cap */}
          <path
            d="M 44 20 L 76 20 C 84 20 88 24 88 32 C 88 40 84 44 76 44 L 70 44"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Stem with Rounded Bottom U */}
          <path
            d="M 42 38 L 42 68 C 42 76 46 80 54 80 C 62 80 66 76 66 68 L 66 54"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Orange Circular Signal inside the right notch under the arm */}
          <circle cx="62" cy="38" r="8.5" fill="#D97706" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5 font-heading">
            <span className={`font-black tracking-tight ${textColor} ${dimensions.title}`}>
              TREVON
            </span>
            <span className={`font-medium tracking-normal ${subTextColor} ${dimensions.title}`}>
              CREATES
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
