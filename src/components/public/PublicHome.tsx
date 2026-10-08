import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { PortfolioItem } from '../../types';
import { Badge } from '../common/Badge';
import { CaseStudyModal } from './CaseStudyModal';
import {
  Terminal,
  ArrowUpRight,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Globe,
  Quote,
  MessageSquare,
  Palette,
  Layout,
  Smartphone,
} from 'lucide-react';

interface PublicHomeProps {
  onOpenContact: () => void;
  onExploreWork: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onOpenContact, onExploreWork }) => {
  const { portfolio, testimonials, switchUser, landingConfig } = useApp();
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<PortfolioItem | null>(null);

  // Compute featured work from landingConfig selection if specified, else featured or published items
  const featuredWork = React.useMemo(() => {
    if (landingConfig?.featuredProjectIds && landingConfig.featuredProjectIds.length > 0) {
      const selected = landingConfig.featuredProjectIds
        .map((id) => portfolio.find((p) => p.id === id))
        .filter(Boolean) as PortfolioItem[];
      if (selected.length > 0) return selected;
    }
    const feat = portfolio.filter((p) => p.featured);
    return (feat.length > 0 ? feat : portfolio.filter((p) => p.published)).slice(0, 3);
  }, [portfolio, landingConfig]);

  return (
    <div className="space-y-24 pb-16">
      {/* 1. HERO SECTION WITH PROMINENT FOUNDER PORTRAIT */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Subtle grid background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#00FF00_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Availability Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#080B09] border border-white/15 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-ping" />
                <span className="font-mono text-xs text-neutral-300">
                  {landingConfig?.availabilityBadge || 'AVAILABLE FOR NEW PROJECTS'}
                </span>
                <span className="text-neutral-600 hidden sm:inline">•</span>
                <span className="font-mono text-[11px] text-[#00FF00] font-semibold hidden sm:inline">
                  {landingConfig?.locationBadge || 'NAIROBI & GLOBAL REMOTE'}
                </span>
              </div>

              {/* Display Headline */}
              <div className="space-y-3">
                <div className="inline-block px-3 py-1 rounded bg-[#00FF00]/10 border border-[#00FF00]/30 font-mono text-xs text-[#00FF00] tracking-wider uppercase font-semibold">
                  {landingConfig?.headlinePre || 'CRAFTING BESPOKE DIGITAL PLATFORMS FROM CONCEPT TO CODE'}
                </div>
                <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                  {landingConfig?.headlineMain || 'DIGITAL VISIONS INTO'} <br />
                  <span
                    style={{ color: '#000000' }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF00] via-[#8aff8a] to-[#00FF00]"
                  >
                    {landingConfig?.headlineHighlight || 'SLEEK, FUNCTIONAL'}
                  </span>{' '}
                  REALITIES
                </h1>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans max-w-2xl">
                  {landingConfig?.subheadline ||
                    'End-to-end UI/UX product design and systems engineering for high-conversion web apps, offline-first operating platforms, and automated client mission control.'}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-400">
                  <span className="text-[#00FF00]">CORE VALUES:</span>
                  {(landingConfig?.coreValues || ['Purposeful Design', 'Clean Execution', 'Agile Innovation', 'Digital Mastery']).map(
                    (val, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span>{val}</span>
                        {idx < arr.length - 1 && <span>•</span>}
                      </React.Fragment>
                    )
                  )}
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenContact}
                  className="px-6 py-3 rounded-[4px] bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs tracking-wide shadow-[0_0_24px_rgba(0,255,0,0.4)] hover:shadow-[0_0_32px_rgba(0,255,0,0.7)] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onExploreWork}
                  className="px-5 py-3 rounded-[4px] bg-[#080B09] hover:bg-white/10 border border-white/20 text-neutral-200 font-mono text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-[#00FF00]" />
                  <span>Explore Case Studies</span>
                </button>

                <a
                  href={`https://wa.me/${(landingConfig?.whatsappNumber || '+254142993925').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-[4px] bg-[#00FF00]/10 hover:bg-[#00FF00]/20 border border-[#00FF00]/30 font-mono text-xs text-[#00FF00] flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp ({landingConfig?.whatsappNumber || '+254142993925'})</span>
                </a>
              </div>

              {/* Architecture Stack Signals */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#080B09] border border-white/5">
                  <span className="text-[#00FF00]">#</span> Next.js 14 App Router
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#080B09] border border-white/5">
                  <span className="text-[#00FF00]">#</span> Figma Tokens to Code
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#080B09] border border-white/5">
                  <span className="text-[#00FF00]">#</span> Google Cloud Run
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#080B09] border border-white/5">
                  <span className="text-[#00FF00]">#</span> M-Pesa API Rails
                </span>
              </div>
            </div>

            {/* Right Column: Prominent Founder & Architect Portrait Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] rounded-2xl overflow-hidden bg-[#080B09] border-2 border-[#00FF00]/40 shadow-[0_0_35px_rgba(0,255,0,0.18)] group">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src="/trevor-portrait.jpg"
                    alt={`${landingConfig?.founderName || 'Trevor Don'} — ${landingConfig?.founderRole || 'Systems Architect & Senior UI/UX Designer'}`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/trevor-photo.jpg';
                    }}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3">
                    <Badge label="STUDIO FOUNDER" variant="green" />
                  </div>

                  <div className="absolute top-3 right-3 font-mono text-[10px] bg-black/80 px-2 py-0.5 rounded border border-[#00FF00]/30 text-[#00FF00]">
                    ● ACTIVE
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-lg text-white tracking-tight">
                        {landingConfig?.founderName || 'TREVOR DON'}
                      </span>
                      <span className="font-mono text-[11px] text-[#00FF00] font-semibold bg-black/90 px-2 py-0.5 rounded border border-[#00FF00]/30">
                        {landingConfig?.locationBadge || 'NAIROBI • REMOTE'}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-neutral-300">
                      {landingConfig?.founderRole || 'Lead Systems Architect & Senior UI/UX Designer'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black/80 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">STATUS:</span>
                  <span className="text-[#00FF00] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00] animate-pulse" />
                    Accepting New Clients
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROVEN IMPACT & TRACK RECORD */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 relative overflow-hidden group hover:border-[#00FF00]/40 transition-colors">
            <div className="font-mono text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span>DELIVERED SYSTEMS</span>
              <span className="text-[#00FF00]">[PROD]</span>
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
              18+
            </div>
            <p className="text-xs text-neutral-400 mt-2 font-sans">
              Full-lifecycle engineering projects shipped with zero regressions.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 relative overflow-hidden group hover:border-[#00FF00]/40 transition-colors">
            <div className="font-mono text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span>TRANSACTION VOLUME</span>
              <span className="text-[#FFAE00]">[$14M+]</span>
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
              $14M+
            </div>
            <p className="text-xs text-neutral-400 mt-2 font-sans">
              Processed across digital commerce storefronts &amp; automated M-Pesa flows.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 relative overflow-hidden group hover:border-[#00FF00]/40 transition-colors">
            <div className="font-mono text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span>ON-TIME DELIVERY</span>
              <span className="text-[#00FF00]">[100%]</span>
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
              100%
            </div>
            <p className="text-xs text-neutral-400 mt-2 font-sans">
              Structured sprint milestones and transparent client progress tracking.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 relative overflow-hidden group hover:border-[#00FF00]/40 transition-colors">
            <div className="font-mono text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span>CLIENT RETENTION</span>
              <span className="text-[#00FF00]">[92%]</span>
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
              92%
            </div>
            <p className="text-xs text-neutral-400 mt-2 font-sans">
              Long-term technical partnership across scale-ups and enterprises.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICE CAPABILITIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1">
              TECHNICAL CAPABILITIES &amp; ENGINEERING ARCHITECTURE
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Engineering Disciplines
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-400 max-w-sm">
            Tailored technical delivery from RFC formulation to production container rollouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF00]">
                <Cpu className="w-5 h-5" />
              </div>
              <Badge label="CORE CAPABILITY" variant="green" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">
              High-Concurrency Architecture & Cloud Run
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              Designing containerized systems that auto-scale to zero. Low memory footprints, stateless microservices, idempotent message processing, and strict multi-tenant isolation.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Docker</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Cloud Run</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Cloudflare DNS</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Zero-Scale</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[#FFAE00]">
                <Database className="w-5 h-5" />
              </div>
              <Badge label="OFFLINE-FIRST" variant="orange" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">
              Point-of-Sale (POS) & Edge Delta Sync
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              Offline-tolerant systems designed for volatile power and network grids. Bidirectional delta synchronization, vector clock conflict resolution, and hardware printer bridges.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">SQLite Edge</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Vector Clocks</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">ESC/POS Thermal</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">PostgreSQL</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <Badge label="FULL STACK" variant="cyan" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">
              Full-Stack Web & Dedicated Client Portals
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              Bespoke customer onboarding engines, contract e-signing, automated milestone billing, and stage-by-stage task handoffs engineered to replace email chaos.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Next.js 14</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Tailwind CSS</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Client Portals</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Magic Link Auth</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-lg bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF00]">
                <Zap className="w-5 h-5" />
              </div>
              <Badge label="INTEGRATION" variant="green" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">
              FinTech & Automated Reconciliation
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              M-Pesa Daraja STK Push callbacks, Paystack webhooks, and real-time ledger accounting. Idempotent webhook queues with zero dropped transactions.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">M-Pesa STK</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Paystack</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Webhook Queues</span>
              <span className="px-2 py-0.5 rounded bg-black border border-white/5">Audit Trails</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SELECTED WORK & CASE STUDIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1">
              FEATURED CLIENT WORK &amp; CASE STUDIES
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Selected Work &amp; Case Studies
            </h2>
          </div>
          <button
            onClick={onExploreWork}
            className="text-xs font-mono text-[#00FF00] hover:underline flex items-center gap-1"
          >
            <span>View All Case Studies &amp; Projects</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredWork.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-[#080B09] border border-white/10 overflow-hidden hover:border-[#00FF00]/40 transition-all flex flex-col group"
            >
              {/* Cover thumbnail */}
              {item.coverImage && (
                <div className="h-44 relative overflow-hidden bg-black">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge label={item.client} variant="green" />
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-[#00FF00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Primary Metric Readout */}
                <div className="p-3 rounded bg-black/60 border border-white/5 flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-400">{item.metrics[0]?.label || 'Metric'}</span>
                  <span className="text-[#00FF00] font-bold">{item.metrics[0]?.value || '100%'}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCaseStudy(item)}
                    className="flex-1 py-2 px-3 rounded bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Inspect RFC</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  {item.liveUrl && (
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded bg-[#00FF00]/10 hover:bg-[#00FF00] border border-[#00FF00]/30 text-[#00FF00] hover:text-black font-mono text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Open live app"
                    >
                      <span>Live App</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DEDICATED UI/UX DESIGN & PROFESSIONAL QUALIFICATIONS SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-xl bg-[#080B09] border border-white/10 p-6 sm:p-10 relative overflow-hidden space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-white/10 pb-8">
            {/* Trevor Photo Column */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#00FF00]/50 shadow-[0_0_30px_rgba(0,255,0,0.18)] group">
                <img
                  src="/trevor-portrait.jpg"
                  alt="Trevor Don — Systems Architect & Senior UI/UX Designer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/trevor-photo.jpg';
                  }}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Badge label="STUDIO FOUNDER" variant="green" />
                  <span className="font-mono text-[11px] text-[#00FF00] font-bold bg-black/90 px-2 py-0.5 rounded border border-[#00FF00]/30">
                    {landingConfig?.founderName || 'TREVOR DON'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{landingConfig?.founderRole ? landingConfig.founderRole.toUpperCase() : 'LEAD SOFTWARE ENGINEER & UI/UX DESIGNER'}</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  Design Qualifications &amp; Human-Centric Craft
                </h2>
              </div>

              <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
                {landingConfig?.founderBio ||
                  'I operate at the intersection of empathetic product design and production-grade software engineering. Every interface is created without generic templates: tailored typographic scales, mobile-first cashier and seller ergonomics, thin-client API integrations, and resilient offline state machines.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded bg-black/60 border border-white/5 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">EXPERIENCE</span>
                  <span className="text-white font-bold text-sm">
                    {landingConfig?.founderExperienceYears || '5+ Years'}
                  </span>
                  <span className="text-[#00FF00] block text-[10px]">Product &amp; Systems</span>
                </div>

                <div className="p-3 rounded bg-black/60 border border-white/5 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">DAILY ACTIONS</span>
                  <span className="text-[#00FF00] font-bold text-sm">
                    {landingConfig?.founderDailyActions || '50,000+'}
                  </span>
                  <span className="text-neutral-400 block text-[10px]">Retail &amp; Ops Touches</span>
                </div>

                <div className="p-3 rounded bg-black/60 border border-white/5 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">ACCESSIBILITY</span>
                  <span className="text-white font-bold text-sm">WCAG 2.1 AA</span>
                  <span className="text-[#00FF00] block text-[10px]">High-Contrast Read</span>
                </div>

                <div className="p-3 rounded bg-black/60 border border-white/5 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">HANDOFF LOSS</span>
                  <span className="text-[#00FF00] font-bold text-sm">0.0% DRIFT</span>
                  <span className="text-neutral-400 block text-[10px]">Figma-to-Code Parity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Qualifications Matrix */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#00FF00]" />
              <span>Core Design Competencies &amp; Methodologies</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-lg bg-black/70 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#00FF00] font-bold uppercase tracking-wider">
                    01. Design Systems &amp; Tokens
                  </span>
                  <Layout className="w-4 h-4 text-[#00FF00]" />
                </div>
                <h4 className="font-heading text-sm font-bold text-white">
                  Tokenized Component Architecture
                </h4>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Deep expertise in Figma Auto-Layout 5.0, design variables, and W3C token formats synchronized directly into Tailwind CSS classes. Eliminates developer ambiguity and ensures complete visual consistency across multiple surfaces.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-black/70 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#FFAE00] font-bold uppercase tracking-wider">
                    02. Cognitive Usability &amp; Ergonomics
                  </span>
                  <Smartphone className="w-4 h-4 text-[#FFAE00]" />
                </div>
                <h4 className="font-heading text-sm font-bold text-white">
                  Frontline &amp; Mobile-First Ergonomics
                </h4>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Engineering user flows for real humans in high-speed, noisy settings: cash registers (Kipao), event stall dispatchers (Shift), and mobile shoppers (Nyana Hills). Thumb-zone hit targets, reduced click depths, and sub-second task completion.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-black/70 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                    03. Interaction Design &amp; Motion
                  </span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="font-heading text-sm font-bold text-white">
                  Purposeful Micro-Interactions
                </h4>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Optimistic UI updates, instant tactile visual feedback on button taps, smooth modal animations, and zero Cumulative Layout Shift (CLS &lt; 0.01). Every state transition communicates system health with clarity.
                </p>
              </div>
            </div>

            {/* Verifiable Design Credentials Bar */}
            <div className="p-4 rounded-lg bg-black/90 border border-[#00FF00]/30 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#00FF00] font-bold">VERIFIABLE TRACK RECORD:</span>
                <span>Shift (Enterprise Scheduling)</span>
                <span>•</span>
                <span>M-Duka (Retail OS)</span>
                <span>•</span>
                <span>Nyana Hills Enterprises (Storefront)</span>
              </div>

              <button
                onClick={onOpenContact}
                className="px-4 py-2 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,0,0.3)] cursor-pointer"
              >
                <span>Hire Trevor for UI/UX &amp; Engineering</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE 6-STAGE WORKFLOW ENGINE (Visualized from PROJECT_SPEC.md) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border border-white/10 rounded-xl bg-[#080B09] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1">
                TRANSPARENT CLIENT DELIVERY WORKFLOW
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">
                The 6-Stage Delivery Pipeline
              </h2>
            </div>
            <div className="font-mono text-xs text-neutral-400">
              STRUCTURED MILESTONES • PREDICTABLE TIMELINES
            </div>
          </div>

          <p className="text-sm text-neutral-300 max-w-2xl font-sans leading-relaxed">
            Eliminating client uncertainty and email back-and-forth. Every project runs through a verified state machine where completed tasks trigger automatic milestone advancement and client notifications.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {[
              { num: '01', title: 'Onboarding', sub: 'MSA & Discovery' },
              { num: '02', title: 'Discovery', sub: 'Topology & RFC' },
              { num: '03', title: 'Design', sub: 'Interactive Prototype' },
              { num: '04', title: 'Build', sub: 'Staging & Delta Sync' },
              { num: '05', title: 'Delivery', sub: 'Cloudflare Cutover' },
              { num: '06', title: 'Closing', sub: 'Hypercare Warranty' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded bg-black/60 border border-white/10 flex flex-col justify-between hover:border-[#00FF00]/40 transition-colors"
              >
                <div className="font-mono text-xs text-[#00FF00] font-bold">
                  {'{' + step.num + '}'}
                </div>
                <div className="pt-4">
                  <h4 className="font-heading text-xs sm:text-sm font-semibold text-white">
                    {step.title}
                  </h4>
                  <p className="font-mono text-[10px] text-neutral-400 mt-0.5">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF00]" />
              Automatic Client Task Generation
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF00]" />
              In-App Digital Signature Binding
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF00]" />
              Automated M-Pesa / Paystack Invoicing
            </span>
          </div>
        </div>
      </section>

      {/* 6. FOUNDER TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1">
              CLIENT TESTIMONIALS &amp; ENDORSEMENTS
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Client Founders on Trevor&apos;s Delivery
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-[#080B09] border border-white/10 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <Quote className="w-6 h-6 text-[#00FF00]/40" />
                <p className="text-xs text-neutral-300 leading-relaxed font-sans italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                {t.avatar && (
                  <img
                    src={t.avatar}
                    alt={t.clientName}
                    className="w-9 h-9 rounded-full object-cover border border-[#00FF00]/40"
                  />
                )}
                <div>
                  <h4 className="font-heading text-xs font-bold text-white">{t.clientName}</h4>
                  <p className="font-mono text-[10px] text-neutral-400">{t.roleCompany}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINAL TERMINAL CTA PANEL */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#080B09] border border-[#00FF00]/30 shadow-[0_0_30px_rgba(0,255,0,0.1)] p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/40 mx-auto flex items-center justify-center text-[#00FF00]">
            <Terminal className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Ready to engineer your next high-scale system?
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto font-sans">
              Transmit your requirements. Receive a structured architecture RFC and immediate WhatsApp handoff within minutes.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenContact}
              className="px-8 py-3.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-sm shadow-[0_0_24px_rgba(0,255,0,0.5)] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Transmit Project Inquiry</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreWork}
              className="px-6 py-3.5 rounded bg-black border border-white/20 hover:border-white/40 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Explore Verified RFCs &gt;
            </button>
          </div>
        </div>
      </section>

      {/* Case Study Modal */}
      <CaseStudyModal
        item={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />
    </div>
  );
};
