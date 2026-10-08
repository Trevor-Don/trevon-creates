// Core Data Models matching docs/PROJECT_SPEC.md and docs/ARCHITECTURE.md

export type UserRole = 'admin' | 'client' | 'anonymous';

export interface User {
  id: string;
  firebaseUid?: string;
  email: string;
  role: 'admin' | 'client';
  name: string;
  company?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  description: string;
  budgetRange: string;
  timeline: string;
  status: LeadStatus;
  notes?: string;
  convertedClientId?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp: string;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type StageStatus = 'upcoming' | 'current' | 'done';
export type TaskOwner = 'admin' | 'client';
export type TaskType = 'form' | 'upload' | 'approval' | 'payment' | 'link' | 'call' | 'document' | 'info';
export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'done' | 'blocked';

export interface Task {
  id: string;
  projectId: string;
  stageId: string;
  title: string;
  description: string;
  owner: TaskOwner;
  type: TaskType;
  status: TaskStatus;
  dueDate?: string;
  config?: {
    formFields?: Array<{ id: string; label: string; type: 'text' | 'textarea' | 'url' | 'select'; required?: boolean }>;
    documentId?: string;
    approvalUrl?: string;
    targetAmount?: number;
    externalLink?: string;
  };
  response?: {
    formData?: Record<string, string>;
    submittedAt?: string;
    submittedBy?: string;
    notes?: string;
    rejectionReason?: string;
  };
  completedAt?: string;
  position: number;
}

export interface Stage {
  id: string;
  projectId: string;
  name: string;
  position: number;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  visibleToClient: boolean;
}

export interface Deliverable {
  id: string;
  projectId: string;
  stageId?: string;
  title: string;
  kind: 'link' | 'file';
  url: string;
  version?: string;
  description?: string;
  visibleToClient: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  type: 'contract' | 'msa' | 'scope' | 'nda';
  title: string;
  content: string; // Markdown / prose
  status: 'draft' | 'sent' | 'signed';
  signedAt?: string;
  signedName?: string;
  signedIp?: string;
  secureToken?: string;
  signatureData?: string;
  responseNotes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  number: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  paymentLink?: string;
  secureToken?: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
  items?: Array<{ description: string; quantity: number; unitPrice: number }>;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  authorName: string;
  authorRole: 'admin' | 'client';
  title: string;
  body: string;
  createdAt: string;
  category?: 'milestone' | 'technical' | 'blocker' | 'general';
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  description: string;
  budgetDelta: number;
  timelineDeltaDays: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: string;
  responseNotes?: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  scope: string;
  requirements: string;
  status: ProjectStatus;
  templateId?: string;
  budgetAmount: number;
  currency: string;
  startDate: string;
  targetEndDate: string;
  currentStageId: string;
  releasedToClient: boolean;
  stages: Stage[];
  tasks: Task[];
  deliverables: Deliverable[];
  documents: Document[];
  invoices: Invoice[];
  updates: ProjectUpdate[];
  changeRequests: ChangeRequest[];
  createdAt: string;
}

export interface TemplateTask {
  id: string;
  title: string;
  description: string;
  owner: TaskOwner;
  type: TaskType;
  position: number;
  config?: any;
}

export interface TemplateStage {
  id: string;
  name: string;
  position: number;
  tasks: TemplateTask[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  stages: TemplateStage[];
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  client: string;
  summary: string;
  body: string;
  coverImage?: string;
  tags: string[];
  metrics: Array<{ label: string; value: string }>;
  architecturePoints: string[];
  liveUrl?: string;
  published: boolean;
  featured: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  roleCompany: string;
  quote: string;
  projectId?: string;
  projectTitle: string;
  avatar?: string;
  published: boolean;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'lead' | 'project' | 'task' | 'invoice' | 'document' | 'update';
}

export interface LandingPageConfig {
  id: string;
  headlinePre: string;
  headlineMain: string;
  headlineHighlight: string;
  subheadline: string;
  availabilityBadge: string;
  locationBadge: string;
  coreValues: string[];
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderExperienceYears: string;
  founderDailyActions: string;
  whatsappNumber: string;
  featuredProjectIds: string[];
  updatedAt: string;
}

export interface StudioService {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  deliverables: string[];
  startingPriceKES: number;
  startingPriceUSD: number;
  timeline: string;
  icon: string;
  popular?: boolean;
  active: boolean;
}

export interface PricingPackage {
  id: string;
  name: string;
  badge?: string;
  priceKES: number;
  priceUSD: number;
  billingPeriod: string;
  deliveryTime: string;
  description: string;
  features: string[];
  highlight?: boolean;
  depositRequiredPercent: number;
  active: boolean;
}

export interface ClientReview {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAvatar?: string;
  projectId?: string;
  projectTitle?: string;
  serviceId?: string;
  serviceName: string;
  rating: number; // 1 to 5
  headline: string;
  comment: string;
  wouldRecommend: boolean;
  googleBusinessReady: boolean;
  status: 'published' | 'pending' | 'featured';
  createdAt: string;
  verifiedClient: boolean;
}

export interface StudioSettings {
  studioName: string;
  adminEmail: string;
  whatsappNumber: string;
  currency: string;
  resendConfigured: boolean;
  cloudRunEndpoint: string;
  googleBusinessProfileUrl?: string;
  googleBusinessPlaceId?: string;
  defaultDepositPercent?: number;
  hourlyRateUSD?: number;
  hourlyRateKES?: number;
  mpesaPaybillOrTill?: string;
  bankTransferDetails?: string;
  bookingNotice?: string;
}
