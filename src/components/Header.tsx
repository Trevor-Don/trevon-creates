import React from 'react';
import { useApp } from '../store/AppContext';
import { BrandLogo } from './common/BrandLogo';
import { Terminal, Shield, ArrowUpRight, Code2, Sun, Moon } from 'lucide-react';

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
  const { surface, navigateTo, theme, toggleTheme } = useApp();

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
                  src="/trevor-portrait.jpg"
                  alt="Trevor Don"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/trevor-photo.jpg';
                  }}
                  className="w-5 h-5 rounded-full object-cover object-top border border-[#00FF00]"
                />
                <span className="text-neutral-300">Trevor Don</span>
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
