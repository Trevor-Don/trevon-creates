import React from 'react';
import { useApp } from '../../store/AppContext';
import { Modal } from './Modal';
import { Terminal, Shield, Globe, FileCode2, UserCheck, ArrowRight, CornerDownLeft } from 'lucide-react';

interface DirectorySwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectorySwitcher: React.FC<DirectorySwitcherProps> = ({ isOpen, onClose }) => {
  const { currentPath, navigateTo, switchUser, currentUser } = useApp();

  const directories = [
    {
      path: '/',
      label: '/overview',
      title: 'Studio Overview & Public Portfolio',
      desc: 'Hero section, engineering philosophy, telemetry indicators, service matrix, and inquiry intake.',
      icon: Globe,
      badge: 'PUBLIC',
      badgeColor: 'border-white/20 text-neutral-300',
    },
    {
      path: '/work',
      label: '/work',
      title: 'Verified Production Architectures',
      desc: 'Case studies catalog (Shift, M-Duka, and Nyana Hills Storefront).',
      icon: FileCode2,
      badge: 'PUBLIC',
      badgeColor: 'border-white/20 text-neutral-300',
    },
    {
      path: '/about',
      label: '/about',
      title: 'Systems Architect Dossier',
      desc: 'Trevor Don biography, core engineering values, tech stack, and systems methodology.',
      icon: UserCheck,
      badge: 'PUBLIC',
      badgeColor: 'border-white/20 text-neutral-300',
    },
    {
      path: '/portal',
      label: '/portal',
      title: 'Client Project Workspace',
      desc: 'Authenticated portal: project stage tracker, task checklists, deliverables, invoices, and contracts.',
      icon: Terminal,
      badge: 'CLIENT',
      badgeColor: 'border-[#00FF00]/40 text-[#00FF00] bg-[#00FF00]/10',
    },
    {
      path: '/admin',
      label: '/admin',
      title: 'Studio Mission Control',
      desc: 'Admin dashboard: lead intake pipeline, client onboarding wizard, project stages, templates, and settings.',
      icon: Shield,
      badge: 'ADMIN',
      badgeColor: 'border-[#FFAE00]/40 text-[#FFAE00] bg-[#FFAE00]/10',
    },
  ];

  const handleSelect = (path: string) => {
    if (path === '/portal') {
      switchUser('client');
    } else if (path === '/admin') {
      switchUser('admin');
    }
    navigateTo(path);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SYSTEM DIRECTORY SWITCHER"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-2 border-b border-white/10">
          <span>SELECT DESTINATION DIRECTORY</span>
          <span>CURRENT: <span className="text-[#00FF00] font-semibold">{currentPath}</span></span>
        </div>

        <div className="space-y-2">
          {directories.map((dir, idx) => {
            const Icon = dir.icon;
            const isCurrent =
              dir.path === '/'
                ? currentPath === '/' || currentPath === '/overview'
                : currentPath.startsWith(dir.path);

            return (
              <button
                key={dir.path}
                onClick={() => handleSelect(dir.path)}
                className={`w-full p-3.5 rounded-lg border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-white/10 border-[#00FF00]/60 shadow-[0_0_15px_rgba(0,255,0,0.15)]'
                    : 'bg-[#080B09] border-white/10 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded border mt-0.5 ${
                    isCurrent
                      ? 'bg-[#00FF00]/20 border-[#00FF00]/50 text-[#00FF00]'
                      : 'bg-black border-white/10 text-neutral-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-heading tracking-wide">
                        {dir.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${dir.badgeColor}`}>
                        {dir.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-[#00FF00] font-semibold">
                          [ACTIVE]
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-300 font-sans">
                      {dir.title}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                      {dir.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-neutral-500 text-[11px] shrink-0 pt-1">
                  <span>Go</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Trevon Creates Studio • Role-gated directory topology</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/10 text-neutral-300 font-mono text-[10px]">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
