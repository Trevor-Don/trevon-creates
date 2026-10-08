import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SecureDocumentModal } from '../secure/SecureDocumentModal';
import { Lead, Project, Task, LeadStatus, Document, Invoice } from '../../types';
import {
  Shield,
  Users,
  Briefcase,
  Layers,
  Settings,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Check,
  Send,
  UserCheck,
  Menu,
  X,
  Copy,
  Lock,
  Globe,
  LayoutDashboard,
  CreditCard,
  FileCheck,
  RefreshCw,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    leads,
    updateLeadStatus,
    convertLeadToClient,
    projects,
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    advanceStage,
    approveTask,
    rejectTask,
    createTask,
    createInvoice,
    addDeliverable,
    toggleDeliverableVisibility,
    postProjectUpdate,
    approveChangeRequest,
    templates,
    portfolio,
    updatePortfolioItem,
    landingConfig,
    updateLandingConfig,
    firestoreConnected,
    activityLog,
    settings,
    updateSettings,
    switchUser,
    navigateTo,
    setSurface,
  } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'leads' | 'projects' | 'documents' | 'invoices' | 'landing' | 'templates' | 'settings'
  >('dashboard');

  // Landing Page CMS form state
  const [landingFormData, setLandingFormData] = useState(landingConfig);
  const [isSavingLanding, setIsSavingLanding] = useState(false);
  const [landingSaveMessage, setLandingSaveMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (landingConfig) {
      setLandingFormData(landingConfig);
    }
  }, [landingConfig]);

  // Mobile sidebar toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Secure Document Modal
  const [secureDocModalOpen, setSecureDocModalOpen] = useState(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<Document | null>(null);
  const [selectedInvForModal, setSelectedInvForModal] = useState<Invoice | null>(null);
  const [selectedProjForModal, setSelectedProjForModal] = useState<Project | null>(null);

  // Copied link toast notification
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Lead Conversion Wizard Modal
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-web-app-build');
  const [projectBudget, setProjectBudget] = useState<number>(15000);
  const [targetDate, setTargetDate] = useState<string>('2026-11-30');

  // Task creation modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState<'admin' | 'client'>('client');
  const [newTaskType, setNewTaskType] = useState<any>('approval');

  // Task rejection prompt modal
  const [rejectingTask, setRejectingTask] = useState<Task | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Invoice creation modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invDesc, setInvDesc] = useState('');
  const [invAmount, setInvAmount] = useState(5000);
  const [invCurrency, setInvCurrency] = useState(settings.currency || 'USD');

  // Deliverable modal
  const [showDelModal, setShowDelModal] = useState(false);
  const [delTitle, setDelTitle] = useState('');
  const [delUrl, setDelUrl] = useState('');
  const [delVersion, setDelVersion] = useState('v1.0.0');

  // Project update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updTitle, setUpdTitle] = useState('');
  const [updBody, setUpdBody] = useState('');

  // Active project tab inside projects manager
  const [projectSection, setProjectSection] = useState<'stages' | 'tasks' | 'deliverables' | 'updates' | 'changes'>('tasks');

  // Quick calculations
  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const totalContractValue = projects.reduce((sum, p) => sum + p.budgetAmount, 0);

  // Pending client submissions across active project
  const pendingSubmissions = (currentProject?.tasks || []).filter((t) => t.status === 'submitted');

  // Aggregate documents and invoices across all projects
  const allDocuments = projects.flatMap((p) =>
    p.documents.map((d) => ({ ...d, projectTitle: p.title, projectObj: p }))
  );
  const allInvoices = projects.flatMap((p) =>
    p.invoices.map((i) => ({ ...i, projectTitle: p.title, projectObj: p }))
  );

  const pendingDocsCount = allDocuments.filter((d) => d.status !== 'signed').length;
  const unpaidInvoicesCount = allInvoices.filter((i) => i.status !== 'paid').length;

  const handleCopySecureLink = (item: Document | Invoice, proj: Project) => {
    const token = item.secureToken || item.id;
    const isDoc = 'content' in item;
    const link = `${window.location.origin}/portal?secureToken=${token}&type=${isDoc ? 'doc' : 'inv'}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleOpenSecureModal = (item: Document | Invoice, proj: Project) => {
    setSelectedProjForModal(proj);
    if ('content' in item) {
      setSelectedDocForModal(item as Document);
      setSelectedInvForModal(null);
    } else {
      setSelectedInvForModal(item as Invoice);
      setSelectedDocForModal(null);
    }
    setSecureDocModalOpen(true);
  };

  const handleConvertLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;
    const res = convertLeadToClient(convertingLead.id, selectedTemplateId, projectBudget, targetDate);
    if (res) {
      setConvertingLead(null);
      setActiveTab('projects');
      setProjectSection('tasks');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !newTaskTitle.trim()) return;
    createTask(currentProject.id, currentProject.currentStageId, {
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      owner: newTaskOwner,
      type: newTaskType,
    });
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !rejectingTask || !rejectReason.trim()) return;
    rejectTask(currentProject.id, rejectingTask.id, rejectReason.trim());
    setRejectingTask(null);
    setRejectReason('');
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !invDesc.trim()) return;
    createInvoice(currentProject.id, {
      description: invDesc.trim(),
      amount: Number(invAmount),
      currency: invCurrency,
    });
    setShowInvoiceModal(false);
    setInvDesc('');
  };

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !delTitle.trim() || !delUrl.trim()) return;
    addDeliverable(currentProject.id, {
      title: delTitle.trim(),
      url: delUrl.trim(),
      version: delVersion.trim(),
    });
    setShowDelModal(false);
    setDelTitle('');
    setDelUrl('');
  };

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !updTitle.trim() || !updBody.trim()) return;
    postProjectUpdate(currentProject.id, updTitle.trim(), updBody.trim());
    setShowUpdateModal(false);
    setUpdTitle('');
    setUpdBody('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col lg:flex-row transition-colors duration-200">
      {/* ========================================================
          SIDE PANEL (LEFT SIDEBAR NAVIGATION)
         ======================================================== */}
      {/* Mobile Drawer Backdrop */}
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
          {/* 1. Sidebar Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFAE00]/10 border border-[#FFAE00]/40 flex items-center justify-center text-[#FFAE00] shadow-[0_0_15px_rgba(255,174,0,0.2)]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-sm tracking-tight text-white">
                    TREVON CREATES
                  </span>
                  <Badge label="STUDIO ADMIN" variant="orange" />
                </div>
                <div className="font-mono text-[11px] text-neutral-400">
                  Trevor Don • Lead Systems Architect
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

          {/* 2. Active Project Quick Selector */}
          <div className="p-4 border-b border-white/5 bg-black/40">
            <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block mb-1.5">
              ACTIVE CLIENT PROJECT
            </label>
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#0D120E] border border-white/15 text-xs font-mono text-white focus:border-[#FFAE00] focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Main Navigation Menu */}
          <nav className="p-3 space-y-1 flex-1 font-mono text-xs">
            {/* Overview */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Studio Overview</span>
              </div>
            </button>

            {/* Leads Pipeline */}
            <button
              onClick={() => {
                setActiveTab('leads');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Client Inquiries</span>
              </div>
              {newLeadsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#00FF00] text-black font-bold text-[10px]">
                  {newLeadsCount} new
                </span>
              )}
            </button>

            {/* Projects & Stages */}
            <button
              onClick={() => {
                setActiveTab('projects');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4" />
                <span>Projects &amp; Sprints</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-500">
                {projects.length}
              </span>
            </button>

            {/* Contracts & Legal (Dedicated) */}
            <button
              onClick={() => {
                setActiveTab('documents');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4" />
                <span>Contracts &amp; Legal</span>
              </div>
              {pendingDocsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FFAE00]/20 text-[#FFAE00] font-bold text-[10px] border border-[#FFAE00]/40">
                  {pendingDocsCount}
                </span>
              )}
            </button>

            {/* Invoices & Billing (Dedicated) */}
            <button
              onClick={() => {
                setActiveTab('invoices');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4" />
                <span>Invoices &amp; Billing</span>
              </div>
              {unpaidInvoicesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold text-[10px] border border-red-500/40">
                  {unpaidInvoicesCount}
                </span>
              )}
            </button>

            {/* Landing Page CMS */}
            <button
              onClick={() => {
                setActiveTab('landing');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'landing'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#00FF00]" />
                <span>Landing Page CMS</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#00FF00]/10 text-[#00FF00] font-bold text-[10px] border border-[#00FF00]/30">
                LIVE
              </span>
            </button>

            {/* Workflow Templates */}
            <button
              onClick={() => {
                setActiveTab('templates');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Workflow Templates</span>
              </div>
            </button>

            {/* Studio Settings */}
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#FFAE00]/15 text-[#FFAE00] font-bold border border-[#FFAE00]/40 shadow-[0_0_12px_rgba(255,174,0,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Studio Settings</span>
              </div>
            </button>
          </nav>

          {/* 4. Bottom Utilities & Quick Jump */}
          <div className="p-4 border-t border-white/10 space-y-2 bg-black/60 font-mono text-xs">
            <button
              onClick={() => {
                switchUser('client');
                setSurface('client');
              }}
              className="w-full py-2 px-3 rounded bg-white/5 hover:bg-[#00FF00]/15 border border-white/10 hover:border-[#00FF00]/40 text-neutral-300 hover:text-[#00FF00] flex items-center justify-between transition-all cursor-pointer text-[11px]"
            >
              <span>Preview Client Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

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

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" />
                LIVE SYNC
              </span>
              <span>HOST: CLOUD RUN</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA (RIGHT SIDE)
         ======================================================== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Mission Control Bar */}
        <header className="sticky top-0 z-30 bg-[#080B09]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded bg-white/5 text-neutral-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="font-mono text-[10px] text-[#FFAE00] uppercase tracking-wider">
                STUDIO EXECUTIVE CONSOLE
              </div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight capitalize">
                {activeTab === 'dashboard'
                  ? 'Operations Overview & Dashboard'
                  : activeTab === 'leads'
                  ? 'Client Inquiries & Intake'
                  : activeTab === 'projects'
                  ? `${currentProject?.title || 'Projects & Sprints'}`
                  : activeTab === 'documents'
                  ? 'Contracts & Agreements'
                  : activeTab === 'invoices'
                  ? 'Invoices & Billing Gateway'
                  : activeTab === 'landing'
                  ? 'Landing Page CMS & Content Editor'
                  : activeTab === 'templates'
                  ? 'Workflow Engine Templates'
                  : 'Studio Configuration'}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'projects' && (
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-3 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,0,0.3)] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            )}

            {activeTab === 'invoices' && (
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-3 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,0,0.3)] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invoice</span>
              </button>
            )}

            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-neutral-300 hover:text-white flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00FF00]" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </header>

        {/* Content Body Container */}
        <div className="p-4 sm:p-8 space-y-8 flex-1 max-w-7xl w-full">
          {/* ========================================================
              TAB 1: MISSION CONTROL OVERVIEW
             ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                    <span>INCOMING LEADS</span>
                    <Users className="w-4 h-4 text-[#FFAE00]" />
                  </div>
                  <div className="font-heading text-3xl font-bold text-white">
                    {leads.length}
                  </div>
                  <div className="font-mono text-[11px] text-[#00FF00]">
                    {newLeadsCount} NEW AWAITING TRIAGE
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                    <span>ACTIVE PROJECTS</span>
                    <Briefcase className="w-4 h-4 text-[#00FF00]" />
                  </div>
                  <div className="font-heading text-3xl font-bold text-white">
                    {activeProjectsCount}
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    ACROSS SPRINT PIPELINES
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                    <span>CONTRACT VALUE</span>
                    <DollarSign className="w-4 h-4 text-[#00FF00]" />
                  </div>
                  <div className="font-heading text-3xl font-bold text-white">
                    KES {(totalContractValue * 130).toLocaleString()}
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    EST. ${totalContractValue.toLocaleString()} USD
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                    <span>AWAITING APPROVAL</span>
                    <Clock className="w-4 h-4 text-[#FFAE00]" />
                  </div>
                  <div className="font-heading text-3xl font-bold text-[#FFAE00]">
                    {pendingSubmissions.length}
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    PENDING CLIENT SUBMISSIONS
                  </div>
                </div>
              </div>

              {/* Submissions Waiting On Trevor */}
              {pendingSubmissions.length > 0 && (
                <div className="p-6 rounded-xl bg-[#FFAE00]/10 border border-[#FFAE00]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#FFAE00]" />
                      <h2 className="font-heading text-base font-bold text-white">
                        Client Submissions Waiting for Your Approval ({pendingSubmissions.length})
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-neutral-400">
                      PROJECT: {currentProject?.title}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pendingSubmissions.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-white text-sm">{task.title}</div>
                          <p className="text-xs text-neutral-400">{task.description}</p>
                          {task.response?.submittedBy && (
                            <div className="font-mono text-[11px] text-neutral-500">
                              Submitted by {task.response.submittedBy} at {task.response.submittedAt?.split('T')[0]}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveTask(currentProject!.id, task.id)}
                            className="px-3 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingTask(task)}
                            className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-heading font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity Log */}
              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#00FF00]" />
                    <h2 className="font-heading text-base font-bold text-white">
                      System Activity &amp; Audit Trail
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-neutral-500">
                    REAL-TIME LEDGER
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {activityLog.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 text-neutral-300">
                        <span className="text-[#00FF00] font-bold">[{log.type.toUpperCase()}]</span>
                        <span className="text-white font-medium">{log.action}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400">{log.target}</span>
                      </div>
                      <span className="text-neutral-500 text-[11px] shrink-0">
                        {log.timestamp.split('T')[1]?.slice(0, 8) || log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: LEADS PIPELINE
             ======================================================== */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Public Inquiry Leads ({leads.length})
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Intake from public contact forms, automated WhatsApp triggers, and direct client inquiries.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-5 rounded-xl bg-[#080B09] border border-white/10 space-y-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-base font-bold text-white">
                            {lead.name}
                          </h3>
                          <Badge
                            label={lead.status.toUpperCase()}
                            variant={
                              lead.status === 'new'
                                ? 'green'
                                : lead.status === 'qualified'
                                ? 'orange'
                                : lead.status === 'converted'
                                ? 'cyan'
                                : 'neutral'
                            }
                          />
                        </div>
                        <div className="font-mono text-xs text-neutral-400 flex flex-wrap gap-3 mt-1">
                          <span>{lead.email}</span>
                          <span>•</span>
                          <span>{lead.phone}</span>
                          <span>•</span>
                          <span className="text-[#00FF00]">{lead.projectType}</span>
                        </div>
                      </div>

                      {/* Lead Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="px-2.5 py-1.5 rounded bg-black border border-white/20 font-mono text-xs text-neutral-200"
                        >
                          <option value="new">Mark New</option>
                          <option value="contacted">Mark Contacted</option>
                          <option value="qualified">Mark Qualified</option>
                          <option value="lost">Mark Lost</option>
                        </select>

                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => setConvertingLead(lead)}
                            className="px-3 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Convert to Client</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 font-sans bg-black/40 p-3 rounded border border-white/5 leading-relaxed">
                      {lead.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-neutral-400 pt-1">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">BUDGET:</span>
                        <span className="text-white font-bold">{lead.budgetRange}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">TIMELINE:</span>
                        <span className="text-white font-bold">{lead.timeline}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">SUBMITTED:</span>
                        <span>{lead.createdAt.split('T')[0]}</span>
                      </div>
                      <div>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#00FF00] hover:underline flex items-center gap-1 mt-3"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: PROJECTS & STAGES
             ======================================================== */}
          {activeTab === 'projects' && currentProject && (
            <div className="space-y-6">
              {/* Project Header Bar */}
              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge label={`STATUS: ${currentProject.status.toUpperCase()}`} variant="green" />
                      <span className="font-mono text-xs text-neutral-400">
                        BUDGET: ${currentProject.budgetAmount.toLocaleString()} {currentProject.currency}
                      </span>
                    </div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {currentProject.title}
                    </h2>
                    <p className="text-xs text-neutral-400 max-w-2xl mt-1">
                      {currentProject.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => advanceStage(currentProject.id)}
                      className="px-4 py-2 rounded bg-[#FFAE00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,174,0,0.3)] cursor-pointer transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>Advance Next Stage</span>
                    </button>
                  </div>
                </div>

                {/* Stages Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-white/5">
                  {currentProject.stages.map((stage) => {
                    const isCurrent = stage.id === currentProject.currentStageId;
                    const isDone = stage.status === 'done';
                    return (
                      <div
                        key={stage.id}
                        className={`p-2.5 rounded text-center border font-mono text-xs transition-all ${
                          isCurrent
                            ? 'bg-[#FFAE00]/15 border-[#FFAE00] text-[#FFAE00] font-bold shadow-[0_0_10px_rgba(255,174,0,0.2)]'
                            : isDone
                            ? 'bg-black/50 border-white/10 text-neutral-400 line-through'
                            : 'bg-black/20 border-white/5 text-neutral-600'
                        }`}
                      >
                        <div className="truncate font-semibold">{stage.name}</div>
                        <div className="text-[9px] uppercase tracking-wider mt-0.5">
                          {isCurrent ? '[ACTIVE]' : isDone ? '[DONE]' : '[UPCOMING]'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-navigation tabs within project */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5 font-mono text-xs overflow-x-auto">
                  <button
                    onClick={() => setProjectSection('tasks')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      projectSection === 'tasks'
                        ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Sprint Tasks ({currentProject.tasks.length})
                  </button>

                  <button
                    onClick={() => setProjectSection('deliverables')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      projectSection === 'deliverables'
                        ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Deliverables ({currentProject.deliverables.length})
                  </button>

                  <button
                    onClick={() => setProjectSection('updates')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      projectSection === 'updates'
                        ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Updates ({currentProject.updates.length})
                  </button>

                  <button
                    onClick={() => setProjectSection('changes')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      projectSection === 'changes'
                        ? 'bg-[#00FF00]/15 text-[#00FF00] font-bold border border-[#00FF00]/40'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Change Requests ({currentProject.changeRequests.length})
                  </button>
                </div>
              </div>

              {/* Project Sub-sections */}
              {projectSection === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-white">
                      Task Checklist &amp; Approvals
                    </h3>
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00FF00]" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentProject.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-[#080B09] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-white text-sm">
                              {task.title}
                            </span>
                            <Badge
                              label={task.owner === 'admin' ? 'TREVOR' : 'CLIENT'}
                              variant={task.owner === 'admin' ? 'orange' : 'cyan'}
                            />
                            <Badge
                              label={task.status.toUpperCase()}
                              variant={
                                task.status === 'approved' || task.status === 'done'
                                  ? 'green'
                                  : task.status === 'submitted'
                                  ? 'orange'
                                  : 'neutral'
                              }
                            />
                          </div>
                          <p className="text-xs text-neutral-400">{task.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => approveTask(currentProject.id, task.id)}
                                className="px-3 py-1 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingTask(task)}
                                className="px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projectSection === 'deliverables' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-white">
                      Artifacts &amp; Deliverables
                    </h3>
                    <button
                      onClick={() => setShowDelModal(true)}
                      className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00FF00]" />
                      <span>Add Deliverable</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentProject.deliverables.map((del) => (
                      <div
                        key={del.id}
                        className="p-4 rounded-xl bg-[#080B09] border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{del.title}</span>
                          <span className="font-mono text-xs text-[#00FF00]">{del.version}</span>
                        </div>
                        <p className="text-xs text-neutral-400">{del.description}</p>
                        <div className="pt-2 flex items-center justify-between font-mono text-xs">
                          <a
                            href={del.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#00FF00] hover:underline flex items-center gap-1"
                          >
                            <span>Open URL</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => toggleDeliverableVisibility(currentProject.id, del.id)}
                            className="text-neutral-400 hover:text-white"
                          >
                            {del.visibleToClient ? 'Visible to Client' : 'Hidden'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projectSection === 'updates' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-white">
                      Project Updates Feed
                    </h3>
                    <button
                      onClick={() => setShowUpdateModal(true)}
                      className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00FF00]" />
                      <span>Post Update</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentProject.updates.map((upd) => (
                      <div
                        key={upd.id}
                        className="p-4 rounded-xl bg-[#080B09] border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-[#00FF00] font-bold">{upd.title}</span>
                          <span className="text-neutral-500">{upd.createdAt.split('T')[0]}</span>
                        </div>
                        <p className="text-xs text-neutral-300 font-sans whitespace-pre-line">
                          {upd.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projectSection === 'changes' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white">
                    Change Requests
                  </h3>
                  {currentProject.changeRequests.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#080B09] border border-white/5 text-center text-xs font-mono text-neutral-500">
                      No change requests submitted.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentProject.changeRequests.map((cr) => (
                        <div
                          key={cr.id}
                          className="p-4 rounded-xl bg-[#080B09] border border-white/10 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{cr.description}</span>
                            <Badge
                              label={cr.status.toUpperCase()}
                              variant={cr.status === 'approved' ? 'green' : 'orange'}
                            />
                          </div>
                          <div className="font-mono text-xs text-neutral-400 flex gap-4">
                            <span>Budget delta: +${cr.budgetDelta}</span>
                            <span>Timeline delta: +{cr.timelineDeltaDays} days</span>
                          </div>
                          {cr.status === 'pending' && (
                            <div className="pt-2 flex gap-2">
                              <button
                                onClick={() => approveChangeRequest(currentProject.id, cr.id, true)}
                                className="px-3 py-1 rounded bg-[#00FF00] hover:bg-white text-black font-bold text-xs font-heading"
                              >
                                Approve &amp; Adjust Budget
                              </button>
                              <button
                                onClick={() => approveChangeRequest(currentProject.id, cr.id, false)}
                                className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-xs font-mono"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 4: CONTRACTS & LEGAL INSTRUMENTS (NEW SECURE PANEL)
             ======================================================== */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Contracts, MSAs &amp; Legal Instruments ({allDocuments.length})
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Generate secure links for clients to sign MSAs, scope documents, and NDAs. Signatures are audited and updated directly to the dashboard.
                  </p>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-4">
                {allDocuments.map((doc) => {
                  const token = doc.secureToken || doc.id;
                  const isCopied = copiedToken === token;
                  return (
                    <div
                      key={doc.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-base font-bold text-white">
                              {doc.title}
                            </span>
                            <Badge
                              label={doc.type.toUpperCase()}
                              variant="cyan"
                            />
                            <Badge
                              label={doc.status === 'signed' ? 'DIGITALLY SIGNED' : 'PENDING SIGNATURE'}
                              variant={doc.status === 'signed' ? 'green' : 'orange'}
                            />
                          </div>
                          <div className="font-mono text-xs text-neutral-400">
                            PROJECT: <span className="text-white">{doc.projectTitle}</span> • DISPATCHED: {doc.createdAt.split('T')[0]}
                          </div>
                        </div>

                        {/* Secure Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleCopySecureLink(doc, doc.projectObj)}
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
                                <span>Copy Secure Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenSecureModal(doc, doc.projectObj)}
                            className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,0,0.3)]"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Preview &amp; Review</span>
                          </button>
                        </div>
                      </div>

                      {/* Audit Details if Signed */}
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
                            <span className="text-neutral-500">IP ADDRESS:</span>{' '}
                            <span>{doc.signedIp}</span>
                          </div>
                          {doc.responseNotes && (
                            <div className="w-full text-neutral-400 border-t border-[#00FF00]/10 pt-1">
                              <span className="text-white font-semibold">Response note:</span> {doc.responseNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: INVOICES & BILLING (NEW SECURE PANEL)
             ======================================================== */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Invoices &amp; Payment Gateway ({allInvoices.length})
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Share secure checkout links for instant M-Pesa STK push or card settlement. Reconciliations immediately update dashboard project balances.
                  </p>
                </div>

                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-4 py-2 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,0,0.3)] cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate New Invoice</span>
                </button>
              </div>

              {/* Invoices List */}
              <div className="space-y-4">
                {allInvoices.map((inv) => {
                  const token = inv.secureToken || inv.id;
                  const isCopied = copiedToken === token;
                  return (
                    <div
                      key={inv.id}
                      className="p-5 rounded-xl bg-[#080B09] border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-base font-bold text-white">
                              {inv.number}
                            </span>
                            <span className="text-neutral-600">•</span>
                            <span className="font-heading text-sm text-neutral-300">
                              {inv.description}
                            </span>
                            <Badge
                              label={inv.status === 'paid' ? 'SETTLED & PAID' : 'PENDING SETTLEMENT'}
                              variant={inv.status === 'paid' ? 'green' : 'orange'}
                            />
                          </div>
                          <div className="font-mono text-xs text-neutral-400">
                            PROJECT: <span className="text-white">{inv.projectTitle}</span> • DUE: {inv.dueDate}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="font-mono font-bold text-lg text-[#00FF00]">
                            {inv.amount.toLocaleString()} {inv.currency}
                          </div>

                          <button
                            onClick={() => handleCopySecureLink(inv, inv.projectObj)}
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
                                <span>Copy Payment Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenSecureModal(inv, inv.projectObj)}
                            className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,0,0.3)]"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Open Gateway</span>
                          </button>
                        </div>
                      </div>

                      {/* Settlement details if paid */}
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
                            <span className="text-neutral-500">TRANSACTION REF:</span>{' '}
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
              TAB 6: WORKFLOW TEMPLATES
             ======================================================== */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Workflow Engine Templates ({templates.length})
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Pre-configured project pipelines containing automated stages, contract milestones, and task checklists.
                </p>
              </div>

              <div className="space-y-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-white">
                          {tpl.name}
                        </h3>
                        <p className="text-xs text-neutral-400 font-sans">{tpl.description}</p>
                      </div>
                      <Badge label={`${tpl.stages.length} STAGES`} variant="cyan" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                      {tpl.stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-2"
                        >
                          <div className="font-mono text-xs text-[#00FF00] font-bold">
                            Stage {stage.position}: {stage.name}
                          </div>
                          <div className="font-mono text-[11px] text-neutral-400 space-y-1">
                            {stage.tasks.map((t) => (
                              <div key={t.id} className="truncate">
                                • [{t.owner}] {t.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: LANDING PAGE CMS & CONTENT EDITOR
             ======================================================== */}
          {activeTab === 'landing' && (
            <div className="space-y-8 max-w-5xl">
              {/* Header with Status and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#080B09] border border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#00FF00] uppercase tracking-wider font-semibold">
                      LANDING PAGE CONTENT MANAGEMENT
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      firestoreConnected ? 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30' : 'bg-[#FFAE00]/10 text-[#FFAE00] border border-[#FFAE00]/30'
                    }`}>
                      {firestoreConnected ? '● CLOUD FIRESTORE ACTIVE' : '○ LOCAL STORAGE BACKED'}
                    </span>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Public Portfolio Content Editor
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5">
                    Modifications update directly in Cloud Firestore and reflect immediately across the public website.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSurface('public');
                      navigateTo('/');
                    }}
                    className="px-3.5 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#00FF00]" />
                    <span>View Live Site</span>
                  </button>

                  <button
                    onClick={async () => {
                      setIsSavingLanding(true);
                      try {
                        await updateLandingConfig(landingFormData);
                        setLandingSaveMessage('Published to Cloud Firestore & Live Site!');
                        setTimeout(() => setLandingSaveMessage(null), 3500);
                      } catch (err) {
                        setLandingSaveMessage('Saved to local store.');
                      } finally {
                        setIsSavingLanding(false);
                      }
                    }}
                    disabled={isSavingLanding}
                    className="px-4 py-2 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs shadow-[0_0_15px_rgba(0,255,0,0.4)] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingLanding ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save &amp; Publish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {landingSaveMessage && (
                <div className="p-3.5 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/40 text-[#00FF00] font-mono text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{landingSaveMessage}</span>
                </div>
              )}

              {/* 1. Hero Section & Main Copy */}
              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-5">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00FF00]" />
                      <span>Hero Section Copy &amp; Badges</span>
                    </h3>
                    <p className="text-xs text-neutral-400 font-sans">
                      The primary headline, availability signals, and introductory paragraph seen above the fold.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Kicker / Pre-Headline</label>
                    <input
                      type="text"
                      value={landingFormData.headlinePre || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, headlinePre: e.target.value })}
                      placeholder="CRAFTING BESPOKE DIGITAL PLATFORMS..."
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-mono text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Main Headline Part 1</label>
                    <input
                      type="text"
                      value={landingFormData.headlineMain || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, headlineMain: e.target.value })}
                      placeholder="DIGITAL VISIONS INTO"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-sans font-bold text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Highlighted Headline Gradient Phrase</label>
                    <input
                      type="text"
                      value={landingFormData.headlineHighlight || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, headlineHighlight: e.target.value })}
                      placeholder="SLEEK, FUNCTIONAL"
                      className="w-full px-3 py-2 rounded bg-black border border-[#00FF00]/40 text-[#00FF00] font-sans font-bold text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Availability Badge Text</label>
                    <input
                      type="text"
                      value={landingFormData.availabilityBadge || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, availabilityBadge: e.target.value })}
                      placeholder="AVAILABLE FOR NEW PROJECTS"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-mono text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-mono text-neutral-300 block">Location &amp; Remote Signal</label>
                    <input
                      type="text"
                      value={landingFormData.locationBadge || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, locationBadge: e.target.value })}
                      placeholder="NAIROBI & GLOBAL REMOTE"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-mono text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-mono text-neutral-300 block">Hero Narrative &amp; Subheadline</label>
                    <textarea
                      rows={3}
                      value={landingFormData.subheadline || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, subheadline: e.target.value })}
                      placeholder="End-to-end UI/UX product design..."
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-sans text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-mono text-neutral-300 block">Core Values (Comma Separated)</label>
                    <input
                      type="text"
                      value={(landingFormData.coreValues || []).join(', ')}
                      onChange={(e) =>
                        setLandingFormData({
                          ...landingFormData,
                          coreValues: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Purposeful Design, Clean Execution, Agile Innovation, Digital Mastery"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-sans text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(landingFormData.coreValues || []).map((val, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[#00FF00]">
                          #{val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Founder & Architect Spotlight */}
              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#FFAE00]" />
                    <span>Founder Spotlight &amp; Qualifications Credentials</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Information displayed in the founder portrait card, about sections, and verified qualifications matrix.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Founder Name</label>
                    <input
                      type="text"
                      value={landingFormData.founderName || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, founderName: e.target.value })}
                      placeholder="TREVOR DON"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-heading font-bold text-xs focus:border-[#FFAE00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Professional Title &amp; Role</label>
                    <input
                      type="text"
                      value={landingFormData.founderRole || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, founderRole: e.target.value })}
                      placeholder="Lead Systems Architect & Senior UI/UX Designer"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-sans text-xs focus:border-[#FFAE00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Experience Stat</label>
                    <input
                      type="text"
                      value={landingFormData.founderExperienceYears || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, founderExperienceYears: e.target.value })}
                      placeholder="5+ Years"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-mono text-xs focus:border-[#FFAE00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-neutral-300 block">Daily Actions / Ops Stat</label>
                    <input
                      type="text"
                      value={landingFormData.founderDailyActions || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, founderDailyActions: e.target.value })}
                      placeholder="50,000+"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-mono text-xs focus:border-[#FFAE00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-mono text-neutral-300 block">Verified WhatsApp Concierge Number</label>
                    <input
                      type="text"
                      value={landingFormData.whatsappNumber || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, whatsappNumber: e.target.value })}
                      placeholder="+254142993925"
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-mono text-xs focus:border-[#00FF00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-mono text-neutral-300 block">Founder Bio &amp; Design Philosophy</label>
                    <textarea
                      rows={3}
                      value={landingFormData.founderBio || ''}
                      onChange={(e) => setLandingFormData({ ...landingFormData, founderBio: e.target.value })}
                      placeholder="I operate at the intersection of empathetic product design and production-grade software engineering..."
                      className="w-full px-3 py-2 rounded bg-black border border-white/15 text-white font-sans text-xs focus:border-[#FFAE00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Featured Portfolio Selection */}
              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-5">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#00FF00]" />
                      <span>Featured Projects on Landing Page</span>
                    </h3>
                    <p className="text-xs text-neutral-400 font-sans">
                      Select which verified case studies appear in the homepage featured grid.
                    </p>
                  </div>
                  <Badge
                    label={`${(landingFormData.featuredProjectIds || []).length} SELECTED`}
                    variant="green"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {portfolio.map((proj) => {
                    const isSelected = (landingFormData.featuredProjectIds || []).includes(proj.id);
                    return (
                      <div
                        key={proj.id}
                        onClick={() => {
                          const currentIds = landingFormData.featuredProjectIds || [];
                          const nextIds = isSelected
                            ? currentIds.filter((id) => id !== proj.id)
                            : [...currentIds, proj.id];
                          setLandingFormData({ ...landingFormData, featuredProjectIds: nextIds });
                        }}
                        className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-[#00FF00]/10 border-[#00FF00]/50 shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                            : 'bg-black/50 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-neutral-400 truncate max-w-[150px]">
                            {proj.client}
                          </span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? 'bg-[#00FF00] text-black'
                                : 'border border-white/20 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <h4 className="font-heading text-sm font-bold text-white">
                          {proj.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-sans line-clamp-2">
                          {proj.summary}
                        </p>
                        {proj.liveUrl && (
                          <div className="font-mono text-[10px] text-[#00FF00] flex items-center gap-1 pt-1 border-t border-white/5">
                            <span>Live: {proj.liveUrl.replace('https://', '').split('/')[0]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Save Action Bar */}
              <div className="p-4 rounded-xl bg-[#080B09] border border-white/10 flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-400">
                  Ready to deploy updates to live site?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLandingFormData(landingConfig)}
                    className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
                  >
                    Reset Form
                  </button>
                  <button
                    onClick={async () => {
                      setIsSavingLanding(true);
                      try {
                        await updateLandingConfig(landingFormData);
                        setLandingSaveMessage('Published to Cloud Firestore & Live Site!');
                        setTimeout(() => setLandingSaveMessage(null), 3500);
                      } catch (err) {
                        setLandingSaveMessage('Saved to local store.');
                      } finally {
                        setIsSavingLanding(false);
                      }
                    }}
                    className="px-5 py-2 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold text-xs shadow-[0_0_15px_rgba(0,255,0,0.4)] transition-all cursor-pointer"
                  >
                    Save &amp; Publish Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Studio Settings &amp; Configuration
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Manage owner credentials, verified WhatsApp business number, and currency formatting.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#080B09] border border-white/10 space-y-4 font-sans text-xs">
                <div className="space-y-1">
                  <label className="font-mono text-neutral-300 block">Studio Brand Name</label>
                  <input
                    type="text"
                    value={settings.studioName}
                    onChange={(e) => updateSettings({ studioName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-sans text-xs focus:border-[#FFAE00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-300 block">Owner / Admin Email</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => updateSettings({ adminEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs focus:border-[#FFAE00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-300 block">
                    Verified WhatsApp Business Number
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                    placeholder="+254142993925"
                    className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs focus:border-[#FFAE00] focus:outline-none"
                  />
                  <span className="font-mono text-[10px] text-neutral-500">
                    Lead notifications and secure document links will prefill to this number.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-300 block">Default Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSettings({ currency: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs focus:border-[#FFAE00] focus:outline-none"
                  >
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
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
        isOpen={secureDocModalOpen}
        onClose={() => setSecureDocModalOpen(false)}
        document={selectedDocForModal}
        invoice={selectedInvForModal}
        project={selectedProjForModal}
      />

      {/* 2. Lead Conversion Modal */}
      {convertingLead && (
        <Modal
          isOpen={true}
          onClose={() => setConvertingLead(null)}
          title={`Convert Lead to Client: ${convertingLead.name}`}
        >
          <form onSubmit={handleConvertLead} className="space-y-4 font-sans text-xs">
            <div>
              <label className="font-mono text-neutral-300 block mb-1">
                Select Project Template:
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.stages.length} Stages)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-neutral-300 block mb-1">Budget ($ USD):</label>
                <input
                  type="number"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-mono text-neutral-300 block mb-1">Target Delivery:</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold"
              >
                Create Client &amp; Launch Project
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Add Task Modal */}
      {showAddTaskModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddTaskModal(false)}
          title="Add New Sprint Task"
        >
          <form onSubmit={handleCreateTask} className="space-y-4 font-sans text-xs">
            <div>
              <label className="font-mono text-neutral-300 block mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Complete Onboarding Intake Form"
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white text-xs"
              />
            </div>

            <div>
              <label className="font-mono text-neutral-300 block mb-1">Description</label>
              <textarea
                rows={2}
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-neutral-300 block mb-1">Task Assignee:</label>
                <select
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
                >
                  <option value="client">Client</option>
                  <option value="admin">Trevor (Admin)</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-neutral-300 block mb-1">Task Type:</label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
                >
                  <option value="approval">Review / Approval</option>
                  <option value="form">Intake Form</option>
                  <option value="document">Legal Document</option>
                  <option value="payment">Milestone Payment</option>
                  <option value="link">Deliverable Link</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold"
              >
                Create Task
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. Reject Task Modal */}
      {rejectingTask && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingTask(null)}
          title={`Request Revision: ${rejectingTask.title}`}
        >
          <form onSubmit={handleConfirmReject} className="space-y-4 font-sans text-xs">
            <div>
              <label className="font-mono text-neutral-300 block mb-1">
                Reason for Revision Request *
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what needs adjustment before this task can be approved..."
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white text-xs"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingTask(null)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-red-500 hover:bg-white text-white hover:text-black font-heading font-bold"
              >
                Send Revision Request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. Create Invoice Modal */}
      {showInvoiceModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowInvoiceModal(false)}
          title="Create New Milestone Invoice"
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4 font-sans text-xs">
            <div>
              <label className="font-mono text-neutral-300 block mb-1">
                Milestone Description *
              </label>
              <input
                type="text"
                required
                value={invDesc}
                onChange={(e) => setInvDesc(e.target.value)}
                placeholder="e.g. Milestone 2: Cloud Run Deployment & API Cutover"
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-neutral-300 block mb-1">Amount *</label>
                <input
                  type="number"
                  required
                  value={invAmount}
                  onChange={(e) => setInvAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-neutral-300 block mb-1">Currency</label>
                <select
                  value={invCurrency}
                  onChange={(e) => setInvCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold"
              >
                Generate &amp; Dispatch
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. Add Deliverable Modal */}
      {showDelModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDelModal(false)}
          title="Add Project Deliverable Link"
        >
          <form onSubmit={handleAddDeliverable} className="space-y-4 font-sans text-xs">
            <div>
              <label className="font-mono text-neutral-300 block mb-1">Title *</label>
              <input
                type="text"
                required
                value={delTitle}
                onChange={(e) => setDelTitle(e.target.value)}
                placeholder="e.g. Staging Environment Preview"
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white text-xs"
              />
            </div>

            <div>
              <label className="font-mono text-neutral-300 block mb-1">URL *</label>
              <input
                type="url"
                required
                value={delUrl}
                onChange={(e) => setDelUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-mono text-neutral-300 block mb-1">Version</label>
              <input
                type="text"
                value={delVersion}
                onChange={(e) => setDelVersion(e.target.value)}
                placeholder="v1.0.0"
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white font-mono text-xs"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDelModal(false)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold"
              >
                Publish Deliverable
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Post Update Modal */}
      {showUpdateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowUpdateModal(false)}
          title="Post Project Milestone Update"
        >
          <form onSubmit={handlePostUpdate} className="space-y-4 font-sans text-xs">
            <div>
              <label className="font-mono text-neutral-300 block mb-1">Headline *</label>
              <input
                type="text"
                required
                value={updTitle}
                onChange={(e) => setUpdTitle(e.target.value)}
                placeholder="e.g. Sprint 2 Completed: STK Push Webhook Operational"
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white text-xs"
              />
            </div>

            <div>
              <label className="font-mono text-neutral-300 block mb-1">Update Body *</label>
              <textarea
                rows={4}
                required
                value={updBody}
                onChange={(e) => setUpdBody(e.target.value)}
                placeholder="Detail what was accomplished, deliverables published, and next steps..."
                className="w-full px-3 py-2 rounded bg-black border border-white/20 text-white text-xs"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-3 py-1.5 rounded bg-white/5 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#00FF00] hover:bg-white text-black font-heading font-bold"
              >
                Post to Client Feed
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
