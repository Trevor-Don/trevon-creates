import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SecureDocumentModal } from '../secure/SecureDocumentModal';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Send,
  CreditCard,
  PlusCircle,
  PenTool,
  Check,
  Menu,
  X,
  Copy,
  Lock,
  Globe,
  LayoutDashboard,
  FileCheck,
  Layers,
  HelpCircle,
  Download,
  Star,
  ThumbsUp,
  Share2,
} from 'lucide-react';
import { Task, Deliverable, Document, Invoice, Project, ClientReview } from '../../types';

export const ClientPortal: React.FC = () => {
  const {
    currentUser,
    clients,
    projects,
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    submitClientTask,
    signDocument,
    payInvoice,
    submitChangeRequest,
    services,
    reviews,
    submitClientReview,
    settings,
    setSurface,
    navigateTo,
    showToast,
  } = useApp();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'trevor_tasks' | 'deliverables' | 'documents' | 'invoices' | 'updates' | 'changes' | 'reviews'
  >('overview');

  // Client Review Form State
  const [reviewService, setReviewService] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewWouldRecommend, setReviewWouldRecommend] = useState(true);
  const [reviewIsSubmitting, setReviewIsSubmitting] = useState(false);
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState<ClientReview | null>(null);
  const [copiedReviewText, setCopiedReviewText] = useState(false);

  // Mobile sidebar toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Secure Document & Invoice Modal
  const [secureModalOpen, setSecureModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);

  // Copied token notification
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Interactive Task Modal
  const [activeTaskModal, setActiveTaskModal] = useState<Task | null>(null);
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});

  // Change request modal
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeDesc, setChangeDesc] = useState('');
  const [changeBudget, setChangeBudget] = useState(1500);
  const [changeDays, setChangeDays] = useState(7);

  if (!currentProject) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-neutral-400 font-mono">
        No active project found for this account.
      </div>
    );
  }

  // Calculate project progress percentage
  const totalTasks = currentProject.tasks.length || 1;
  const completedTasks = currentProject.tasks.filter(
    (t) => t.status === 'approved' || t.status === 'done'
  ).length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const currentStage =
    currentProject.stages.find((s) => s.id === currentProject.currentStageId) ||
    currentProject.stages[0];

  // Split tasks: Client tasks vs Trevor tasks
  const clientTasks = currentProject.tasks.filter((t) => t.owner === 'client');
  const trevorTasks = currentProject.tasks.filter((t) => t.owner === 'admin');

  const pendingClientTasks = clientTasks.filter(
    (t) => t.status === 'pending' || t.status === 'rejected'
  );

  const pendingDocsCount = currentProject.documents.filter((d) => d.status !== 'signed').length;
  const unpaidInvoicesCount = currentProject.invoices.filter((i) => i.status !== 'paid').length;

  const handleCopySecureLink = (item: Document | Invoice) => {
    const token = item.secureToken || item.id;
    const isDoc = 'content' in item;
    const link = `${window.location.origin}/portal?secureToken=${token}&type=${isDoc ? 'doc' : 'inv'}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleOpenDocModal = (doc: Document) => {
    setSelectedDoc(doc);
    setSelectedInv(null);
    setSecureModalOpen(true);
  };

  const handleOpenInvModal = (inv: Invoice) => {
    setSelectedInv(inv);
    setSelectedDoc(null);
    setSecureModalOpen(true);
  };

  const handleOpenTask = (task: Task) => {
    setActiveTaskModal(task);
    if (task.response?.formData) {
      setFormInputs(task.response.formData);
    } else {
      setFormInputs({});
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskModal) return;
    submitClientTask(currentProject.id, activeTaskModal.id, formInputs);
    showToast('success', 'Task Submitted', `"${activeTaskModal.title}" response submitted for Trevor's review.`);
    setActiveTaskModal(null);
  };

  const handleChangeRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDesc.trim()) return;
    submitChangeRequest(currentProject.id, changeDesc, Number(changeBudget), Number(changeDays));
    showToast('success', 'Change Request Sent', 'Submitted for scope & budget review. Trevor will respond shortly.');
    setShowChangeModal(false);
    setChangeDesc('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col lg:flex-row transition-colors duration-200">
      {/* ========================================================
          SIDE PANEL (LEFT SIDEBAR NAVIGATION)
         ======================================================== */}
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#080B09] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* 1. Client Header Brand */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/40 flex items-center justify-center text-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.2)]">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-sm tracking-tight text-white">
                    CLIENT PORTAL
                  </span>
                  <Badge label="ACTIVE" variant="green" />
                </div>
                <div className="font-mono text-[11px] text-neutral-400 truncate max-w-[150px]">
                  {currentUser.name}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded bg-white/5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Project Selector & Progress Strip */}
          <div className="p-4 border-b border-white/5 bg-black/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                // ACTIVE PROJECT
              </span>
              <span className="font-mono text-xs text-[#00FF00] font-bold">
                {progressPercent}%
              </span>
            </div>

            {projects.length > 1 ? (
              <select
                value={currentProjectId}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#0D120E] border border-white/15 text-xs font-mono text-white focus:border-[#00FF00] focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-heading text-xs font-bold text-white truncate">
                {currentProject.title}
              </div>
            )}

            <div className="w-full h-1.5 rounded-full bg-black border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00FF00] to-[#55ff55] shadow-[0_0_8px_rgba(0,255,0,0.5)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
              <span>STAGE:</span>
              <span className="text-[#00FF00] font-semibold truncate max-w-[160px]">
                {currentStage?.name}
              </span>
            </div>
          </div>

          {/* 3. Main Navigation Menu */}
          <nav className="p-3 space-y-1 flex-1 font-mono text-xs">
            {/* Overview */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Project Overview</span>
              </div>
            </button>

            {/* Action Tasks (Waiting on Client) */}
            <button
              onClick={() => {
                setActiveTab('tasks');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your Action Items</span>
              </div>
              {pendingClientTasks.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FFAE00] text-black font-bold text-[10px]">
                  {pendingClientTasks.length} action
                </span>
              )}
            </button>

            {/* Trevor Tasks */}
            <button
              onClick={() => {
                setActiveTab('trevor_tasks');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'trevor_tasks'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>In Progress by Trevor</span>
              </div>
              <span className="text-neutral-500 font-mono text-[11px]">
                {trevorTasks.length}
              </span>
            </button>

            {/* Deliverables */}
            <button
              onClick={() => {
                setActiveTab('deliverables');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'deliverables'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4" />
                <span>Deliverables &amp; Files</span>
              </div>
              <span className="text-neutral-500 font-mono text-[11px]">
                {currentProject.deliverables.length}
              </span>
            </button>

            {/* Contracts & Documents */}
            <button
              onClick={() => {
                setActiveTab('documents');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4" />
                <span>Contracts &amp; Documents</span>
              </div>
              {pendingDocsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FFAE00]/20 text-[#FFAE00] font-bold text-[10px] border border-[#FFAE00]/40">
                  {pendingDocsCount}
                </span>
              )}
            </button>

            {/* Invoices & Billing */}
            <button
              onClick={() => {
                setActiveTab('invoices');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4" />
                <span>Invoices &amp; Billing</span>
              </div>
              {unpaidInvoicesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FFAE00]/20 text-[#FFAE00] font-bold text-[10px] border border-[#FFAE00]/40">
                  {unpaidInvoicesCount}
                </span>
              )}
            </button>

            {/* Updates Feed */}
            <button
              onClick={() => {
                setActiveTab('updates');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'updates'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Updates &amp; Feed</span>
              </div>
            </button>

            {/* Change Requests */}
            <button
              onClick={() => {
                setActiveTab('changes');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'changes'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>Change Requests</span>
              </div>
            </button>

            {/* Reviews & Feedback */}
            <button
              onClick={() => {
                setActiveTab('reviews');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-[#FFAE00]" />
                <span>Rate &amp; Review Service</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#FFAE00]/10 text-[#FFAE00] font-bold text-[10px] border border-[#FFAE00]/30">
                5★
              </span>
            </button>
          </nav>

          {/* 4. Bottom Support & Concierge */}
          <div className="p-4 border-t border-white/10 space-y-2 bg-black/60 font-mono text-xs">
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hello Trevor, I am messaging from the client portal regarding "${currentProject.title}".`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded bg-[#00FF00]/15 hover:bg-[#00FF00] border border-[#00FF00]/40 text-[#00FF00] hover:text-black font-bold flex items-center justify-between transition-all cursor-pointer text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp Trevor
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => {
                setSurface('public');
                navigateTo('/');
              }}
              className="w-full py-2 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-between transition-all cursor-pointer text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00FF00]" />
                Public Portfolio
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA (RIGHT SIDE)
         ======================================================== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#080B09]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded bg-white/5 text-neutral-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="font-mono text-[10px] text-[#00FF00] uppercase tracking-wider">
                {'// PROJECT COLLABORATION SUITE'}
              </div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight capitalize">
                {activeTab === 'overview'
                  ? 'Project Overview & Roadmap'
                  : activeTab === 'tasks'
                  ? 'Action Items Waiting on You'
                  : activeTab === 'trevor_tasks'
                  ? 'Engineering & Design In Progress'
                  : activeTab === 'deliverables'
                  ? 'Deliverables & Artifacts'
                  : activeTab === 'documents'
                  ? 'Contracts, MSAs & Signatures'
                  : activeTab === 'invoices'
                  ? 'Invoices & Payment Gateway'
                  : activeTab === 'updates'
                  ? 'Project Updates Feed'
                  : activeTab === 'reviews'
                  ? 'Rate Services & Verified Review'
                  : 'Scope Change Requests'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingClientTasks.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFAE00]/15 border border-[#FFAE00]/30 font-mono text-xs text-[#FFAE00]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{pendingClientTasks.length} pending items</span>
              </span>
            )}

            <button
              onClick={() => setShowChangeModal(true)}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#00FF00]" />
              <span className="hidden sm:inline">Request Change</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-8 space-y-8 flex-1 max-w-7xl w-full">
          {/* ========================================================
              TAB 1: PROJECT OVERVIEW
             ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">TOTAL INVESTMENT</span>
                  <span className="text-white font-bold text-base sm:text-lg">
                    ${currentProject.budgetAmount.toLocaleString()} {currentProject.currency}
                  </span>
                  <span className="text-[#00FF00] block text-[10px]">CONTRACT FIXED-PRICE</span>
                </div>

                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">TARGET DELIVERY</span>
                  <span className="text-[#00FF00] font-bold text-base sm:text-lg">
                    {currentProject.targetEndDate}
                  </span>
                  <span className="text-neutral-400 block text-[10px]">START: {currentProject.startDate}</span>
                </div>

                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">ACTION ITEMS WAITING</span>
                  <span
                    className={`font-bold text-base sm:text-lg ${
                      pendingClientTasks.length > 0 ? 'text-[#FFAE00]' : 'text-[#00FF00]'
                    }`}
                  >
                    {pendingClientTasks.length} ITEMS
                  </span>
                  <span className="text-neutral-400 block text-[10px]">REQUIRES YOUR INPUT</span>
                </div>

                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">ACTIVE SPRINT STAGE</span>
                  <span className="text-white font-bold text-base sm:text-lg truncate block">
                    {currentStage?.name}
                  </span>
                  <span className="text-[#00FF00] block text-[10px]">IN PROGRESS NOW</span>
                </div>
              </div>

              {/* Progress & Stages Stepper */}
              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-white">
                      Project Sprint Progression ({progressPercent}% Completed)
                    </h2>
                    <p className="text-xs text-neutral-400 font-sans">
                      {completedTasks} of {totalTasks} milestones approved across pipeline.
                    </p>
                  </div>
                  <Badge label={currentStage?.name || 'Sprint Active'} variant="green" />
                </div>

                <div className="w-full h-2.5 rounded-full bg-black border border-white/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00FF00] to-[#55ff55] shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                  {currentProject.stages.map((stage) => {
                    const isCurrent = stage.id === currentProject.currentStageId;
                    const isDone = stage.status === 'done';
                    return (
                      <div
                        key={stage.id}
                        className={`p-2.5 rounded text-center border font-mono text-xs transition-all ${
                          isCurrent
                            ? 'bg-[#00FF00]/15 border-[#00FF00] text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.2)] font-bold'
                            : isDone
                            ? 'bg-black/50 border-white/10 text-neutral-400 line-through'
                            : 'bg-black/20 border-white/5 text-neutral-600'
                        }`}
                      >
                        <div className="truncate">{stage.name}</div>
                        <div className="text-[9px] uppercase tracking-wider mt-0.5">
                          {isCurrent ? '[ACTIVE]' : isDone ? '[DONE]' : '[UPCOMING]'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rate Experience & Google Business Sync Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#080B09] via-black to-[#080B09] border border-[#FFAE00]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFAE00]/15 border border-[#FFAE00]/30 flex items-center justify-center text-[#FFAE00]">
                    <Star className="w-5 h-5 fill-[#FFAE00]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-sm">
                      Rate Your Service Experience &amp; Google Profile Sync
                    </h3>
                    <p className="text-xs text-neutral-400 font-sans">
                      Leave a verified review for Trevor&apos;s deliverables. Help prospective partners discover our engineering craft.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className="px-4 py-2 rounded bg-[#FFAE00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,174,0,0.3)] transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <Star className="w-3.5 h-3.5 fill-black" />
                  <span>Leave Verified Review</span>
                </button>
              </div>

              {/* Action items banner if any */}
              {pendingClientTasks.length > 0 && (
                <div className="p-6 rounded-xl bg-[#FFAE00]/10 border border-[#FFAE00]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#FFAE00]">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-heading font-bold text-white text-base">
                        Action Required: Items Waiting on Your Input ({pendingClientTasks.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-mono text-[#FFAE00] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {pendingClientTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTask(task)}
                        className="p-3.5 rounded-lg bg-black/60 border border-white/10 hover:border-[#FFAE00]/50 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-sm">{task.title}</span>
                          <p className="text-xs text-neutral-400 truncate max-w-xl">{task.description}</p>
                        </div>
                        <span className="px-3 py-1 rounded bg-[#FFAE00] text-black font-heading font-bold text-xs shrink-0">
                          Complete Task
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: YOUR ACTION TASKS
             ======================================================== */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Your Action Items ({clientTasks.length})
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Tasks assigned to your team to confirm requirements, provide access, and review deliverables.
                </p>
              </div>

              <div className="space-y-3">
                {clientTasks.map((task) => {
                  const isDone = task.status === 'approved' || task.status === 'done';
                  const isSubmitted = task.status === 'submitted';
                  const isRejected = task.status === 'rejected';

                  return (
                    <div
                      key={task.id}
                      className={`p-5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-[#080B09]/60 border-white/5 opacity-80'
                          : isRejected
                          ? 'bg-red-500/10 border-red-500/30'
                          : isSubmitted
                          ? 'bg-black/60 border-white/10'
                          : 'bg-[#080B09] border-[#00FF00]/30 hover:border-[#00FF00]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-white text-base">
                              {task.title}
                            </span>
                            <Badge
                              label={
                                isDone
                                  ? 'COMPLETED'
                                  : isSubmitted
                                  ? 'SUBMITTED / PENDING REVIEW'
                                  : isRejected
                                  ? 'REVISION REQUESTED'
                                  : 'ACTION REQUIRED'
                              }
                              variant={
                                isDone
                                  ? 'green'
                                  : isSubmitted
                                  ? 'orange'
                                  : isRejected
                                  ? 'orange'
                                  : 'cyan'
                              }
                            />
                          </div>
                          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                            {task.description}
                          </p>

                          {isRejected && task.response?.rejectionReason && (
                            <div className="p-2.5 rounded bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-mono mt-2">
                              <strong>Revision Note:</strong> {task.response.rejectionReason}
                            </div>
                          )}
                        </div>

                        <div>
                          {!isDone && (
                            <button
                              onClick={() => handleOpenTask(task)}
                              className="px-4 py-2 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,0,0.3)] transition-all cursor-pointer whitespace-nowrap"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                              <span>{isSubmitted ? 'Edit Submission' : 'Complete Item'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: IN PROGRESS BY TREVOR
             ======================================================== */}
          {activeTab === 'trevor_tasks' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Engineering &amp; Design by Trevor ({trevorTasks.length})
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Real-time status of architecture, UI design, API integration, and deployment tasks being executed.
                </p>
              </div>

              <div className="space-y-3">
                {trevorTasks.map((task) => {
                  const isDone = task.status === 'approved' || task.status === 'done';
                  return (
                    <div
                      key={task.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-white text-base">
                            {task.title}
                          </span>
                          <Badge
                            label={isDone ? 'COMPLETED' : 'IN PROGRESS'}
                            variant={isDone ? 'green' : 'neutral'}
                          />
                        </div>
                        <p className="text-xs text-neutral-400 font-sans">{task.description}</p>
                      </div>

                      <div className="text-right font-mono text-xs text-neutral-500 shrink-0">
                        {isDone ? (
                          <span className="text-[#00FF00] flex items-center gap-1 font-bold">
                            <Check className="w-4 h-4" /> Delivered
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-neutral-400">
                            <Clock className="w-3.5 h-3.5 animate-spin" /> In Dev
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: DELIVERABLES & ARTIFACTS
             ======================================================== */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Project Deliverables &amp; Artifacts ({currentProject.deliverables.length})
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Published prototypes, staging deployments, Figma token libraries, and architecture specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentProject.deliverables
                  .filter((d) => d.visibleToClient)
                  .map((del) => (
                    <div
                      key={del.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 hover:border-[#00FF00]/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-white text-base">
                          {del.title}
                        </span>
                        <span className="font-mono text-xs text-[#00FF00] bg-black/60 px-2 py-0.5 rounded border border-[#00FF00]/30 font-bold">
                          {del.version}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        {del.description}
                      </p>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                        <span className="text-neutral-500">{del.createdAt.split('T')[0]}</span>
                        <a
                          href={del.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,255,0,0.2)]"
                        >
                          <span>Launch Live</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: CONTRACTS & DOCUMENTS (SECURE SIGNING)
             ======================================================== */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Contracts &amp; Legal Instruments ({currentProject.documents.length})
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Review, authorize, and digitally sign binding Master Services Agreements, scopes, and NDAs. Every execution is stamped with an immutable audit hash.
                </p>
              </div>

              <div className="space-y-4">
                {currentProject.documents.map((doc) => {
                  const token = doc.secureToken || doc.id;
                  const isCopied = copiedToken === token;

                  return (
                    <div
                      key={doc.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-white text-base">
                              {doc.title}
                            </span>
                            <Badge
                              label={doc.status === 'signed' ? 'DIGITALLY SIGNED' : 'AWAITING SIGNATURE'}
                              variant={doc.status === 'signed' ? 'green' : 'orange'}
                            />
                          </div>
                          <div className="font-mono text-xs text-neutral-400">
                            TYPE: {doc.type.toUpperCase()} • DATE: {doc.createdAt.split('T')[0]}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopySecureLink(doc)}
                            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/15 border border-white/15 text-neutral-200 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#00FF00]" />
                                <span className="text-[#00FF00] font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenDocModal(doc)}
                            className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,0,0.3)] cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>{doc.status === 'signed' ? 'View Certificate' : 'Review & Sign'}</span>
                          </button>
                        </div>
                      </div>

                      {doc.status === 'signed' && (
                        <div className="p-3 rounded-lg bg-[#00FF00]/5 border border-[#00FF00]/20 font-mono text-xs flex flex-wrap gap-4 text-neutral-300">
                          <div>
                            <span className="text-neutral-500">SIGNATORY:</span>{' '}
                            <span className="text-[#00FF00] font-bold">{doc.signedName}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">TIMESTAMP:</span>{' '}
                            <span>{doc.signedAt}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">IP AUDIT:</span>{' '}
                            <span>{doc.signedIp}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: INVOICES & PAYMENTS (M-PESA RAILS)
             ======================================================== */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Invoices &amp; Payments ({currentProject.invoices.length})
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Settle milestone disbursements directly via M-Pesa Express (STK push prompt to your phone) or credit card gateway.
                </p>
              </div>

              <div className="space-y-4">
                {currentProject.invoices.map((inv) => {
                  const token = inv.secureToken || inv.id;
                  const isCopied = copiedToken === token;

                  return (
                    <div
                      key={inv.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-white text-base">
                              {inv.number}
                            </span>
                            <span className="text-neutral-600">•</span>
                            <span className="font-heading text-sm text-neutral-300">
                              {inv.description}
                            </span>
                            <Badge
                              label={inv.status === 'paid' ? 'PAID & SETTLED' : 'PAYMENT DUE'}
                              variant={inv.status === 'paid' ? 'green' : 'orange'}
                            />
                          </div>
                          <div className="font-mono text-xs text-neutral-400">
                            DUE DATE: {inv.dueDate}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="font-mono font-bold text-lg text-[#00FF00]">
                            {inv.amount.toLocaleString()} {inv.currency}
                          </div>

                          <button
                            onClick={() => handleCopySecureLink(inv)}
                            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/15 border border-white/15 text-neutral-200 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#00FF00]" />
                                <span className="text-[#00FF00] font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenInvModal(inv)}
                            className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,0,0.3)] cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{inv.status === 'paid' ? 'View Receipt' : 'Pay via M-Pesa'}</span>
                          </button>
                        </div>
                      </div>

                      {inv.status === 'paid' && (
                        <div className="p-3 rounded-lg bg-[#00FF00]/5 border border-[#00FF00]/20 font-mono text-xs flex flex-wrap gap-4 text-neutral-300">
                          <div>
                            <span className="text-neutral-500">PAYMENT METHOD:</span>{' '}
                            <span className="text-[#00FF00] font-bold">{inv.paymentMethod || 'M-Pesa Express'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">PAID AT:</span>{' '}
                            <span>{inv.paidAt?.split('T')[0]}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">RECEIPT CODE:</span>{' '}
                            <span className="text-white font-bold">{inv.transactionRef || 'MPESA-0042'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: UPDATES FEED
             ======================================================== */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Project Updates &amp; Changelog ({currentProject.updates.length})
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Direct announcements, milestone reviews, and technical disclosures from Trevor.
                </p>
              </div>

              <div className="space-y-4">
                {currentProject.updates.map((upd) => (
                  <div
                    key={upd.id}
                    className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-heading font-bold text-white text-base">
                        {upd.title}
                      </span>
                      <span className="font-mono text-xs text-neutral-500">
                        {upd.createdAt.split('T')[0]}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans whitespace-pre-line leading-relaxed">
                      {upd.body}
                    </p>
                    <div className="font-mono text-[11px] text-neutral-500 flex items-center gap-1.5">
                      <span>Posted by</span>
                      <span className="text-[#00FF00]">{upd.authorName}</span>
                      <span>({upd.authorRole})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 8: CHANGE REQUESTS
             ======================================================== */}
          {activeTab === 'changes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Scope Change Requests ({currentProject.changeRequests.length})
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Submit adjustments to the contracted requirements, budget, or target delivery dates.
                  </p>
                </div>

                <button
                  onClick={() => setShowChangeModal(true)}
                  className="px-4 py-2 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,0,0.3)] cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit New Request</span>
                </button>
              </div>

              {currentProject.changeRequests.length === 0 ? (
                <div className="p-12 rounded-xl bg-[#080B09] border border-white/10 text-center text-xs font-mono text-neutral-400 space-y-2">
                  <p>No change requests submitted yet.</p>
                  <button
                    onClick={() => setShowChangeModal(true)}
                    className="text-[#00FF00] hover:underline"
                  >
                    Submit a scope change request
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentProject.changeRequests.map((cr) => (
                    <div
                      key={cr.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-white text-base">
                          {cr.description}
                        </span>
                        <Badge
                          label={cr.status.toUpperCase()}
                          variant={cr.status === 'approved' ? 'green' : 'orange'}
                        />
                      </div>
                      <div className="font-mono text-xs text-neutral-400 flex gap-4">
                        <span>Budget impact: +${cr.budgetDelta}</span>
                        <span>Timeline impact: +{cr.timelineDeltaDays} days</span>
                        <span>Submitted: {cr.createdAt.split('T')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: CLIENT REVIEWS & SERVICE EXPERIENCE FEEDBACK
             ======================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-4xl">
              {/* Header Box */}
              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#FFAE00] uppercase tracking-wider font-semibold">
                    CLIENT REPUTATION &amp; EXPERIENCE FEEDBACK
                  </span>
                  <Badge label="GOOGLE PROFILE CONNECTED" variant="orange" />
                </div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Rate Trevor&apos;s Engineering Services
                </h2>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Your feedback helps us continuously elevate delivery standards, and helps future clients on Google Business and our studio portfolio verify our craft.
                </p>
              </div>

              {/* Review Submitted Banner / State */}
              {reviewSubmittedSuccess ? (
                <div className="p-8 rounded-xl bg-gradient-to-br from-[#080B09] via-black to-[#080B09] border border-[#00FF00]/50 shadow-[0_0_30px_rgba(0,255,0,0.15)] space-y-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#00FF00]/15 border border-[#00FF00]/40 mx-auto flex items-center justify-center text-[#00FF00]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="font-heading text-2xl font-bold text-white">
                      Thank You, {currentUser.name}!
                    </h3>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                      Your review for <span className="text-[#00FF00] font-semibold">{reviewSubmittedSuccess.serviceName}</span> is saved and recorded.
                    </p>
                  </div>

                  <div className="p-5 rounded-lg bg-black/60 border border-white/10 max-w-xl mx-auto text-left space-y-2 font-sans">
                    <div className="flex items-center gap-1 text-[#FFAE00]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FFAE00]" />
                      ))}
                      <span className="font-mono text-xs text-neutral-400 ml-2">5.0 / 5.0</span>
                    </div>
                    <div className="font-heading font-bold text-sm text-white">
                      &ldquo;{reviewSubmittedSuccess.headline}&rdquo;
                    </div>
                    <p className="text-xs text-neutral-300 italic">
                      &ldquo;{reviewSubmittedSuccess.comment}&rdquo;
                    </p>
                  </div>

                  {/* One-Click Google Business Profile Sync Action */}
                  <div className="pt-2 max-w-md mx-auto space-y-3">
                    <button
                      onClick={() => {
                        const quote = `"${reviewSubmittedSuccess.headline}" - ${reviewSubmittedSuccess.comment}`;
                        navigator.clipboard.writeText(quote);
                        setCopiedReviewText(true);
                        const bizUrl = settings.googleBusinessProfileUrl || 'https://maps.app.goo.gl/trevoncreates';
                        window.open(bizUrl, '_blank', 'noopener,noreferrer');
                        setTimeout(() => setCopiedReviewText(false), 4000);
                      }}
                      className="w-full py-3 px-4 rounded-lg bg-[#FFAE00] hover:bg-white text-black font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,174,0,0.4)] transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{copiedReviewText ? 'Copied! Opening Google Business...' : 'Post to Trevor’s Google Business Profile'}</span>
                    </button>

                    <p className="font-mono text-[11px] text-neutral-400">
                      Copies your review text to clipboard and opens Trevor&apos;s Google Maps page so you can paste with 1-click!
                    </p>

                    <button
                      onClick={() => {
                        setReviewSubmittedSuccess(null);
                        setReviewHeadline('');
                        setReviewComment('');
                      }}
                      className="text-xs font-mono text-neutral-400 hover:text-white underline pt-2 cursor-pointer"
                    >
                      Submit another review
                    </button>
                  </div>
                </div>
              ) : (
                /* The Review Submission Form */
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!reviewHeadline.trim() || !reviewComment.trim()) return;
                    setReviewIsSubmitting(true);
                    try {
                      const res = await submitClientReview({
                        clientId: currentUser.id,
                        clientName: currentUser.name,
                        clientEmail: currentUser.email,
                        clientCompany: currentUser.company || currentProject.title,
                        clientAvatar: currentUser.avatarUrl,
                        projectId: currentProject.id,
                        projectTitle: currentProject.title,
                        serviceName: reviewService || currentProject.title,
                        rating: reviewRating,
                        headline: reviewHeadline.trim(),
                        comment: reviewComment.trim(),
                        wouldRecommend: reviewWouldRecommend,
                        googleBusinessReady: true,
                        status: 'published',
                        verifiedClient: true,
                      });
                      setReviewSubmittedSuccess(res);
                      showToast('success', '5★ Review Submitted', 'Thank you! Your testimonial has been published to Trevor’s portfolio & Google Business.');
                    } catch (err) {
                      console.error('Error submitting review:', err);
                    } finally {
                      setReviewIsSubmitting(false);
                    }
                  }}
                  className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-6 font-sans text-xs"
                >
                  {/* Service selector */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-neutral-300 block">
                      Select Service Offering Delivered *
                    </label>
                    <select
                      value={reviewService}
                      onChange={(e) => setReviewService(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs focus:border-[#FFAE00] focus:outline-none"
                    >
                      <option value="">{currentProject.title} (Current Active Project)</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Interactive Star Rating */}
                  <div className="space-y-2">
                    <label className="font-mono text-neutral-300 block">
                      Overall Engineering &amp; Delivery Rating *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (hoverRating !== null ? hoverRating : reviewRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                              title={`${star} Star${star > 1 ? 's' : ''}`}
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  isFilled
                                    ? 'fill-[#FFAE00] text-[#FFAE00] drop-shadow-[0_0_8px_rgba(255,174,0,0.5)]'
                                    : 'text-neutral-600'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <span className="font-mono text-xs text-[#FFAE00] font-bold">
                        {reviewRating === 5 && '5★ Exceptional Delivery & Architecture'}
                        {reviewRating === 4 && '4★ Great Performance & Delivery'}
                        {reviewRating === 3 && '3★ Satisfactory Project Delivery'}
                        {reviewRating === 2 && '2★ Needs Polish'}
                        {reviewRating === 1 && '1★ Unsatisfactory'}
                      </span>
                    </div>
                  </div>

                  {/* Review Headline */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-neutral-300 block">
                      Review Headline / Key Takeaway *
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewHeadline}
                      onChange={(e) => setReviewHeadline(e.target.value)}
                      placeholder="e.g. Sub-250ms latency on Cloud Run — Absolute engineering brilliance"
                      className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs focus:border-[#FFAE00] focus:outline-none"
                    />
                  </div>

                  {/* Review Detailed Body */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-neutral-300 block">
                      Detailed Experience &amp; Impact *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe the speed of execution, architectural stability, communication ergonomics, or business impact on your team..."
                      className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs leading-relaxed focus:border-[#FFAE00] focus:outline-none"
                    />
                  </div>

                  {/* Recommendation toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-black border border-white/10">
                    <div>
                      <div className="font-heading font-bold text-white text-xs">
                        Would you recommend Trevor to other founders / businesses?
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        Included in your verified public testimonial badge.
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                      <input
                        type="checkbox"
                        checked={reviewWouldRecommend}
                        onChange={(e) => setReviewWouldRecommend(e.target.checked)}
                        className="rounded bg-black border-white/20 text-[#00FF00] focus:ring-0"
                      />
                      <span className={reviewWouldRecommend ? 'text-[#00FF00] font-bold' : 'text-neutral-400'}>
                        {reviewWouldRecommend ? 'YES, HIGHLY' : 'NEUTRAL'}
                      </span>
                    </label>
                  </div>

                  {/* Google Business Profile explanation */}
                  <div className="p-4 rounded-lg bg-[#FFAE00]/10 border border-[#FFAE00]/30 flex items-start gap-3 text-xs">
                    <Star className="w-4 h-4 text-[#FFAE00] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-heading font-bold text-white">
                        Google Business Profile Verification
                      </div>
                      <p className="text-neutral-300 font-sans leading-relaxed">
                        After submitting here, you will also be given a direct 1-click shortcut to cross-post this review to Trevor&apos;s verified Google Business profile on Google Maps.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={reviewIsSubmitting}
                      className="px-6 py-2.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Star className="w-3.5 h-3.5 fill-black" />
                      <span>{reviewIsSubmitting ? 'Recording Review...' : 'Submit Official Review'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Your Previously Submitted Reviews */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-white">
                    Your Verified Reviews History
                  </h3>
                  <span className="font-mono text-xs text-neutral-400">
                    {reviews.filter((r) => r.clientId === currentUser.id || r.clientEmail === currentUser.email).length} Reviews On Record
                  </span>
                </div>

                {reviews
                  .filter((r) => r.clientId === currentUser.id || r.clientEmail === currentUser.email)
                  .map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-3 font-sans"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-[#FFAE00]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#FFAE00]' : 'text-neutral-700'}`}
                              />
                            ))}
                          </div>
                          <span className="font-mono text-xs text-neutral-400">
                            • {rev.serviceName}
                          </span>
                        </div>

                        <Badge
                          label={
                            rev.status === 'featured'
                              ? 'FEATURED ON PORTFOLIO'
                              : rev.status === 'published'
                              ? 'PUBLISHED'
                              : 'PENDING'
                          }
                          variant={rev.status === 'featured' ? 'orange' : 'green'}
                        />
                      </div>

                      <div className="font-heading font-bold text-sm text-white">
                        &ldquo;{rev.headline}&rdquo;
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-[11px] text-neutral-500">
                        <span>Submitted on {new Date(rev.createdAt).toLocaleDateString()}</span>

                        {settings.googleBusinessProfileUrl && (
                          <a
                            href={settings.googleBusinessProfileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#FFAE00] hover:underline flex items-center gap-1"
                          >
                            <span>View on Google Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          MODALS & OVERLAYS
         ======================================================== */}
      {/* 1. Secure Document & Invoice Gateway Modal */}
      <SecureDocumentModal
        isOpen={secureModalOpen}
        onClose={() => setSecureModalOpen(false)}
        document={selectedDoc}
        invoice={selectedInv}
        project={currentProject}
      />

      {/* 2. Interactive Task Modal */}
      {activeTaskModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveTaskModal(null)}
          title={`Task: ${activeTaskModal.title}`}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
            <p className="text-neutral-300 leading-relaxed">
              {activeTaskModal.description}
            </p>

            {/* Custom form fields if present */}
            {activeTaskModal.config?.formFields && activeTaskModal.config.formFields.length > 0 ? (
              <div className="space-y-3 pt-2">
                {activeTaskModal.config.formFields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="font-mono text-neutral-300 block">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        required={field.required}
                        value={formInputs[field.id] || ''}
                        onChange={(e) =>
                          setFormInputs({ ...formInputs, [field.id]: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white"
                      />
                    ) : (
                      <input
                        type={field.type === 'url' ? 'url' : 'text'}
                        required={field.required}
                        value={formInputs[field.id] || ''}
                        onChange={(e) =>
                          setFormInputs({ ...formInputs, [field.id]: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 pt-2">
                <label className="font-mono text-neutral-300 block">
                  Submission Notes / Confirmations *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide your notes or approval confirmation here..."
                  value={formInputs['notes'] || ''}
                  onChange={(e) => setFormInputs({ ...formInputs, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white"
                />
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold"
              >
                Submit for Trevor&apos;s Review
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Change Request Modal */}
      {showChangeModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowChangeModal(false)}
          title="Submit Project Change Request"
        >
          <form onSubmit={handleChangeRequestSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="font-mono text-neutral-300 block mb-1">
                Description of Scope Change *
              </label>
              <textarea
                rows={3}
                required
                value={changeDesc}
                onChange={(e) => setChangeDesc(e.target.value)}
                placeholder="Detail what features, integrations, or workflows you would like added or adjusted..."
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-neutral-300 block mb-1">
                  Estimated Budget Delta ($ USD):
                </label>
                <input
                  type="number"
                  value={changeBudget}
                  onChange={(e) => setChangeBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono"
                />
              </div>
              <div>
                <label className="font-mono text-neutral-300 block mb-1">
                  Estimated Timeline Delta (Days):
                </label>
                <input
                  type="number"
                  value={changeDays}
                  onChange={(e) => setChangeDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold"
              >
                Submit Request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
