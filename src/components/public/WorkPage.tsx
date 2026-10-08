import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { PortfolioItem } from '../../types';
import { Badge } from '../common/Badge';
import { CaseStudyModal } from './CaseStudyModal';
import { ArrowUpRight, Cpu, Layers } from 'lucide-react';

export const WorkPage: React.FC<{ onOpenContact: () => void }> = ({ onOpenContact }) => {
  const { portfolio } = useApp();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [activeTag, setActiveTag] = useState<string>('ALL');

  const allTags = ['ALL', 'Next.js (App Router)', 'Installable PWA', 'Offline-First POS', 'Thin-Client Architecture', 'Google Cloud Run', 'Paystack'];

  const filteredItems = portfolio.filter((item) => {
    if (activeTag === 'ALL') return true;
    return item.tags.includes(activeTag);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <div className="font-mono text-xs text-[#00FF00] uppercase tracking-wider">
          {'// CASE STUDIES & SYSTEMS RFC CATALOG'}
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight">
          Verified Production Architectures
        </h1>
        <p className="text-base text-neutral-400 max-w-2xl font-sans">
          Deep-dive analyses into distributed transaction ledgers, offline-first Point-of-Sale engines, and high-concurrency cloud systems.
        </p>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 pt-4">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-[4px] font-mono text-xs transition-all ${
                activeTag === tag
                  ? 'bg-[#00FF00] text-black font-semibold'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Case Studies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-[#080B09] border border-white/10 hover:border-[#00FF00]/40 transition-all flex flex-col overflow-hidden group"
          >
            {item.coverImage && (
              <div className="h-60 relative overflow-hidden bg-black">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge label={item.client} variant="green" />
                </div>
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white group-hover:text-[#00FF00] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Metrics Matrix */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-black/60 rounded border border-white/5">
                {item.metrics.slice(0, 2).map((m, idx) => (
                  <div key={idx} className="font-mono text-xs">
                    <span className="text-neutral-500 block">{m.label}</span>
                    <span className="text-[#00FF00] font-bold text-sm">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-neutral-400"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 py-2.5 px-4 rounded bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white border border-white/10 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Technical RFC</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded bg-[#00FF00]/10 hover:bg-[#00FF00] border border-[#00FF00]/30 hover:border-[#00FF00] text-[#00FF00] hover:text-black font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Launch live project"
                  >
                    <span>Launch Live</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CaseStudyModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};
