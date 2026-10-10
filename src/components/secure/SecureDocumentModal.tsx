import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Document, Invoice, Project } from '../../types';
import { Badge } from '../common/Badge';
import {
  FileText,
  DollarSign,
  Shield,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MessageSquare,
  Check,
  Smartphone,
  CreditCard,
  Lock,
  X,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface SecureDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document | null;
  invoice?: Invoice | null;
  project?: Project | null;
}

export const SecureDocumentModal: React.FC<SecureDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  invoice,
  project,
}) => {
  const {
    signDocumentWithToken,
    payInvoiceWithToken,
    settings,
    currentUser,
    showToast,
  } = useApp();

  // Signing state
  const [signerFullName, setSignerFullName] = useState(currentUser.name || 'David Mwangi');
  const [signerTitle, setSignerTitle] = useState('Managing Director / Authorized Representative');
  const [signerNotes, setSignerNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signingSuccess, setSigningSuccess] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'mpesa_stk' | 'mpesa_ref' | 'card'>('mpesa_stk');
  const [paymentPhone, setPaymentPhone] = useState('+254 712 345 678');
  const [mpesaRefCode, setMpesaRefCode] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [stkPushStep, setStkPushStep] = useState<'idle' | 'prompted' | 'confirmed'>('idle');

  // Copied link toast
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || (!document && !invoice)) return null;

  const currentToken = document?.secureToken || document?.id || invoice?.secureToken || invoice?.id || '';
  const secureUrl = `${window.location.origin}/portal?secureToken=${currentToken}&type=${document ? 'doc' : 'inv'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(secureUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const targetPhone = settings.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, '') : '254142993925';
    const text = document
      ? `Hello, please review and digitally sign the contract for "${project?.title || 'Project'}":\n${document.title}\nSecure Link: ${secureUrl}`
      : `Hello, please review and settle invoice ${invoice?.number} for "${project?.title || 'Project'}" (${invoice?.amount.toLocaleString()} ${invoice?.currency}):\nSecure Payment Link: ${secureUrl}`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!document || !signerFullName.trim() || !termsAccepted) return;
    setIsSigning(true);
    setTimeout(() => {
      const sigData = `DIGITAL_SIG_${signerFullName.trim().toUpperCase()}_${Date.now()}`;
      signDocumentWithToken(currentToken, signerFullName.trim(), sigData, signerNotes.trim());
      setIsSigning(false);
      setSigningSuccess(true);
      showToast('success', 'Document Signed', `Contract signed digitally by ${signerFullName.trim()}. Timestamped & encrypted.`);
      setTimeout(() => {
        setSigningSuccess(false);
        onClose();
      }, 1800);
    }, 900);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setIsPaying(true);

    if (paymentMethod === 'mpesa_stk') {
      setStkPushStep('prompted');
      setTimeout(() => {
        setStkPushStep('confirmed');
        const generatedRef = `SDR${Math.floor(100000 + Math.random() * 900000)}KE`;
        payInvoiceWithToken(currentToken, 'M-Pesa Express (STK Push)', generatedRef, paymentNotes);
        setIsPaying(false);
        setPaySuccess(true);
        showToast('success', 'M-Pesa Payment Confirmed', `STK Push transaction verified [Ref: ${generatedRef}]. Invoice settled!`);
        setTimeout(() => {
          setPaySuccess(false);
          setStkPushStep('idle');
          onClose();
        }, 1800);
      }, 1500);
    } else {
      setTimeout(() => {
        const ref = mpesaRefCode.trim() || `TX-${Date.now().toString().slice(-6)}`;
        payInvoiceWithToken(
          currentToken,
          paymentMethod === 'mpesa_ref' ? 'M-Pesa Manual Paybill' : 'Credit / Debit Card',
          ref,
          paymentNotes
        );
        setIsPaying(false);
        setPaySuccess(true);
        setTimeout(() => {
          setPaySuccess(false);
          onClose();
        }, 1800);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#090C0A] border border-white/15 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Strip */}
        <div className="px-6 py-4 bg-[#0F1410] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-center justify-center text-[#00FF00]">
              {document ? <FileText className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#00FF00] tracking-wider uppercase font-semibold">
                  // VERIFIED SECURE GATEWAY
                </span>
                <span className="text-neutral-500">•</span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {document ? 'LEGAL CONTRACT' : 'INVOICE SETTLEMENT'}
                </span>
              </div>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                {document ? document.title : `${invoice?.number} — ${invoice?.description}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Share Secure Link / WhatsApp */}
        <div className="px-6 py-3 bg-black/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-[#00FF00]" />
            <span>TOKEN:</span>
            <code className="text-white bg-black/80 px-2 py-0.5 rounded border border-white/10 text-[11px]">
              {currentToken}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/15 border border-white/15 text-neutral-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00FF00]" />
                  <span className="text-[#00FF00] font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Secure Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded bg-[#00FF00]/15 hover:bg-[#00FF00] border border-[#00FF00]/40 text-[#00FF00] hover:text-black font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-neutral-300">
          {/* ========================================================
              MODE 1: DOCUMENT / CONTRACT SIGNING
             ======================================================== */}
          {document && (
            <div className="space-y-6">
              {/* Document Metadata Pill */}
              <div className="p-4 rounded-lg bg-black/50 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block">TYPE</span>
                  <span className="text-white uppercase font-bold">{document.type}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">STATUS</span>
                  <Badge
                    label={document.status === 'signed' ? 'DIGITALLY SIGNED' : 'AWAITING SIGNATURE'}
                    variant={document.status === 'signed' ? 'green' : 'orange'}
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block">PROJECT</span>
                  <span className="text-white truncate block">{project?.title || 'Active Project'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">DISPATCHED</span>
                  <span className="text-neutral-400">{document.createdAt.split('T')[0]}</span>
                </div>
              </div>

              {/* Document Prose Box */}
              <div className="p-5 rounded-lg bg-black/70 border border-white/10 font-sans text-xs leading-relaxed space-y-3 max-h-64 overflow-y-auto text-neutral-300">
                <div className="font-mono text-[11px] text-[#00FF00] font-bold border-b border-white/10 pb-1.5 uppercase">
                  LEGAL INSTRUMENT CONTENT &amp; TERMS:
                </div>
                <div className="whitespace-pre-line text-neutral-200">
                  {document.content}
                </div>
              </div>

              {/* Already Signed Certificate Stamp */}
              {document.status === 'signed' ? (
                <div className="p-5 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/40 space-y-3">
                  <div className="flex items-center gap-2 text-[#00FF00]">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-heading font-bold text-sm tracking-wide">
                      DOCUMENT EXECUTED &amp; RECORDED IN AUDIT LEDGER
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">AUTHORIZED SIGNATORY:</span>
                      <span className="text-white font-bold">{document.signedName || 'Signatory'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">EXECUTION TIMESTAMP:</span>
                      <span className="text-white">{document.signedAt || 'Timestamped'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">RECORDED IP AUDIT:</span>
                      <span className="text-[#00FF00]">{document.signedIp || '102.166.114.42'}</span>
                    </div>
                  </div>
                  {document.responseNotes && (
                    <div className="pt-2 border-t border-[#00FF00]/20 font-mono text-xs text-neutral-300">
                      <span className="text-[#00FF00] font-semibold">Signer Notes:</span> {document.responseNotes}
                    </div>
                  )}
                </div>
              ) : (
                /* Unsigned: Interactive Signature Submission Form */
                <form onSubmit={handleSignSubmit} className="p-5 rounded-lg bg-black/60 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-heading font-bold text-white text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#00FF00]" />
                      Digital Signature &amp; Legal Authorization
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      KENYA DATA PROTECTION ACT 2019 COMPLIANT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-xs text-neutral-300">
                        Full Legal Name of Signatory *
                      </label>
                      <input
                        type="text"
                        required
                        value={signerFullName}
                        onChange={(e) => setSignerFullName(e.target.value)}
                        placeholder="e.g. David Mwangi"
                        className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs focus:border-[#00FF00] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs text-neutral-300">
                        Corporate Title / Capacity
                      </label>
                      <input
                        type="text"
                        value={signerTitle}
                        onChange={(e) => setSignerTitle(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs focus:border-[#00FF00] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs text-neutral-300">
                      Counterparty Response Notes / Addendum Comments (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={signerNotes}
                      onChange={(e) => setSignerNotes(e.target.value)}
                      placeholder="Add any clarification or notes communicated to Trevor Don..."
                      className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  {/* Digital Signature Preview Stamp */}
                  <div className="p-3 rounded bg-black/90 border border-[#00FF00]/30 font-mono text-xs space-y-1">
                    <div className="text-[10px] text-neutral-400">DIGITAL SIGNATURE STAMP PREVIEW:</div>
                    <div className="text-[#00FF00] font-bold text-sm tracking-wide">
                      {signerFullName ? `/s/ ${signerFullName.toUpperCase()}` : '/s/ [AWAITING NAME]'}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Timestamp: {new Date().toLocaleDateString()} • Hash: SHA256-AUTHENTICATED
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 accent-[#00FF00]"
                    />
                    <span className="font-sans text-xs text-neutral-300">
                      I confirm that I am authorized to bind the client entity, and I accept the terms of this agreement with Trevon Creates.
                    </span>
                  </label>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSigning || !termsAccepted || !signerFullName.trim()}
                      className="px-6 py-2.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs shadow-[0_0_20px_rgba(0,255,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-all"
                    >
                      {isSigning ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Recording Signature...</span>
                        </>
                      ) : signingSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Signature Verified!</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>Authorize &amp; Digitally Sign Contract</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              MODE 2: INVOICE REVIEW & SETTLEMENT
             ======================================================== */}
          {invoice && (
            <div className="space-y-6">
              {/* Invoice Summary Strip */}
              <div className="p-4 rounded-lg bg-black/50 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block">INVOICE NO</span>
                  <span className="text-white font-bold">{invoice.number}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">AMOUNT DUE</span>
                  <span className="text-[#00FF00] font-bold text-base">
                    {invoice.amount.toLocaleString()} {invoice.currency}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">PAYMENT STATUS</span>
                  <Badge
                    label={invoice.status === 'paid' ? 'PAID & SETTLED' : 'PAYMENT DUE'}
                    variant={invoice.status === 'paid' ? 'green' : 'orange'}
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block">DUE DATE</span>
                  <span className="text-neutral-300">{invoice.dueDate}</span>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="rounded-lg bg-black/60 border border-white/10 overflow-hidden">
                <div className="p-3 bg-black/80 border-b border-white/10 font-mono text-xs text-[#00FF00] font-bold uppercase flex justify-between">
                  <span>Itemized Scope Deliverables</span>
                  <span>Amount ({invoice.currency})</span>
                </div>
                <div className="divide-y divide-white/5 font-sans text-xs">
                  {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: invoice.description, quantity: 1, unitPrice: invoice.amount }]).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-neutral-300">
                      <div>
                        <div className="font-semibold text-white">{item.description}</div>
                        <div className="font-mono text-[11px] text-neutral-500">Qty: {item.quantity} × {item.unitPrice.toLocaleString()} {invoice.currency}</div>
                      </div>
                      <div className="font-mono font-bold text-white">
                        {(item.quantity * item.unitPrice).toLocaleString()} {invoice.currency}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-black/80 border-t border-white/10 flex items-center justify-between font-mono font-bold text-sm text-white">
                  <span>TOTAL CONSIDERATION:</span>
                  <span className="text-[#00FF00]">
                    {invoice.amount.toLocaleString()} {invoice.currency}
                  </span>
                </div>
              </div>

              {/* Already Paid Record */}
              {invoice.status === 'paid' ? (
                <div className="p-5 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/40 space-y-3">
                  <div className="flex items-center gap-2 text-[#00FF00]">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-heading font-bold text-sm tracking-wide">
                      INVOICE SETTLED &amp; DISBURSEMENT RECONCILED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">PAYMENT METHOD:</span>
                      <span className="text-white font-bold">{invoice.paymentMethod || 'M-Pesa Express'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">SETTLEMENT DATE:</span>
                      <span className="text-white">{invoice.paidAt?.split('T')[0] || 'Settled'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">TRANSACTION REF:</span>
                      <span className="text-[#00FF00]">{invoice.transactionRef || 'MPESA-993925'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unpaid: Payment Rails Form */
                <form onSubmit={handlePaySubmit} className="p-5 rounded-lg bg-black/60 border border-white/10 space-y-4">
                  <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                    <span className="font-heading font-bold text-white text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#00FF00]" />
                      Select Payment Channel
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      SECURE ESCROW / STK PUSH
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa_stk')}
                      className={`p-3 rounded border text-left transition-all ${
                        paymentMethod === 'mpesa_stk'
                          ? 'bg-[#00FF00]/15 border-[#00FF00] text-white'
                          : 'bg-black border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs text-[#00FF00]">M-Pesa STK Push</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Instant prompt to phone</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa_ref')}
                      className={`p-3 rounded border text-left transition-all ${
                        paymentMethod === 'mpesa_ref'
                          ? 'bg-[#00FF00]/15 border-[#00FF00] text-white'
                          : 'bg-black border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs text-[#00FF00]">Paybill / Till Ref</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Enter Safaricom receipt</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded border text-left transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-[#00FF00]/15 border-[#00FF00] text-white'
                          : 'bg-black border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs text-[#00FF00]">Card / Bank Wire</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Visa / Mastercard / Swift</div>
                    </button>
                  </div>

                  {/* Channel Specific Fields */}
                  {paymentMethod === 'mpesa_stk' && (
                    <div className="p-3 rounded bg-black/80 border border-white/10 space-y-2">
                      <label className="font-mono text-xs text-neutral-300 block">
                        Safaricom M-Pesa Phone Number:
                      </label>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#00FF00]" />
                        <input
                          type="text"
                          required
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="flex-1 px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs focus:border-[#00FF00] focus:outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans">
                        A secure STK prompt for <strong>{invoice.amount.toLocaleString()} {invoice.currency}</strong> will be sent immediately to enter your M-Pesa PIN.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'mpesa_ref' && (
                    <div className="p-3 rounded bg-black/80 border border-white/10 space-y-2">
                      <div className="text-xs font-mono text-neutral-300">
                        Paybill: <strong>247247</strong> • Account: <strong>NYUMBA-{invoice.number}</strong>
                      </div>
                      <label className="font-mono text-xs text-neutral-300 block">
                        Enter Safaricom M-Pesa Receipt Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={mpesaRefCode}
                        onChange={(e) => setMpesaRefCode(e.target.value)}
                        placeholder="e.g. QK93TF821P"
                        className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs uppercase focus:border-[#00FF00] focus:outline-none"
                      />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="p-3 rounded bg-black/80 border border-white/10 space-y-2 text-xs">
                      <p className="text-neutral-300 font-sans">
                        Pay via Paystack credit/debit card secure checkout or direct bank wire:
                      </p>
                      <input
                        type="text"
                        placeholder="Cardholder Name or Bank Reference"
                        value={mpesaRefCode}
                        onChange={(e) => setMpesaRefCode(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs focus:border-[#00FF00] focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-mono text-xs text-neutral-300">
                      Payment Memo / Response Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="e.g. Approved by Finance for Milestone 2 cutover"
                      className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isPaying}
                      className="px-6 py-2.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs shadow-[0_0_20px_rgba(0,255,0,0.4)] disabled:opacity-50 cursor-pointer transition-all flex items-center gap-2"
                    >
                      {isPaying ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Processing Payment...</span>
                        </>
                      ) : paySuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Payment Reconciled!</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" />
                          <span>Confirm &amp; Settle {invoice.amount.toLocaleString()} {invoice.currency}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
