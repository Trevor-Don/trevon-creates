import React from 'react';
import { useApp } from '../../store/AppContext';
import { Badge } from '../common/Badge';
import { Cpu, Terminal, Shield, CheckCircle2, ArrowUpRight, Palette, Layout, Smartphone, Layers, Sparkles } from 'lucide-react';

export const AboutPage: React.FC<{ onOpenContact: () => void }> = ({ onOpenContact }) => {
  const { landingConfig } = useApp();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Bio Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-white/10 pb-12">
        <div className="relative">
          <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#00FF00]/40 relative shadow-2xl group">
            <img
              src={landingConfig?.founderPhotoUrl || '/trevor-portrait.jpg'}
              alt={`${landingConfig?.founderName || 'Trevor Don'} — ${landingConfig?.founderRole || 'Systems Architect & UI/UX Designer'}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/trevor-photo.jpg';
              }}
              className="w-full h-full object-cover object-top transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <Badge label="PRINCIPAL ARCHITECT & DESIGNER" variant="green" />
              <span className="font-mono text-[10px] text-neutral-300 bg-black/90 px-2 py-0.5 rounded border border-white/20">
                {landingConfig?.founderName || 'TREVOR DON'}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider">
            FOUNDER PROFILE &amp; LEAD ENGINEER
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {landingConfig?.founderName || 'Trevor Don'} • {landingConfig?.founderRole || 'Lead Software Engineer & UI/UX Designer'}
          </h1>
          <p className="text-sm font-semibold font-heading text-white italic tracking-wide">
            &quot;Crafting modern digital experiences from concept to code.&quot;
          </p>
          <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
            Trevon Creates delivers end-to-end UI/UX design and production systems engineering for websites, web apps, and mobile platforms—turning digital visions into sleek, functional, high-conversion realities.
          </p>
          <p className="text-sm text-neutral-400 font-sans leading-relaxed">
            I specialize in the intersection of thoughtful product design and resilient engineering: building offline-first retail POS operating systems, mobile-first event seller platforms (Shift), thin-client storefronts (Nyana Hills), and frictionless FinTech payment flows.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenContact}
              className="px-5 py-2.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,0,0.3)]"
            >
              <span>Schedule Project Discussion</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED UI/UX DESIGN QUALIFICATIONS SECTION */}
      <div className="space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1">
            DESIGN PHILOSOPHY &amp; LEADERSHIP
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-[#00FF00]" />
            <span>UI/UX Design Competencies &amp; Philosophy</span>
          </h2>
          <p className="text-sm text-neutral-400 max-w-2xl font-sans mt-2 leading-relaxed">
            Intentional, high-craft product design grounded in human ergonomics. No generic templates, no AI slop—every interface is engineered to convert visitors and empower frontline operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-center justify-center text-[#00FF00]">
              <Layout className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-white">
              Zero &quot;AI Slop&quot; Discipline
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Strict rejection of generic gradient blobs, stock icon soup, and placeholder copy. Layouts follow deliberate typographic hierarchy, consistent spatial rhythm, and authentic brand identity tailored to the business.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded bg-[#FFAE00]/10 border border-[#FFAE00]/30 flex items-center justify-center text-[#FFAE00]">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-white">
              Mobile-First Frontline Usability
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Optimized for real people on small screens: retail store cashiers, event stall sellers, and shoppers on mobile networks. Thumb-zone touch targets, rapid checkout ergonomics, and zero layout shift.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-white">
              Design Systems &amp; Tokens
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Figma auto-layout components mapped directly to production Tailwind tokens. Scalable type scales, semantic color roles, dark/light contrast validation, and shared cross-surface design assets.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-center justify-center text-[#00FF00]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-white">
              Exhaustive State-Driven UX
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Every screen specifies thoughtful skeleton loaders, zero-data empty states, offline degraded experiences, network error recoveries, and micro-interactions so users are never left guessing.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded bg-[#FFAE00]/10 border border-[#FFAE00]/30 flex items-center justify-center text-[#FFAE00]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-white">
              Conversion &amp; Commerce Flows
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              High-conversion storefront flows: instant search filtering, slide-over cart drawers, clear price visibility, and single-tap mobile money (M-Pesa / Paystack) payment execution.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-white">
              Design-to-Code Mastery
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Zero communication gap between design and engineering. Prototypes translate directly into clean Next.js/React code, accessible HTML semantics, and responsive CSS with zero fidelity loss.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Values & Aesthetic Matrix from Brand Book */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-[#080B09] border border-[#00FF00]/30 space-y-3">
          <div className="font-mono text-xs text-[#00FF00] font-bold uppercase">
            STUDIO CORE VALUES
          </div>
          <h3 className="font-heading text-lg font-bold text-white">
            &quot;Purposeful Design, Clean Execution, Agile Innovation, Digital Mastery&quot;
          </h3>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Every line of code and interface token is engineered with intentionality, balancing mechanical performance with intuitive human usability.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-[#080B09] border border-[#FFAE00]/30 space-y-3">
          <div className="font-mono text-xs text-[#FFAE00] font-bold uppercase">
            DESIGN STANDARDS &amp; BRAND TONE
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-black border border-white/10 text-neutral-300">Tech-Forward Minimalist</span>
            <span className="px-2.5 py-1 rounded bg-black border border-white/10 text-neutral-300">Cyber Modernism</span>
            <span className="px-2.5 py-1 rounded bg-black border border-white/10 text-neutral-300">Code-Driven Geometric</span>
            <span className="px-2.5 py-1 rounded bg-black border border-white/10 text-neutral-300">Electric Digital</span>
            <span className="px-2.5 py-1 rounded bg-black border border-white/10 text-neutral-300">High-Contrast Utility</span>
          </div>
          <p className="text-xs text-neutral-400 font-sans pt-1">
            Tone: Modern • Confident • Collaborative • Visionary
          </p>
        </div>
      </div>

      {/* Engineering Philosophy */}
      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#00FF00]" />
          <span>Core Architectural Principles</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="font-mono text-xs text-[#00FF00] font-bold">01 • RESILIENCE FIRST</div>
            <h3 className="font-heading text-base font-bold text-white">Assume Network Failure</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Software must operate flawlessly when connectivity drops. Local SQLite / LocalStorage replication and offline state sync ensure zero data loss during cloud disconnections.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="font-mono text-xs text-[#FFAE00] font-bold">02 • SCALE TO ZERO</div>
            <h3 className="font-heading text-base font-bold text-white">Cost-Efficient Compute</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Stateless containers deployed on Google Cloud Run scale automatically from 0 to thousands of concurrent users, preserving capital without sacrificing performance.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 space-y-3">
            <div className="font-mono text-xs text-cyan-400 font-bold">03 • AUTOMATE REPEATABILITY</div>
            <h3 className="font-heading text-base font-bold text-white">Zero Administrative Drag</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Contracts, onboarding checklists, automated M-Pesa STK billing, and stage gating run deterministically so engineering velocity stays uncompromised.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="p-8 rounded-xl bg-[#080B09] border border-white/10 space-y-6">
        <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#00FF00]" />
          <span>Technical Stack Competencies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
          <div className="space-y-2">
            <span className="text-[#00FF00] font-bold uppercase block">Frontend &amp; UI/UX</span>
            <ul className="space-y-1.5 text-neutral-300">
              <li>• Next.js 14 (App Router)</li>
              <li>• React 18 / TypeScript</li>
              <li>• Tailwind CSS &amp; Design Tokens</li>
              <li>• Figma Design Systems</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[#FFAE00] font-bold uppercase block">Data &amp; Storage</span>
            <ul className="space-y-1.5 text-neutral-300">
              <li>• PostgreSQL &amp; Drizzle ORM</li>
              <li>• Firestore &amp; Security Rules</li>
              <li>• LocalStorage / Offline Cache</li>
              <li>• Redis / In-Memory KV</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-cyan-400 font-bold uppercase block">Cloud &amp; Infra</span>
            <ul className="space-y-1.5 text-neutral-300">
              <li>• Google Cloud Run</li>
              <li>• Docker Multi-Stage Alpine</li>
              <li>• Cloudflare DNS &amp; CDN</li>
              <li>• Google Cloud Storage</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[#00FF00] font-bold uppercase block">Integrations</span>
            <ul className="space-y-1.5 text-neutral-300">
              <li>• M-Pesa Daraja STK Push</li>
              <li>• Paystack Payment Gateway</li>
              <li>• Resend Transactional Mail</li>
              <li>• WhatsApp Business API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

