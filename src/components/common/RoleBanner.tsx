import React from 'react';
import { useApp } from '../../store/AppContext';
import { Shield, User, Globe, RotateCcw, Sun, Moon, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export const RoleBanner: React.FC = () => {
  const {
    surface,
    setSurface,
    currentUser,
    switchUser,
    resetToDefaults,
    theme,
    toggleTheme,
    firebaseUser,
    signInWithGoogle,
    firebaseSignOut,
    firestoreConnected,
  } = useApp();

  return (
    <div className="bg-[#0B0E0C] border-b border-white/10 px-4 py-2 text-xs font-mono transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Current Active Surface & Telemetry */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00FF00] animate-pulse"></span>
            <span className="text-neutral-500">WORKSPACE:</span>
            <span className="text-white font-semibold uppercase tracking-wider">{surface}</span>
          </span>
          <span className="text-neutral-700">|</span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <span className="text-neutral-500">IDENTITY:</span>
            <span className="text-[#00FF00] font-medium">{currentUser.name}</span>
            <span className="text-neutral-500">({currentUser.role})</span>
          </span>
          <span className="text-neutral-700 hidden sm:inline">|</span>
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#00FF00]">
            <CheckCircle2 className="w-3 h-3" />
            <span>FIRESTORE: {firestoreConnected ? 'LIVE' : 'ACTIVE'}</span>
          </span>
        </div>

        {/* Right: Quick Surface & Identity Switcher + Theme + Google Auth */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Warm Tan Mode' : 'Switch to Cyber Dark Mode'}
            className="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 border border-white/20 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer font-semibold"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-[#FFAE00]" />
                <span>Warm Tan</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-[#00FF00]" />
                <span>Cyber Dark</span>
              </>
            )}
          </button>

          {/* Google Auth Status / Action */}
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
              <span className="text-[11px] text-neutral-400 hidden md:inline truncate max-w-[120px]">
                {firebaseUser.email}
              </span>
              <button
                onClick={firebaseSignOut}
                title="Sign out of Firebase"
                className="px-2 py-0.5 rounded text-[10px] bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 flex items-center gap-1 transition-all"
              >
                <LogOut className="w-2.5 h-2.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 border border-[#00FF00]/40 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] font-medium transition-all cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Google Sign-in</span>
            </button>
          )}

          <span className="text-neutral-700 hidden lg:inline">|</span>

          {/* Quick role presets */}
          <button
            onClick={() => setSurface('public')}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border transition-all ${
              surface === 'public'
                ? 'bg-white/10 border-white/40 text-white shadow-sm'
                : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white hover:border-white/20'
            }`}
          >
            <Globe className="w-3 h-3 text-[#00FF00]" />
            Studio
          </button>

          <button
            onClick={() => switchUser('client', 'amina@kipaoretail.com')}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border transition-all ${
              surface === 'client' && currentUser.email === 'amina@kipaoretail.com'
                ? 'bg-[#00FF00]/15 border-[#00FF00]/50 text-[#00FF00]'
                : 'bg-black/40 border-white/5 text-neutral-400 hover:text-[#00FF00] hover:border-[#00FF00]/30'
            }`}
          >
            <User className="w-3 h-3" />
            Client
          </button>

          <button
            onClick={() => switchUser('admin')}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border transition-all ${
              surface === 'admin'
                ? 'bg-[#FFAE00]/15 border-[#FFAE00]/50 text-[#FFAE00]'
                : 'bg-black/40 border-white/5 text-neutral-400 hover:text-[#FFAE00] hover:border-[#FFAE00]/30'
            }`}
          >
            <Shield className="w-3 h-3 text-[#FFAE00]" />
            Admin
          </button>

          <button
            onClick={() => resetToDefaults()}
            title="Reset data store to original seeds"
            className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors ml-1"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
