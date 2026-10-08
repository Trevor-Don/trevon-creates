import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../store/AppContext';
import { MessageSquare, ArrowUpRight, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { addLead, settings } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'Web/App Build',
    description: '',
    budgetRange: '$10,000 - $25,000',
    timeline: '1 - 2 months',
    honeypot: '', // Spam bot honeypot
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<{
    leadId: string;
    waUrl: string;
    waText: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Check honeypot to reject spam bots silently
    if (formData.honeypot) {
      console.warn('Honeypot triggered, discarding spam lead');
      onClose();
      return;
    }

    if (!formData.name || !formData.email || !formData.description) {
      setFormError('Please complete all required fields.');
      return;
    }

    // Persist lead
    const newLead = await addLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      projectType: formData.projectType,
      description: formData.description,
      budgetRange: formData.budgetRange,
      timeline: formData.timeline,
      notes: 'Submitted via public portfolio intake form.',
    });

    // Formulate WhatsApp pre-filled text
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const waSummary =
      `Hello Trevor! I just submitted an inquiry on Trevon Creates:\n\n` +
      `👤 Name: ${formData.name}\n` +
      `📧 Email: ${formData.email}\n` +
      `📱 Phone: ${formData.phone}\n` +
      `🛠️ Project: ${formData.projectType}\n` +
      `💰 Budget: ${formData.budgetRange}\n` +
      `⏱️ Timeline: ${formData.timeline}\n\n` +
      `📝 Brief: ${formData.description}`;

    const encoded = encodeURI(waSummary);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;

    setSubmittedLead({
      leadId: newLead.id,
      waUrl,
      waText: waSummary,
    });
  };

  const handleCopy = () => {
    if (submittedLead) {
      navigator.clipboard.writeText(submittedLead.waText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSubmittedLead(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      projectType: 'Web/App Build',
      description: '',
      budgetRange: '$10,000 - $25,000',
      timeline: '1 - 2 months',
      honeypot: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={submittedLead ? 'Inquiry Received • Direct Concierge' : 'Start a Project • Client Inquiry Form'}
      subtitle={
        submittedLead
          ? 'Your inquiry is stored in the studio pipeline. Connect on WhatsApp below for direct consultation.'
          : 'Production-grade software engineering and intentional UI/UX design. Work directly with Trevor.'
      }
      maxWidth="max-w-xl"
    >
      {submittedLead ? (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00FF00] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-heading font-semibold text-white text-sm">
                Inquiry Successfully Logged
              </h4>
              <p className="text-xs text-neutral-300 mt-1">
                Your lead record has been assigned ID{' '}
                <span className="font-mono text-[#00FF00] font-bold">
                  {submittedLead.leadId}
                </span>{' '}
                in Studio Mission Control.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Prepared WhatsApp Transmission:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[#00FF00] flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </label>
            <div className="p-3 bg-black border border-white/10 rounded font-mono text-xs text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {submittedLead.waText}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={submittedLead.waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-center text-sm shadow-[0_0_20px_rgba(0,255,0,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Launch WhatsApp Chat</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              onClick={handleReset}
              className="py-3 px-4 rounded border border-white/20 hover:border-white/40 text-neutral-300 text-sm font-mono transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              [ERROR]: {formError}
            </div>
          )}
          {/* Honeypot hidden input */}
          <input
            type="text"
            name="website_url_honey"
            value={formData.honeypot}
            onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amina Odhiambo"
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="amina@retailos.africa"
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                WhatsApp / Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254 700 000 000"
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                Project Type
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              >
                <option value="Web/App Build">Web/App Build (Full-Stack Next.js)</option>
                <option value="Point-of-Sale (POS) & Offline Sync">Point-of-Sale (POS) & Offline Sync</option>
                <option value="Systems Architecture RFC">Systems Architecture RFC & Data Design</option>
                <option value="FinTech & M-Pesa Integration">FinTech & M-Pesa Automated Reconciliation</option>
                <option value="Client Portal Infrastructure">Client Portal & Onboarding Automation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                Budget Range
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              >
                <option value="$5,000 - $10,000">$5,000 - $10,000 USD</option>
                <option value="$10,000 - $25,000">$10,000 - $25,000 USD</option>
                <option value="$25,000 - $50,000">$25,000 - $50,000 USD</option>
                <option value="$50,000+">$50,000+ USD (Enterprise Architecture)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                Desired Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              >
                <option value="2 - 4 weeks">2 - 4 weeks (Rapid Sprint)</option>
                <option value="1 - 2 months">1 - 2 months (Standard 6-Stage Delivery)</option>
                <option value="2 - 3 months">2 - 3 months (Comprehensive Platform)</option>
                <option value="Flexible">Flexible / Ongoing Advisory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
              Project Description & Requirements *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline your application goals, target scale, integration requirements, and current blockers..."
              className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Transmit Inquiry & Generate WhatsApp Handoff</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-neutral-500 font-mono text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF00]" />
              Zero spam policy. Saved directly to Studio CRM + instant WhatsApp chat link.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
