import React from 'react';
import { Modal } from '../common/Modal';
import { PortfolioItem } from '../../types';
import { Badge } from '../common/Badge';
import { ArrowUpRight, Cpu, Layers, CheckCircle } from 'lucide-react';

interface CaseStudyModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={`Case Study • ${item.title}`}
      subtitle={`Client: ${item.client} • Production Architecture`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Cover / Visual Banner */}
        {item.coverImage && (
          <div className="relative h-56 rounded-lg overflow-hidden border border-white/10 group">
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Badge label="VERIFIED PRODUCTION DEPLOYMENT" variant="green" />
              {item.liveUrl && (
                <a
                  href={item.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-[#00FF00] hover:text-black bg-black/80 hover:bg-[#00FF00] px-3 py-1 rounded border border-[#00FF00]/40 flex items-center gap-1.5 transition-all cursor-pointer font-semibold shadow-sm"
                >
                  <span>Launch Live System</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics Bar */}
        <div>
          <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="text-[#00FF00]">{'•'}</span> Benchmark Performance & Key Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {item.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-black/60 border border-white/10 flex flex-col justify-center"
              >
                <span className="text-xs text-neutral-400 font-mono">{m.label}</span>
                <span className="font-heading text-lg font-bold text-[#00FF00] tracking-tight mt-0.5">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative & Body */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <span className="text-[#FFAE00]">{'•'}</span> Technical Architecture & Engineering Solution
          </h4>
          <p className="text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
            {item.body}
          </p>
        </div>

        {/* Architecture Bullet Points */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00FF00]" /> Systems Topology Highlights
          </h4>
          <div className="space-y-2">
            {item.architecturePoints.map((pt, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-[#0B0E0C] border border-[#1A211D] flex items-start gap-2.5 text-xs text-neutral-300"
              >
                <CheckCircle className="w-4 h-4 text-[#00FF00] shrink-0 mt-0.5" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div>
          <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-neutral-400" /> Technology Foundation
          </h4>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-[4px] bg-white/5 border border-white/10 text-xs font-mono text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
          >
            Close RFC View
          </button>
        </div>
      </div>
    </Modal>
  );
};
