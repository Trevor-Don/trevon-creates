import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { PortfolioItem } from '../../types';
import { Badge } from '../common/Badge';
import { CaseStudyModal } from './CaseStudyModal';
import { detectVisitorRegion, SUPPORTED_CURRENCIES, formatRegionalPrice } from '../../utils/currency';
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
  Star,
  DollarSign,
  Package,
  Check,
  MapPin,
} from 'lucide-react';

interface PublicHomeProps {
  onOpenContact: (packageId?: string) => void;
  onExploreWork: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onOpenContact, onExploreWork }) => {
  const { portfolio, testimonials, switchUser, landingConfig, services, pricingPackages, reviews, settings } = useApp();
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<PortfolioItem | null>(null);

  // Regional currency state
  const [visitorCurrency, setVisitorCurrency] = useState('KES');
  const [detectedRegion, setDetectedRegion] = useState({ flag: '🇰🇪', regionName: 'Kenya & East Africa' });

  useEffect(() => {
    const detected = detectVisitorRegion();
    setDetectedRegion({ flag: detected.flag, regionName: detected.regionName });
    const saved = localStorage.getItem('trevon_visitor_currency');
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      setVisitorCurrency(saved);
    } else {
      setVisitorCurrency(detected.currencyCode);
    }

    const handleCurrencyChange = () => {
      const cur = localStorage.getItem('trevon_visitor_currency');
      if (cur && SUPPORTED_CURRENCIES[cur]) {
        setVisitorCurrency(cur);
      }
    };
    window.addEventListener('trevon_currency_changed', handleCurrencyChange);
    return () => window.removeEventListener('trevon_currency_changed', handleCurrencyChange);
  }, []);

  const handleSelectCurrency = (code: string) => {
    setVisitorCurrency(code);
    localStorage.setItem('trevon_visitor_currency', code);
    window.dispatchEvent(new Event('trevon_currency_changed'));
  };

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
                    style={{ color: '#00a310' }}
                    className="font-bold"
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
                  onClick={() => onOpenContact()}
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
                    src={landingConfig?.founderPhotoUrl || '/trevor-portrait.jpg'}
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
          {(services && services.filter((s) => s.active).length > 0
            ? services.filter((s) => s.active)
            : [
                {
                  id: 's1',
                  title: 'High-Concurrency Architecture & Cloud Run',
                  description:
                    'Designing containerized systems that auto-scale to zero. Low memory footprints, stateless microservices, idempotent message processing, and strict multi-tenant isolation.',
                  tagline: 'Google Cloud Run containers scaling from 0 with automated Cloudflare routing',
                  deliverables: ['Docker Container', 'Cloud Run', 'Cloudflare DNS', 'Zero-Scale Setup'],
                  icon: 'Cpu',
                  popular: true,
                  startingPriceKES: 200000,
                  startingPriceUSD: 1500,
                  timeline: '2 - 4 Weeks',
                },
                {
                  id: 's2',
                  title: 'Point-of-Sale (POS) & Edge Delta Sync',
                  description:
                    'Offline-tolerant systems designed for volatile power and network grids. Bidirectional delta synchronization, vector clock conflict resolution, and hardware printer bridges.',
                  tagline: 'Offline-First registers with SQLite sync and M-Pesa STK billing',
                  deliverables: ['SQLite Edge', 'Vector Clocks', 'ESC/POS Thermal', 'PostgreSQL Backend'],
                  icon: 'Database',
                  popular: false,
                  startingPriceKES: 450000,
                  startingPriceUSD: 3200,
                  timeline: '6 - 8 Weeks',
                },
                {
                  id: 's3',
                  title: 'Full-Stack Web & Dedicated Client Portals',
                  description:
                    'Bespoke customer onboarding engines, contract e-signing, automated milestone billing, and stage-by-stage task handoffs engineered to replace email chaos.',
                  tagline: 'Type-safe web platforms with instant page loads and zero bloat',
                  deliverables: ['TypeScript Strict Codebase', 'Client Portal', 'Next.js 14', 'Magic Link Auth'],
                  icon: 'Layers',
                  popular: true,
                  startingPriceKES: 350000,
                  startingPriceUSD: 2500,
                  timeline: '4 - 6 Weeks',
                },
                {
                  id: 's4',
                  title: 'FinTech & Automated Reconciliation',
                  description:
                    'M-Pesa Daraja STK Push callbacks, Paystack webhooks, and real-time ledger accounting. Idempotent webhook queues with zero dropped transactions.',
                  tagline: 'Unbreakable payment webhooks and audit trail ledgers',
                  deliverables: ['M-Pesa STK', 'Paystack', 'Webhook Queues', 'Audit Trails'],
                  icon: 'Zap',
                  popular: false,
                  startingPriceKES: 250000,
                  startingPriceUSD: 1800,
                  timeline: '3 - 4 Weeks',
                },
              ]
          ).map((s) => (
            <div
              key={s.id}
              className="p-6 rounded-lg bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF00]">
                  {s.icon === 'Layout' && <Layout className="w-5 h-5" />}
                  {s.icon === 'Database' && <Database className="w-5 h-5 text-[#FFAE00]" />}
                  {s.icon === 'Zap' && <Zap className="w-5 h-5" />}
                  {s.icon === 'Cpu' && <Cpu className="w-5 h-5" />}
                  {s.icon === 'Smartphone' && <Smartphone className="w-5 h-5" />}
                  {!['Layout', 'Database', 'Zap', 'Cpu', 'Smartphone'].includes(s.icon) && (
                    <Layers className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                {s.popular && <Badge label="CORE CAPABILITY" variant="green" />}
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">{s.title}</h3>
                {s.tagline && (
                  <p className="font-sans text-xs text-[#00FF00] mt-0.5">{s.tagline}</p>
                )}
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">
                {s.description}
              </p>
              {s.deliverables && s.deliverables.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                  {s.deliverables.map((del, dIdx) => (
                    <span key={dIdx} className="px-2 py-0.5 rounded bg-black border border-white/5">
                      {del}
                    </span>
                  ))}
                </div>
              )}
              {s.startingPriceKES && (
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">
                    From <span className="text-[#00FF00] font-bold">{formatRegionalPrice(s.startingPriceKES, visitorCurrency, { priceUSD: s.startingPriceUSD, includeCode: true })}</span>
                  </span>
                  <span className="text-[#FFAE00]">{s.timeline}</span>
                </div>
              )}
            </div>
          ))}
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
                  src={landingConfig?.founderPhotoUrl || '/trevor-portrait.jpg'}
                  alt={`${landingConfig?.founderName || 'Trevor Don'} — ${landingConfig?.founderRole || 'Systems Architect & Senior UI/UX Designer'}`}
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
                  Engineering user flows for real humans in high-speed, noisy settings: offline registers (M-Duka), event stall dispatchers (Shift), and mobile shoppers (Nyana Hills). Thumb-zone hit targets, reduced click depths, and sub-second task completion.
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
                onClick={() => onOpenContact()}
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

      {/* 5b. FIXED-SCOPE SPRINT PACKAGES & PRICING */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1">
              FIXED-PRICE INVESTMENT &amp; DELIVERY SPRINTS
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Transparent Pricing Packages
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-400 max-w-sm">
            Predictable scope, zero hidden billable hours, and milestone-backed engineering deliverables.
          </p>
        </div>

        {/* Regional Currency Engine Bar */}
        <div className="p-4 rounded-xl bg-[#080B09] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="text-base">{detectedRegion.flag}</span>
            <span className="text-neutral-400">Regional Currency:</span>
            <span className="text-[#00FF00] font-bold">{SUPPORTED_CURRENCIES[visitorCurrency]?.label || visitorCurrency}</span>
            <span className="text-neutral-500 hidden sm:inline">• Detected from your location ({detectedRegion.regionName})</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] text-neutral-500 mr-1">Switch:</span>
            {['KES', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((code) => {
              const curInfo = SUPPORTED_CURRENCIES[code];
              const isSelected = visitorCurrency === code;
              return (
                <button
                  key={code}
                  onClick={() => handleSelectCurrency(code)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#00FF00] text-black font-bold shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{curInfo.flag}</span>
                  <span>{code}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(pricingPackages && pricingPackages.filter((p) => p.active).length > 0
            ? pricingPackages.filter((p) => p.active)
            : []
          ).map((pkg) => (
            <div
              key={pkg.id}
              className={`p-6 rounded-xl bg-[#080B09] border flex flex-col justify-between transition-all space-y-6 ${
                pkg.highlight
                  ? 'border-[#00FF00]/50 shadow-[0_0_25px_rgba(0,255,0,0.12)] ring-1 ring-[#00FF00]/30'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {pkg.badge && (
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider ${
                        pkg.highlight
                          ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40'
                          : 'bg-[#FFAE00]/15 text-[#FFAE00] border border-[#FFAE00]/30'
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-neutral-400">
                    {pkg.deliveryTime}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-neutral-300 font-sans mt-1 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-black border border-white/10 space-y-1">
                  <div className="font-mono text-2xl font-bold text-[#00FF00]">
                    {formatRegionalPrice(pkg.priceKES, visitorCurrency, { priceUSD: pkg.priceUSD, includeCode: true })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    {visitorCurrency !== 'KES' ? (
                      <span>Studio Base: KES {pkg.priceKES?.toLocaleString()}</span>
                    ) : (
                      <span>${pkg.priceUSD?.toLocaleString()} USD equivalent</span>
                    )}
                    <span className="text-neutral-500">• {pkg.billingPeriod}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    WHAT&apos;S INCLUDED:
                  </div>
                  <ul className="space-y-1.5 font-sans text-xs text-neutral-300">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#00FF00] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <button
                  onClick={() => onOpenContact(pkg.id)}
                  className={`w-full py-2.5 px-4 rounded-lg font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    pkg.highlight
                      ? 'bg-[#00FF00] hover:bg-white text-black shadow-[0_0_15px_rgba(0,255,0,0.4)]'
                      : 'bg-white/10 hover:bg-white text-white hover:text-black border border-white/20'
                  }`}
                >
                  <span>Book This Sprint</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <div className="text-center font-mono text-[10px] text-neutral-500">
                  {pkg.depositRequiredPercent}% Upfront Deposit • Milestone Deliverables
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOUNDER TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider mb-1">
              VERIFIED CLIENT REVIEWS &amp; REPUTATION
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Client Founders on Trevor&apos;s Delivery
            </h2>
          </div>

          {settings.googleBusinessProfileUrl && (
            <a
              href={settings.googleBusinessProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-[#FFAE00] hover:underline flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-[#FFAE00]" />
              <span>Verified Google Business Reviews</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-[#080B09] border border-white/10 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[#FFAE00]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#FFAE00]" />
                    ))}
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 font-mono text-[9px] font-bold">
                    VERIFIED CLIENT
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.clientName}
                    className="w-9 h-9 rounded-full object-cover border border-[#00FF00]/40"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-heading font-bold text-white text-xs">
                    {t.clientName.charAt(0)}
                  </div>
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
              onClick={() => onOpenContact()}
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
