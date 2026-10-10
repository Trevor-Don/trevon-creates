import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../store/AppContext';
import { MessageSquare, ArrowUpRight, CheckCircle2, ShieldCheck, Copy, Check, Sparkles } from 'lucide-react';
import { getBudgetRangesForRegion, formatRegionalPrice, SUPPORTED_CURRENCIES } from '../../utils/currency';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackageId?: string | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, initialPackageId }) => {
  const { addLead, settings, visitorCurrency, pricingPackages, showToast } = useApp();

  const regionalRanges = getBudgetRangesForRegion(visitorCurrency);
  const currencyInfo = SUPPORTED_CURRENCIES[visitorCurrency] || SUPPORTED_CURRENCIES.KES;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'Web/App Build',
    selectedPackage: initialPackageId || '',
    description: '',
    budgetRange: regionalRanges[0]?.value || 'KES 250,000 - 500,000',
    timeline: '1 - 2 months',
    honeypot: '', // Spam bot honeypot
  });

  // Sync initialPackageId if passed when modal opens
  useEffect(() => {
    if (initialPackageId) {
      const pkg = pricingPackages.find((p) => p.id === initialPackageId);
      if (pkg) {
        const regionalPriceFormatted = formatRegionalPrice(pkg.priceKES, visitorCurrency, {
          priceUSD: pkg.priceUSD,
          includeCode: true,
        });
        setFormData((prev) => ({
          ...prev,
          selectedPackage: pkg.id,
          projectType: pkg.name,
          budgetRange: `${regionalPriceFormatted} (Fixed Scope)`,
          timeline: pkg.deliveryTime || '4 - 6 Weeks',
          description: prev.description || `Inquiring about ${pkg.name}: ${pkg.description}`,
        }));
      }
    } else {
      if (regionalRanges.length > 0 && !formData.selectedPackage) {
        setFormData((prev) => ({
          ...prev,
          budgetRange: prev.budgetRange || regionalRanges[0].value,
        }));
      }
    }
  }, [initialPackageId, isOpen, visitorCurrency]);

  const [formError, setFormError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<{
    leadId: string;
    waUrl: string;
    waText: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleSelectPackageQuick = (pkgId: string) => {
    const pkg = pricingPackages.find((p) => p.id === pkgId);
    if (!pkg) return;
    const regionalPriceFormatted = formatRegionalPrice(pkg.priceKES, visitorCurrency, {
      priceUSD: pkg.priceUSD,
      includeCode: true,
    });
    setFormData((prev) => ({
      ...prev,
      selectedPackage: pkg.id,
      projectType: pkg.name,
      budgetRange: `${regionalPriceFormatted} (Fixed Scope)`,
      timeline: pkg.deliveryTime || '4 - 6 Weeks',
      description: prev.description ? prev.description : `Brief for ${pkg.name}: `,
    }));
  };

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

    try {
      // Persist lead to AppContext and Firestore
      const newLead = await addLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        projectType: formData.projectType,
        description: formData.description,
        budgetRange: formData.budgetRange,
        timeline: formData.timeline,
        notes: `Submitted via public portfolio intake form. Regional Currency: ${visitorCurrency}`,
      });

      showToast('success', 'Inquiry Received', "Your project brief is saved to Trevor's mission control.");

      // Formulate WhatsApp pre-filled text with accurate regional budget
      const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
      const waSummary =
        `Hello Trevor! I just submitted a project inquiry on Trevon Creates:\n\n` +
        `👤 Name: ${formData.name}\n` +
        `📧 Email: ${formData.email}\n` +
        `📱 Phone: ${formData.phone || 'N/A'}\n` +
        `🛠️ Project: ${formData.projectType}\n` +
        `💰 Budget: ${formData.budgetRange} (${currencyInfo.flag} ${visitorCurrency})\n` +
        `⏱️ Timeline: ${formData.timeline}\n\n` +
        `📝 Brief: ${formData.description}`;

      const encoded = encodeURI(waSummary);
      const waUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;

      setSubmittedLead({
        leadId: newLead.id,
        waUrl,
        waText: waSummary,
      });
    } catch (err) {
      showToast('error', 'Submission Notice', 'Failed to save inquiry to cloud database. Please connect via WhatsApp directly.');
      setFormError('Failed to save inquiry. Please reach out via WhatsApp directly.');
    }
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
      selectedPackage: '',
      description: '',
      budgetRange: regionalRanges[0]?.value || 'KES 250,000 - 500,000',
      timeline: '1 - 2 months',
      honeypot: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={submittedLead ? 'Inquiry Received • Direct Concierge' : 'Start a Project • Client Intake Form'}
      subtitle={
        submittedLead
          ? "Your inquiry is stored in Trevor's mission control. Connect on WhatsApp below for direct consultation."
          : `Transparent pricing and architectural precision. Currently showing investment figures in ${currencyInfo.label} (${currencyInfo.flag} ${visitorCurrency}).`
      }
      maxWidth="max-w-xl"
    >
      {submittedLead ? (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00FF00] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-heading font-semibold text-white text-sm">
                Inquiry Successfully Logged &amp; Transmitted
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
                className="text-xs text-[#00FF00] flex items-center gap-1 hover:underline cursor-pointer"
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
              className="flex-1 py-3 px-4 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-center text-sm shadow-[0_0_20px_rgba(0,255,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Connect on WhatsApp Now</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={handleReset}
              className="py-3 px-4 rounded bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors cursor-pointer"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/40 text-red-400 font-mono text-xs">
              {formError}
            </div>
          )}

          {/* Quick Package Selector linking to Studio Pricing */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-300 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-200">
                <Sparkles className="w-3.5 h-3.5 text-[#00FF00]" />
                <span>Select Studio Sprint or Custom Scope:</span>
              </span>
              <span className="text-[10px] text-[#00FF00] font-mono">
                {currencyInfo.flag} {visitorCurrency} AUTO-CONVERTED
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {pricingPackages.filter((p) => p.active).map((pkg) => {
                const isSelected = formData.selectedPackage === pkg.id;
                const formattedPrice = formatRegionalPrice(pkg.priceKES, visitorCurrency, {
                  priceUSD: pkg.priceUSD,
                  includeCode: true,
                });
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelectPackageQuick(pkg.id)}
                    className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#00FF00]/15 border-[#00FF00] text-white shadow-[0_0_12px_rgba(0,255,0,0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-heading font-bold text-xs truncate text-white">{pkg.name}</div>
                      <div className="font-mono text-[11px] text-[#00FF00] font-semibold mt-0.5">
                        {formattedPrice}
                      </div>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-1 flex items-center justify-between">
                      <span>{pkg.deliveryTime}</span>
                      {isSelected && <span className="text-[#00FF00]">✓ Selected</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Honeypot field for spam prevention */}
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
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Samuel Waweru"
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
                placeholder="samuel@shift-app.com"
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
                placeholder="+254 712 345 678"
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
                Project Type / Engagement
              </label>
              <input
                type="text"
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                placeholder="e.g. Mobile PWA & Offline Sync"
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase flex items-center justify-between">
                <span>Budget Range ({visitorCurrency})</span>
                <span className="text-[10px] text-[#00FF00]">{currencyInfo.flag} Regional</span>
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => {
                  setFormData({ ...formData, budgetRange: e.target.value, selectedPackage: '' });
                }}
                className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all"
              >
                {formData.selectedPackage && (
                  <option value={formData.budgetRange}>{formData.budgetRange}</option>
                )}
                {regionalRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
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
                <option value="4 - 6 weeks">4 - 6 weeks (MVP Platform)</option>
                <option value="1 - 2 months">1 - 2 months (Full Platform & Portal)</option>
                <option value="2 - 3 months">2 - 3 months (Enterprise Architecture)</option>
                <option value="Ongoing / Retainer">Ongoing Engineering Retainer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase">
              Project Description &amp; Requirements *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell Trevor about your application, business objectives, timeline constraints, and any integrations (Paystack, M-Pesa, Cloud Run, Offline Sync, etc.)..."
              className="w-full bg-[#0B0E0C] border border-[#1A211D] focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] rounded px-3 py-2 text-sm text-white outline-none transition-all font-sans leading-relaxed resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Transmit Inquiry &amp; Generate WhatsApp Handoff</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-neutral-500 font-mono text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF00]" />
              Zero spam policy. Saved directly to Cloud Firestore + instant WhatsApp transmission.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
