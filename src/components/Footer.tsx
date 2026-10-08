import React from 'react';
import { useApp } from '../store/AppContext';
import { BrandLogo } from './common/BrandLogo';
import { ArrowUpRight, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenContact: () => void;
  onOpenDirectories?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const { navigateTo, settings } = useApp();
  const whatsappNum = settings.whatsappNumber || '+254142993925';

  return (
    <footer className="bg-[#080B09] border-t border-white/10 text-neutral-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <BrandLogo size="md" showText={true} />
            <p className="text-white text-xs font-semibold italic font-heading tracking-wide">
              &quot;Crafting modern digital experiences from concept to code.&quot;
            </p>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-md font-sans">
              Trevon Creates provides end-to-end UI/UX design and systems development for web applications and mobile platforms, turning digital visions into sleek, functional realities.
            </p>
            <div className="pt-1 text-[11px] text-neutral-400 font-mono">
              <span className="text-[#00FF00]">VALUES:</span> Purposeful Design • Clean Execution • Agile Innovation • Digital Mastery
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white uppercase font-bold text-[11px] tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-neutral-400 font-mono text-xs">
              <li>
                <button
                  onClick={() => navigateTo('/')}
                  className="hover:text-[#00FF00] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#00FF00]">&gt;</span>
                  <span>/overview (Home)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/work')}
                  className="hover:text-[#00FF00] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#00FF00]">&gt;</span>
                  <span>/work (Case Studies)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/about')}
                  className="hover:text-[#00FF00] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#00FF00]">&gt;</span>
                  <span>/about (Architect Profile)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Link & WhatsApp */}
          <div>
            <h4 className="text-white uppercase font-bold text-[11px] tracking-wider mb-3">
              Direct Contact
            </h4>
            <div className="space-y-3">
              <p className="text-neutral-400 text-xs font-sans">
                Inquiries routed directly to WhatsApp:
              </p>
              <a
                href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=Hello%20Trevor,%20I%20am%20interested%20in%20discussing%20a%20new%20project.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#00FF00]/10 border border-[#00FF00]/40 text-[#00FF00] hover:bg-[#00FF00]/20 transition-all font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp: {whatsappNum}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <div className="pt-1">
                <button
                  onClick={onOpenContact}
                  className="inline-flex items-center gap-1 text-xs text-neutral-300 underline underline-offset-4 hover:text-[#00FF00] cursor-pointer"
                >
                  <span>Submit Project Inquiry</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Trevon Creates Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Nairobi, Kenya</span>
            <span>•</span>
            <span>Available for Global Engagements</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

