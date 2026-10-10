import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { BrandLogo } from './common/BrandLogo';
import { Terminal, Shield, ArrowUpRight, Code2, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { detectVisitorRegion, SUPPORTED_CURRENCIES } from '../utils/currency';

interface HeaderProps {
  onOpenContact: () => void;
  activePublicTab: string;
  setActivePublicTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenContact,
  activePublicTab,
  setActivePublicTab,
}) => {
  const { surface, navigateTo, theme, toggleTheme, landingConfig } = useApp();
  const [currency, setCurrency] = useState('KES');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [detectedRegion, setDetectedRegion] = useState({ flag: '🇰🇪', regionName: 'Kenya' });

  useEffect(() => {
    const detected = detectVisitorRegion();
    setDetectedRegion({ flag: detected.flag, regionName: detected.regionName });
    const saved = localStorage.getItem('trevon_visitor_currency');
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      setCurrency(saved);
    } else {
      setCurrency(detected.currencyCode);
    }

    const handleStorageChange = () => {
      const cur = localStorage.getItem('trevon_visitor_currency');
      if (cur && SUPPORTED_CURRENCIES[cur]) setCurrency(cur);
    };
    window.addEventListener('trevon_currency_changed', handleStorageChange);
    return () => window.removeEventListener('trevon_currency_changed', handleStorageChange);
  }, []);

  const handleSelectCurrency = (code: string) => {
    setCurrency(code);
    localStorage.setItem('trevon_visitor_currency', code);
    window.dispatchEvent(new Event('trevon_currency_changed'));
    setShowCurrencyDropdown(false);
  };

  const currentCurrencyInfo = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.KES;

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo Lockup */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setActivePublicTab('home');
              navigateTo('/');
            }}
            className="flex items-center text-left group cursor-pointer"
          >
            <BrandLogo size="md" showText={true} />
          </button>

          {/* Public Navigation */}
          {surface === 'public' && (
            <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => {
                  setActivePublicTab('home');
                  navigateTo('/');
                }}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activePublicTab === 'home'
                    ? 'text-[#00FF00] bg-white/5 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setActivePublicTab('work');
                  navigateTo('/work');
                }}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activePublicTab === 'work'
                    ? 'text-[#00FF00] bg-white/5 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Work &amp; Case Studies
              </button>
              <button
                onClick={() => {
                  setActivePublicTab('about');
                  navigateTo('/about');
                }}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activePublicTab === 'about'
                    ? 'text-[#00FF00] bg-white/5 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                About &amp; Qualifications
              </button>
            </nav>
          )}

          {surface === 'client' && (
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#00FF00]">
              <span className="px-2 py-0.5 rounded bg-[#00FF00]/10 border border-[#00FF00]/30 font-semibold">
                Client Portal
              </span>
              <span className="text-neutral-400">Project Workspace</span>
            </div>
          )}

          {surface === 'admin' && (
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#FFAE00]">
              <span className="px-2 py-0.5 rounded bg-[#FFAE00]/10 border border-[#FFAE00]/30 font-semibold">
                Admin Console
              </span>
              <span className="text-neutral-400">Executive Dashboard</span>
            </div>
          )}
        </div>

        {/* Right CTA / Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Background Regional Currency Badge */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              title={`Background Regional Currency: Auto-detected ${currentCurrencyInfo.label} (${currentCurrencyInfo.region})`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono transition-all cursor-pointer group"
            >
              <span className="text-sm leading-none">{currentCurrencyInfo.flag}</span>
              <span className="font-bold text-[#00FF00]">{currentCurrencyInfo.code}</span>
              <span className="text-[10px] text-neutral-400 font-sans hidden md:inline">• Local Pricing</span>
              <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-60 rounded-lg bg-[#080B09] border border-white/15 shadow-2xl z-50 p-1.5 space-y-1">
                <div className="px-2 py-1.5 border-b border-white/10 font-mono">
                  <div className="text-[10px] flex items-center justify-between text-[#00FF00] font-bold">
                    <span>AUTO-DETECTED REGION</span>
                    <span>{detectedRegion.flag} {detectedRegion.regionName}</span>
                  </div>
                  <div className="text-[9px] text-neutral-400 mt-0.5">
                    Pricing converts automatically in the background. Choose another currency to preview:
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleSelectCurrency(c.code)}
                      className={`w-full px-2.5 py-1.5 rounded text-left flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                        currency === c.code
                          ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/30'
                          : 'text-neutral-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm leading-none">{c.flag}</span>
                        <span>{c.code}</span>
                        <span className="text-[10px] text-neutral-400 font-sans">({c.symbol.trim()})</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 truncate max-w-[80px]">{c.region}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Warm Tan Mode' : 'Switch to Cyber Dark Mode'}
            className="p-1.5 rounded-[4px] border border-white/20 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FFAE00]" />
            ) : (
              <Moon className="w-4 h-4 text-[#00FF00]" />
            )}
          </button>

          {surface === 'public' ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-[11px]">
                <img
                  src={landingConfig?.founderPhotoUrl || '/trevor-portrait.jpg'}
                  alt={landingConfig?.founderName || 'Trevor Don'}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/trevor-photo.jpg';
                  }}
                  className="w-5 h-5 rounded-full object-cover object-top border border-[#00FF00]"
                />
                <span className="text-neutral-300">{landingConfig?.founderName || 'Trevor Don'}</span>
              </div>
              <button
                onClick={onOpenContact}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#00FF00] hover:bg-white text-black font-heading font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_20px_rgba(0,255,0,0.6)] transition-all cursor-pointer"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : surface === 'client' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('/')}
                className="px-3 py-1.5 rounded-[4px] border border-white/20 hover:border-white/40 text-xs font-mono text-neutral-300 hover:text-white cursor-pointer transition-all"
              >
                Exit to Studio
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('/')}
                className="px-3 py-1.5 rounded-[4px] border border-white/20 hover:border-white/40 text-xs font-mono text-neutral-300 hover:text-white cursor-pointer transition-all"
              >
                Exit to Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
