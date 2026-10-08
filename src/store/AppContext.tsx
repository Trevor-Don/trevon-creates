import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Client,
  Lead,
  LeadStatus,
  Project,
  Task,
  TaskStatus,
  Deliverable,
  Document,
  Invoice,
  ProjectUpdate,
  ProjectTemplate,
  PortfolioItem,
  Testimonial,
  ActivityLog,
  LandingPageConfig,
  StudioService,
  PricingPackage,
  ClientReview,
  StudioSettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_LEADS,
  INITIAL_PROJECTS,
  DEFAULT_TEMPLATES,
  INITIAL_PORTFOLIO,
  INITIAL_TESTIMONIALS,
  INITIAL_ACTIVITY,
  INITIAL_LANDING_CONFIG,
  INITIAL_SERVICES,
  INITIAL_PRICING_PACKAGES,
  INITIAL_REVIEWS,
} from './initialData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

export type SurfaceType = 'public' | 'client' | 'admin';
export type ThemeMode = 'dark' | 'light';

interface AppContextType {
  surface: SurfaceType;
  setSurface: (surface: SurfaceType) => void;
  currentPath: string;
  navigateTo: (path: string) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  currentUser: User;
  firebaseUser: FirebaseUser | null;
  firebaseAuthLoading: boolean;
  firestoreConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  firebaseSignOut: () => Promise<void>;
  switchUser: (role: 'admin' | 'client', email?: string) => void;
  clients: Client[];
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) => Promise<Lead>;
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => void;
  convertLeadToClient: (
    leadId: string,
    templateId?: string,
    budget?: number,
    targetDate?: string
  ) => { client: Client; project: Project } | null;
  projects: Project[];
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  currentProject?: Project;
  templates: ProjectTemplate[];
  portfolio: PortfolioItem[];
  services: StudioService[];
  updateService: (id: string, updates: Partial<StudioService>) => Promise<void>;
  addService: (service: Partial<StudioService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  pricingPackages: PricingPackage[];
  updatePricingPackage: (id: string, updates: Partial<PricingPackage>) => Promise<void>;
  addPricingPackage: (pkg: Partial<PricingPackage>) => Promise<void>;
  deletePricingPackage: (id: string) => Promise<void>;
  reviews: ClientReview[];
  submitClientReview: (review: Omit<ClientReview, 'id' | 'createdAt'>) => Promise<ClientReview>;
  updateReviewStatus: (id: string, status: 'published' | 'pending' | 'featured') => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  landingConfig: LandingPageConfig;
  updateLandingConfig: (updates: Partial<LandingPageConfig>) => Promise<void>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  addPortfolioItem: (item: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  testimonials: Testimonial[];
  activityLog: ActivityLog[];
  settings: StudioSettings;
  updateSettings: (settings: Partial<StudioSettings>) => void;
  // Workflow actions
  advanceStage: (projectId: string) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  submitClientTask: (projectId: string, taskId: string, formData?: Record<string, string>) => void;
  approveTask: (projectId: string, taskId: string) => void;
  rejectTask: (projectId: string, taskId: string, reason: string) => void;
  createTask: (projectId: string, stageId: string, task: Partial<Task>) => void;
  createDocument: (projectId: string, doc: Partial<Document>) => Document;
  signDocument: (projectId: string, documentId: string, signerName: string) => void;
  signDocumentWithToken: (secureToken: string, signerName: string, signatureData?: string, responseNotes?: string) => boolean;
  createInvoice: (projectId: string, invoice: Partial<Invoice>) => void;
  payInvoice: (projectId: string, invoiceId: string, method?: string) => void;
  payInvoiceWithToken: (secureToken: string, paymentMethod: string, transactionRef?: string, notes?: string) => boolean;
  updateDocumentResponse: (projectId: string, documentId: string, updates: Partial<Document>) => void;
  updateInvoiceResponse: (projectId: string, invoiceId: string, updates: Partial<Invoice>) => void;
  getDocumentByToken: (secureToken: string) => { project: Project; document: Document } | null;
  getInvoiceByToken: (secureToken: string) => { project: Project; invoice: Invoice } | null;
  addDeliverable: (projectId: string, deliverable: Partial<Deliverable>) => void;
  toggleDeliverableVisibility: (projectId: string, deliverableId: string) => void;
  postProjectUpdate: (projectId: string, title: string, body: string, category?: any) => void;
  submitChangeRequest: (projectId: string, description: string, budgetDelta: number, timelineDeltaDays: number) => void;
  approveChangeRequest: (projectId: string, requestId: string, approve: boolean, notes?: string) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'trevon_creates_v1_store';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme mode (Dark vs Warm Beige Light)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('trevon_creates_theme');
      return (savedTheme === 'light' ? 'light' : 'dark') as ThemeMode;
    } catch {
      return 'dark';
    }
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('trevon_creates_theme', newTheme);
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  // Firebase auth & firestore states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState(true);
  const [firestoreConnected, setFirestoreConnected] = useState(false);

  // Route & Surface handling (support direct directory URLs: /admin, /portal, /work, /about)
  const getInitialRoute = (): { surface: SurfaceType; path: string } => {
    if (typeof window === 'undefined') return { surface: 'public', path: '/' };
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.startsWith('/admin')) {
      return { surface: 'admin', path: pathname };
    }
    if (pathname.startsWith('/portal')) {
      return { surface: 'client', path: pathname };
    }
    return { surface: 'public', path: pathname || '/' };
  };

  const initialRoute = getInitialRoute();
  const [currentPath, setCurrentPath] = useState<string>(initialRoute.path);
  const [surface, setSurfaceState] = useState<SurfaceType>(initialRoute.surface);

  const setSurface = (newSurface: SurfaceType) => {
    setSurfaceState(newSurface);
    if (newSurface === 'admin') {
      setCurrentPath('/admin');
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else if (newSurface === 'client') {
      setCurrentPath('/portal');
      if (window.location.pathname !== '/portal') {
        window.history.pushState(null, '', '/portal');
      }
    } else {
      setCurrentPath('/');
      if (window.location.pathname !== '/' && window.location.pathname !== '/work' && window.location.pathname !== '/about') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const navigateTo = (path: string) => {
    const normalized = path.toLowerCase();
    setCurrentPath(path);
    if (normalized.startsWith('/admin')) {
      setSurfaceState('admin');
    } else if (normalized.startsWith('/portal')) {
      setSurfaceState('client');
    } else {
      setSurfaceState('public');
    }
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname.toLowerCase();
      setCurrentPath(pathname);
      if (pathname.startsWith('/admin')) {
        setSurfaceState('admin');
      } else if (pathname.startsWith('/portal')) {
        setSurfaceState('client');
      } else {
        setSurfaceState('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default admin Trevor
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>('proj-kipao-retail');
  const [templates, setTemplates] = useState<ProjectTemplate[]>(DEFAULT_TEMPLATES);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO);
  const [services, setServices] = useState<StudioService[]>(INITIAL_SERVICES);
  const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>(INITIAL_PRICING_PACKAGES);
  const [reviews, setReviews] = useState<ClientReview[]>(INITIAL_REVIEWS);
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(INITIAL_LANDING_CONFIG);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(INITIAL_ACTIVITY);
  const [settings, setSettings] = useState<StudioSettings>({
    studioName: 'Trevon Creates Studio',
    adminEmail: 'don.trevor001@gmail.com',
    whatsappNumber: '+254142993925',
    currency: 'KES',
    resendConfigured: true,
    cloudRunEndpoint: 'https://ais-dev-btvf5677qrm3otb6hkjo2k-56600688489.us-west2.run.app',
    googleBusinessProfileUrl: 'https://maps.app.goo.gl/trevoncreates',
    googleBusinessPlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    defaultDepositPercent: 50,
    hourlyRateUSD: 95,
    hourlyRateKES: 12500,
    mpesaPaybillOrTill: 'Buy Goods Till: 9832104 / Paybill: 247247 Acc: TREVON',
    bankTransferDetails: 'I&M Bank Kenya • Account: 01204859123001 • Swift: IMBLKENA',
    bookingNotice: 'Currently accepting Q4 2026 client sprints — 2 onboarding slots open',
  });

  // Sync Landing Page Config, Services, Pricing, Reviews and Portfolio with Cloud Firestore
  useEffect(() => {
    // 1. Try local cache first
    try {
      const savedLanding = localStorage.getItem('trevon_landing_config');
      if (savedLanding) {
        setLandingConfig(JSON.parse(savedLanding));
      }
      const savedPortfolio = localStorage.getItem('trevon_portfolio');
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      }
      const savedServices = localStorage.getItem('trevon_services');
      if (savedServices) {
        setServices(JSON.parse(savedServices));
      }
      const savedPricing = localStorage.getItem('trevon_pricing');
      if (savedPricing) {
        setPricingPackages(JSON.parse(savedPricing));
      }
      const savedReviews = localStorage.getItem('trevon_reviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
      const savedSettings = localStorage.getItem('trevon_settings');
      if (savedSettings) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }

    // 2. Fetch live data from Cloud Firestore
    const syncFirestoreData = async () => {
      try {
        // Landing Config
        const landingSnap = await getDoc(doc(db, 'landingConfig', 'main'));
        if (landingSnap.exists()) {
          const liveConfig = landingSnap.data() as LandingPageConfig;
          setLandingConfig(liveConfig);
          try {
            localStorage.setItem('trevon_landing_config', JSON.stringify(liveConfig));
          } catch (e) {
            console.warn(e);
          }
        } else {
          await setDoc(doc(db, 'landingConfig', 'main'), INITIAL_LANDING_CONFIG);
        }

        // Portfolio
        const portSnap = await getDocs(collection(db, 'portfolio'));
        if (!portSnap.empty) {
          const livePortfolio: PortfolioItem[] = [];
          portSnap.forEach((d) => {
            livePortfolio.push(d.data() as PortfolioItem);
          });
          if (livePortfolio.length > 0) {
            setPortfolio(livePortfolio);
            try {
              localStorage.setItem('trevon_portfolio', JSON.stringify(livePortfolio));
            } catch (e) {
              console.warn(e);
            }
          }
        } else {
          for (const item of INITIAL_PORTFOLIO) {
            await setDoc(doc(db, 'portfolio', item.id), item);
          }
        }

        // Services
        const servSnap = await getDocs(collection(db, 'services'));
        if (!servSnap.empty) {
          const liveServices: StudioService[] = [];
          servSnap.forEach((d) => {
            liveServices.push(d.data() as StudioService);
          });
          if (liveServices.length > 0) {
            setServices(liveServices);
            try {
              localStorage.setItem('trevon_services', JSON.stringify(liveServices));
            } catch (e) {
              console.warn(e);
            }
          }
        } else {
          for (const serv of INITIAL_SERVICES) {
            await setDoc(doc(db, 'services', serv.id), serv);
          }
        }

        // Pricing Packages
        const priceSnap = await getDocs(collection(db, 'pricing'));
        if (!priceSnap.empty) {
          const livePricing: PricingPackage[] = [];
          priceSnap.forEach((d) => {
            livePricing.push(d.data() as PricingPackage);
          });
          if (livePricing.length > 0) {
            setPricingPackages(livePricing);
            try {
              localStorage.setItem('trevon_pricing', JSON.stringify(livePricing));
            } catch (e) {
              console.warn(e);
            }
          }
        } else {
          for (const pkg of INITIAL_PRICING_PACKAGES) {
            await setDoc(doc(db, 'pricing', pkg.id), pkg);
          }
        }

        // Client Reviews
        const revSnap = await getDocs(collection(db, 'reviews'));
        if (!revSnap.empty) {
          const liveReviews: ClientReview[] = [];
          revSnap.forEach((d) => {
            liveReviews.push(d.data() as ClientReview);
          });
          if (liveReviews.length > 0) {
            setReviews(liveReviews);
            try {
              localStorage.setItem('trevon_reviews', JSON.stringify(liveReviews));
            } catch (e) {
              console.warn(e);
            }
            // Update testimonials from live featured / published reviews
            const reviewTestimonials: Testimonial[] = liveReviews
              .filter((r) => r.status === 'featured' || r.status === 'published')
              .map((r) => ({
                id: r.id,
                clientName: r.clientName,
                roleCompany: `${r.serviceName} • ${r.clientCompany}`,
                quote: r.comment,
                projectId: r.projectId,
                projectTitle: r.headline,
                avatar: r.clientAvatar,
                published: true,
              }));
            if (reviewTestimonials.length > 0) {
              setTestimonials(reviewTestimonials);
            }
          }
        } else {
          for (const rev of INITIAL_REVIEWS) {
            await setDoc(doc(db, 'reviews', rev.id), rev);
          }
        }

        // Studio Settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'studio'));
        if (settingsSnap.exists()) {
          const liveSettings = settingsSnap.data() as StudioSettings;
          setSettings((prev) => ({ ...prev, ...liveSettings }));
          try {
            localStorage.setItem('trevon_settings', JSON.stringify(liveSettings));
          } catch (e) {
            console.warn(e);
          }
        }
      } catch (err) {
        console.warn('[Firestore Initial Sync Notice]:', err);
      }
    };

    syncFirestoreData();
  }, []);

  // Listen to Firebase Auth and check Firestore connection
  useEffect(() => {
    testFirestoreConnection().then((ok) => {
      setFirestoreConnected(ok);
    });

    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      setFirebaseAuthLoading(false);
      if (fUser) {
        const emailLower = (fUser.email || '').toLowerCase();
        if (
          emailLower === 'don.trevor001@gmail.com' ||
          emailLower === 'trevon@trevoncreates.com'
        ) {
          setCurrentUser({
            id: fUser.uid,
            firebaseUid: fUser.uid,
            email: fUser.email || 'don.trevor001@gmail.com',
            role: 'admin',
            name: fUser.displayName || 'Trevor Don',
            company: 'Trevon Creates Studio',
            avatarUrl: fUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
          });
        } else {
          const existingClient = clients.find(
            (c) => c.email.toLowerCase() === emailLower
          );
          if (existingClient) {
            setCurrentUser({
              id: existingClient.userId,
              firebaseUid: fUser.uid,
              email: existingClient.email,
              role: 'client',
              name: existingClient.name,
              company: existingClient.company,
              avatarUrl: fUser.photoURL || undefined,
              createdAt: existingClient.createdAt,
            });
            const clientProject = projects.find((p) => p.clientId === existingClient.id);
            if (clientProject) {
              setCurrentProjectId(clientProject.id);
            }
          } else {
            setCurrentUser({
              id: fUser.uid,
              firebaseUid: fUser.uid,
              email: fUser.email || 'client@studio.com',
              role: 'client',
              name: fUser.displayName || 'Client User',
              company: 'Client Org',
              avatarUrl: fUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [clients, projects]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('[Firebase Auth Error]', error);
    }
  };

  const firebaseSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(INITIAL_USERS[0]);
    } catch (error) {
      console.error('[Firebase SignOut Error]', error);
    }
  };

  // Try to rehydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.activityLog) setActivityLog(parsed.activityLog);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.warn('Could not read from local storage', e);
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          leads,
          clients,
          projects,
          activityLog,
          settings,
        })
      );
    } catch (e) {
      console.warn('Could not save to local storage', e);
    }
  }, [leads, clients, projects, activityLog, settings]);

  const logActivity = (action: string, target: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      actorName: currentUser.name,
      action,
      target,
      timestamp: new Date().toISOString(),
      type,
    };
    setActivityLog((prev) => [newLog, ...prev.slice(0, 40)]);
  };

  const switchUser = (role: 'admin' | 'client', email?: string) => {
    if (role === 'admin') {
      setCurrentUser(INITIAL_USERS[0]);
      setSurface('admin');
    } else {
      const clientUser = email
        ? INITIAL_USERS.find((u) => u.email === email) || INITIAL_USERS[1]
        : INITIAL_USERS[1];
      setCurrentUser(clientUser);
      // Auto-set the project for this client
      const matchedClient = clients.find((c) => c.userId === clientUser.id);
      if (matchedClient) {
        const clientProject = projects.find((p) => p.clientId === matchedClient.id);
        if (clientProject) {
          setCurrentProjectId(clientProject.id);
        }
      }
      setSurface('client');
    }
  };

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> => {
    const newLead: Lead = {
      ...leadData,
      id: 'lead-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    logActivity(`Submitted inquiry (${leadData.budgetRange})`, `${leadData.name} - ${leadData.projectType}`, 'lead');

    // Attempt to persist to Firestore
    try {
      await setDoc(doc(db, 'leads', newLead.id), newLead);
      console.log('[Firestore] Successfully recorded lead:', newLead.id);
    } catch (err) {
      console.warn('[Firestore] Falling back to local state:', err);
    }

    return newLead;
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus, notes?: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status, notes: notes ?? l.notes } : l))
    );
    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead) {
      logActivity(`Updated lead status to [${status.toUpperCase()}]`, targetLead.name, 'lead');
    }
  };

  const convertLeadToClient = (
    leadId: string,
    templateId = 'tpl-web-app-build',
    budget?: number,
    targetDate?: string
  ) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const clientId = 'client-' + Date.now();
    const userId = 'user-client-' + Date.now();

    const newClient: Client = {
      id: clientId,
      userId,
      name: lead.name,
      company: lead.name + ' Ventures',
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.phone,
      notes: `Converted from lead inquiry: ${lead.description}`,
      createdAt: new Date().toISOString(),
    };

    const selectedTemplate = templates.find((t) => t.id === templateId) || templates[0];
    const projectId = 'proj-' + Date.now();

    // Clone template stages and tasks
    const clonedStages = selectedTemplate.stages.map((ts, idx) => ({
      id: `stage-${projectId}-${ts.position}`,
      projectId,
      name: ts.name,
      position: ts.position,
      status: (idx === 0 ? 'current' : 'upcoming') as 'current' | 'upcoming',
      visibleToClient: true,
      startedAt: idx === 0 ? new Date().toISOString().split('T')[0] : undefined,
    }));

    const clonedTasks: Task[] = [];
    selectedTemplate.stages.forEach((ts) => {
      const stageRef = clonedStages.find((s) => s.position === ts.position);
      if (!stageRef) return;
      ts.tasks.forEach((tt) => {
        clonedTasks.push({
          id: `task-${projectId}-${tt.id}`,
          projectId,
          stageId: stageRef.id,
          title: tt.title,
          description: tt.description,
          owner: tt.owner,
          type: tt.type,
          status: 'pending',
          position: tt.position,
          config: tt.config,
        });
      });
    });

    const parsedBudget =
      budget ||
      (lead.budgetRange.includes('25k')
        ? 25000
        : lead.budgetRange.includes('10k')
        ? 15000
        : 7500);

    const targetEnd =
      targetDate ||
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newProject: Project = {
      id: projectId,
      clientId,
      title: `${lead.name} - ${lead.projectType}`,
      description: lead.description,
      scope: `Full-lifecycle development from discovery to deployment for ${lead.name}.`,
      requirements: 'High availability, responsive web application, modern cyber aesthetic.',
      status: 'active',
      templateId,
      budgetAmount: parsedBudget,
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: targetEnd,
      currentStageId: clonedStages[0].id,
      releasedToClient: true,
      stages: clonedStages,
      tasks: clonedTasks,
      deliverables: [],
      documents: [
        {
          id: `doc-${projectId}-1`,
          projectId,
          type: 'contract',
          title: `Master Services Agreement (${lead.name})`,
          content: `### 1. Purpose\nEngagement between Trevon Creates and ${lead.name} for ${lead.projectType}.\n\n### 2. Commercial Investment\nTotal Fixed Investment: $${parsedBudget.toLocaleString()} USD.\nDeposit: 50% upon execution. Milestone 2: 50% upon delivery.\n\n### 3. IP Ownership\nAll source code and cloud infrastructure transfer upon final milestone settlement.`,
          status: 'sent',
          createdAt: new Date().toISOString(),
        },
      ],
      invoices: [
        {
          id: `inv-${projectId}-1`,
          projectId,
          number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
          description: `${lead.projectType} — 50% Initial Mobilization Deposit`,
          amount: Math.round(parsedBudget * 0.5),
          currency: 'USD',
          status: 'sent',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          items: [
            { description: 'Initial Discovery, Architecture & Core Mobilization', quantity: 1, unitPrice: Math.round(parsedBudget * 0.5) },
          ],
        },
      ],
      updates: [
        {
          id: `upd-${projectId}-1`,
          projectId,
          authorName: 'Trevor Don',
          authorRole: 'admin',
          title: 'Project Initialized & Client Portal Provisioned',
          body: `Welcome ${lead.name}! Your workspace has been activated using our standardized 6-stage delivery pipeline. Please review the Master Services Agreement in Documents to begin.`,
          category: 'milestone',
          createdAt: new Date().toISOString(),
        },
      ],
      changeRequests: [],
      createdAt: new Date().toISOString(),
    };

    setClients((prev) => [newClient, ...prev]);
    setProjects((prev) => [newProject, ...prev]);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'converted', convertedClientId: clientId } : l))
    );
    setCurrentProjectId(projectId);

    logActivity(`Converted lead to client & instantiated project`, `${lead.name} (${newProject.title})`, 'project');

    return { client: newClient, project: newProject };
  };

  const advanceStage = (projectId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const currentIdx = proj.stages.findIndex((s) => s.id === proj.currentStageId);
        if (currentIdx === -1 || currentIdx >= proj.stages.length - 1) return proj;

        const nextStage = proj.stages[currentIdx + 1];
        const updatedStages = proj.stages.map((st, i) => {
          if (i === currentIdx) {
            return { ...st, status: 'done' as const, completedAt: new Date().toISOString().split('T')[0] };
          }
          if (i === currentIdx + 1) {
            return { ...st, status: 'current' as const, startedAt: new Date().toISOString().split('T')[0] };
          }
          return st;
        });

        return {
          ...proj,
          currentStageId: nextStage.id,
          stages: updatedStages,
        };
      })
    );

    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      logActivity(`Stage advanced automatically`, proj.title, 'project');
    }
  };

  const updateTaskStatus = (projectId: string, taskId: string, status: TaskStatus) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          tasks: proj.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status,
                  completedAt: status === 'approved' || status === 'done' ? new Date().toISOString() : t.completedAt,
                }
              : t
          ),
        };
      })
    );
  };

  const submitClientTask = (projectId: string, taskId: string, formData?: Record<string, string>) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          tasks: proj.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              status: 'submitted',
              response: {
                formData,
                submittedAt: new Date().toISOString(),
                submittedBy: currentUser.name,
              },
            };
          }),
        };
      })
    );

    const taskObj = currentProject?.tasks.find((t) => t.id === taskId);
    logActivity(`Submitted task for approval`, taskObj ? taskObj.title : 'Task submission', 'task');
  };

  const approveTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedTasks = proj.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'approved' as const,
                completedAt: new Date().toISOString(),
              }
            : t
        );

        // Check if all client tasks in the current stage are now approved
        const currentStage = proj.stages.find((s) => s.id === proj.currentStageId);
        const stageTasks = updatedTasks.filter((t) => t.stageId === proj.currentStageId);
        const allDone = stageTasks.length > 0 && stageTasks.every((t) => t.status === 'approved' || t.status === 'done');

        if (allDone && currentStage) {
          const currentIdx = proj.stages.findIndex((s) => s.id === proj.currentStageId);
          if (currentIdx < proj.stages.length - 1) {
            const nextStage = proj.stages[currentIdx + 1];
            const updatedStages = proj.stages.map((st, i) => {
              if (i === currentIdx) {
                return { ...st, status: 'done' as const, completedAt: new Date().toISOString().split('T')[0] };
              }
              if (i === currentIdx + 1) {
                return { ...st, status: 'current' as const, startedAt: new Date().toISOString().split('T')[0] };
              }
              return st;
            });
            return {
              ...proj,
              currentStageId: nextStage.id,
              stages: updatedStages,
              tasks: updatedTasks,
            };
          }
        }

        return {
          ...proj,
          tasks: updatedTasks,
        };
      })
    );

    const taskObj = currentProject?.tasks.find((t) => t.id === taskId);
    logActivity(`Approved client task submission`, taskObj ? taskObj.title : 'Task approved', 'task');
  };

  const rejectTask = (projectId: string, taskId: string, reason: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          tasks: proj.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'rejected' as const,
                  response: {
                    ...t.response,
                    rejectionReason: reason,
                  },
                }
              : t
          ),
        };
      })
    );
    logActivity(`Requested revision on task`, reason, 'task');
  };

  const createTask = (projectId: string, stageId: string, task: Partial<Task>) => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      projectId,
      stageId,
      title: task.title || 'Untitled Task',
      description: task.description || '',
      owner: task.owner || 'client',
      type: task.type || 'info',
      status: 'pending',
      position: Date.now(),
      dueDate: task.dueDate,
      config: task.config,
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p))
    );
    logActivity(`Created task [${newTask.owner}]`, newTask.title, 'task');
  };

  const signDocument = (projectId: string, documentId: string, signerName: string) => {
    const signTime = new Date().toISOString();
    const fakeIp = '102.166.114.' + Math.floor(10 + Math.random() * 80);

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          documents: proj.documents.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  status: 'signed' as const,
                  signedAt: signTime,
                  signedName: signerName,
                  signedIp: fakeIp,
                }
              : d
          ),
          // Also mark matching document task as approved if exists
          tasks: proj.tasks.map((t) =>
            t.type === 'document' ? { ...t, status: 'approved' as const, completedAt: signTime } : t
          ),
        };
      })
    );
    logActivity(`Digitally signed legal contract (${signerName})`, `IP: ${fakeIp}`, 'document');
  };

  const createDocument = (projectId: string, docData: Partial<Document>): Document => {
    const token = 'sec-doc-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newDoc: Document = {
      id: 'doc-' + Date.now(),
      projectId,
      secureToken: token,
      type: docData.type || 'contract',
      title: docData.title || 'Master Services Agreement & Addendum',
      content:
        docData.content ||
        `### Master Services Agreement (MSA)\n\n**Client Engagement Terms**\n\n#### 1. Scope of Engagement\nDelivery of custom digital platforms, verified responsive interfaces, and server-side cloud systems as specified in project sprints.\n\n#### 2. Milestone Deliverables & Acceptance\nAll production code, design tokens, and infrastructure configurations will be deployed to private staging repositories for review prior to final sign-off.\n\n#### 3. Intellectual Property Rights\nFull ownership of the custom code base, architecture blueprints, and design systems automatically transfers to the client upon full settlement of all milestone invoices.\n\n#### 4. Digital Signature & Audit Trail\nExecuted under Kenyan and international commercial contract laws. Digital signatures and audit trails recorded in this portal constitute valid and binding legal execution.`,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== projectId) return p;
        const nextProject = { ...p, documents: [...p.documents, newDoc] };
        setDoc(doc(db, 'projects', p.id), nextProject, { merge: true }).catch((err) =>
          console.warn('[Firestore] Project save notice:', err)
        );
        return nextProject;
      });
      return updated;
    });

    logActivity(`Drafted & dispatched legal document`, `${newDoc.title} (${newDoc.type.toUpperCase()})`, 'document');
    return newDoc;
  };

  const getDocumentByToken = (secureToken: string): { project: Project; document: Document } | null => {
    for (const proj of projects) {
      const doc = proj.documents.find((d) => d.secureToken === secureToken || d.id === secureToken);
      if (doc) return { project: proj, document: doc };
    }
    return null;
  };

  const getInvoiceByToken = (secureToken: string): { project: Project; invoice: Invoice } | null => {
    for (const proj of projects) {
      const inv = proj.invoices.find((i) => i.secureToken === secureToken || i.id === secureToken);
      if (inv) return { project: proj, invoice: inv };
    }
    return null;
  };

  const signDocumentWithToken = (
    secureToken: string,
    signerName: string,
    signatureData?: string,
    responseNotes?: string
  ): boolean => {
    const found = getDocumentByToken(secureToken);
    if (!found) return false;
    const { project, document } = found;
    const signTime = new Date().toISOString();
    const fakeIp = '102.166.114.' + Math.floor(10 + Math.random() * 80);

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== project.id) return proj;
        return {
          ...proj,
          documents: proj.documents.map((d) =>
            d.id === document.id
              ? {
                  ...d,
                  status: 'signed' as const,
                  signedAt: signTime,
                  signedName: signerName,
                  signedIp: fakeIp,
                  signatureData,
                  responseNotes,
                }
              : d
          ),
          tasks: proj.tasks.map((t) =>
            t.type === 'document' || t.config?.documentId === document.id
              ? { ...t, status: 'approved' as const, completedAt: signTime }
              : t
          ),
        };
      })
    );
    logActivity(`Contract verified & signed via secure link (${signerName})`, `${document.title} [IP: ${fakeIp}]`, 'document');
    return true;
  };

  const createInvoice = (projectId: string, invoice: Partial<Invoice>) => {
    const token = 'sec-inv-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      projectId,
      secureToken: token,
      number: `INV-2026-${Math.floor(200 + Math.random() * 800)}`,
      description: invoice.description || 'Consulting & Engineering Milestone',
      amount: invoice.amount || 2500,
      currency: invoice.currency || 'USD',
      status: 'sent',
      dueDate: invoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      items: invoice.items || [{ description: invoice.description || 'Milestone', quantity: 1, unitPrice: invoice.amount || 2500 }],
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, invoices: [...p.invoices, newInvoice] } : p))
    );
    logActivity(`Generated and dispatched invoice`, `${newInvoice.number} ($${newInvoice.amount})`, 'invoice');
  };

  const payInvoice = (projectId: string, invoiceId: string, method = 'M-Pesa / Paystack Gateway') => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          invoices: proj.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString() } : inv
          ),
          // Also complete payment tasks if in current stage
          tasks: proj.tasks.map((t) =>
            t.type === 'payment' ? { ...t, status: 'approved' as const, completedAt: new Date().toISOString() } : t
          ),
        };
      })
    );
    logActivity(`Settled invoice via ${method}`, invoiceId, 'invoice');
  };

  const payInvoiceWithToken = (
    secureToken: string,
    paymentMethod: string,
    transactionRef?: string,
    notes?: string
  ): boolean => {
    const found = getInvoiceByToken(secureToken);
    if (!found) return false;
    const { project, invoice } = found;
    const paidTime = new Date().toISOString();

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== project.id) return proj;
        return {
          ...proj,
          invoices: proj.invoices.map((inv) =>
            inv.id === invoice.id
              ? {
                  ...inv,
                  status: 'paid' as const,
                  paidAt: paidTime,
                  paymentMethod,
                  transactionRef: transactionRef || `MPESA-${Date.now().toString().slice(-6)}`,
                  notes,
                }
              : inv
          ),
          tasks: proj.tasks.map((t) =>
            t.type === 'payment'
              ? { ...t, status: 'approved' as const, completedAt: paidTime }
              : t
          ),
        };
      })
    );
    logActivity(`Invoice settled via secure link (${paymentMethod})`, `${invoice.number} - Ref: ${transactionRef || 'STK_PUSH'}`, 'invoice');
    return true;
  };

  const updateDocumentResponse = (projectId: string, documentId: string, updates: Partial<Document>) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          documents: proj.documents.map((d) =>
            d.id === documentId ? { ...d, ...updates } : d
          ),
        };
      })
    );
    logActivity(`Document record updated`, documentId, 'document');
  };

  const updateInvoiceResponse = (projectId: string, invoiceId: string, updates: Partial<Invoice>) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          invoices: proj.invoices.map((i) =>
            i.id === invoiceId ? { ...i, ...updates } : i
          ),
        };
      })
    );
    logActivity(`Invoice record updated`, invoiceId, 'invoice');
  };

  const addDeliverable = (projectId: string, deliverable: Partial<Deliverable>) => {
    const newDel: Deliverable = {
      id: 'del-' + Date.now(),
      projectId,
      title: deliverable.title || 'New Deliverable Link',
      kind: deliverable.kind || 'link',
      url: deliverable.url || 'https://trevoncreates.com',
      version: deliverable.version || 'v1.0.0',
      description: deliverable.description || '',
      visibleToClient: deliverable.visibleToClient ?? true,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, deliverables: [...p.deliverables, newDel] } : p))
    );
    logActivity(`Published new deliverable`, newDel.title, 'project');
  };

  const toggleDeliverableVisibility = (projectId: string, deliverableId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          deliverables: proj.deliverables.map((d) =>
            d.id === deliverableId ? { ...d, visibleToClient: !d.visibleToClient } : d
          ),
        };
      })
    );
  };

  const postProjectUpdate = (projectId: string, title: string, body: string, category: any = 'general') => {
    const newUpd: ProjectUpdate = {
      id: 'upd-' + Date.now(),
      projectId,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      title,
      body,
      category: category as any,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, updates: [newUpd, ...p.updates] } : p))
    );
    logActivity(`Posted project update`, title, 'update');
  };

  const submitChangeRequest = (projectId: string, description: string, budgetDelta: number, timelineDeltaDays: number) => {
    const newCR = {
      id: 'cr-' + Date.now(),
      projectId,
      description,
      budgetDelta,
      timelineDeltaDays,
      status: 'pending' as const,
      submittedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, changeRequests: [newCR, ...p.changeRequests] } : p))
    );
    logActivity(`Submitted scope change proposal (+$${budgetDelta})`, description.slice(0, 40), 'project');
  };

  const approveChangeRequest = (projectId: string, requestId: string, approve: boolean, notes?: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const targetCR = proj.changeRequests.find((cr) => cr.id === requestId);
        if (!targetCR) return proj;

        const updatedCRs = proj.changeRequests.map((cr) =>
          cr.id === requestId
            ? { ...cr, status: (approve ? 'approved' : 'rejected') as 'approved' | 'rejected', responseNotes: notes }
            : cr
        );

        let newBudget = proj.budgetAmount;
        if (approve) {
          newBudget += targetCR.budgetDelta;
        }

        return {
          ...proj,
          budgetAmount: newBudget,
          changeRequests: updatedCRs,
        };
      })
    );
    logActivity(approve ? `Approved change request` : `Rejected change request`, notes || '', 'project');
  };

  const updateSettings = async (newSettings: Partial<StudioSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('trevon_settings', JSON.stringify(updated));
      await setDoc(doc(db, 'settings', 'studio'), updated, { merge: true });
      logActivity('Updated studio business profile & pricing settings', 'Studio Settings', 'project');
    } catch (e) {
      console.warn('updateSettings error:', e);
    }
  };

  const updateService = async (id: string, updates: Partial<StudioService>) => {
    const updated = services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setServices(updated);
    try {
      localStorage.setItem('trevon_services', JSON.stringify(updated));
      await setDoc(doc(db, 'services', id), { ...updates, id }, { merge: true });
      logActivity(`Updated service offering [${id}]`, 'Studio Services CMS', 'project');
    } catch (e) {
      console.warn('updateService error:', e);
    }
  };

  const addService = async (serviceData: Partial<StudioService>) => {
    const newService: StudioService = {
      id: serviceData.id || 'serv-' + Date.now(),
      title: serviceData.title || 'New Engineering Service',
      slug: serviceData.slug || 'service-' + Date.now(),
      tagline: serviceData.tagline || 'Custom digital delivery',
      description: serviceData.description || 'Description of deliverables and process',
      deliverables: serviceData.deliverables || ['Technical Deliverable 1', 'Technical Deliverable 2'],
      startingPriceKES: serviceData.startingPriceKES || 150000,
      startingPriceUSD: serviceData.startingPriceUSD || 1100,
      timeline: serviceData.timeline || '2 - 4 Weeks',
      icon: serviceData.icon || 'Code',
      popular: serviceData.popular ?? false,
      active: serviceData.active ?? true,
    };
    const updated = [...services, newService];
    setServices(updated);
    try {
      localStorage.setItem('trevon_services', JSON.stringify(updated));
      await setDoc(doc(db, 'services', newService.id), newService);
      logActivity(`Added new service offering [${newService.title}]`, 'Studio Services CMS', 'project');
    } catch (e) {
      console.warn('addService error:', e);
    }
  };

  const deleteService = async (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    try {
      localStorage.setItem('trevon_services', JSON.stringify(updated));
      await deleteDoc(doc(db, 'services', id));
      logActivity(`Removed service offering [${id}]`, 'Studio Services CMS', 'project');
    } catch (e) {
      console.warn('deleteService error:', e);
    }
  };

  const updatePricingPackage = async (id: string, updates: Partial<PricingPackage>) => {
    const updated = pricingPackages.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPricingPackages(updated);
    try {
      localStorage.setItem('trevon_pricing', JSON.stringify(updated));
      await setDoc(doc(db, 'pricing', id), { ...updates, id }, { merge: true });
      logActivity(`Updated pricing tier [${id}]`, 'Studio Pricing CMS', 'project');
    } catch (e) {
      console.warn('updatePricingPackage error:', e);
    }
  };

  const addPricingPackage = async (pkgData: Partial<PricingPackage>) => {
    const newPkg: PricingPackage = {
      id: pkgData.id || 'pkg-' + Date.now(),
      name: pkgData.name || 'New Pricing Package',
      badge: pkgData.badge || 'CUSTOM SCOPE',
      priceKES: pkgData.priceKES || 250000,
      priceUSD: pkgData.priceUSD || 1800,
      billingPeriod: pkgData.billingPeriod || 'Fixed Scope',
      deliveryTime: pkgData.deliveryTime || '3 - 4 Weeks',
      description: pkgData.description || 'Sprint package scope and deliverables',
      features: pkgData.features || ['Feature 1', 'Feature 2', 'Feature 3'],
      highlight: pkgData.highlight ?? false,
      depositRequiredPercent: pkgData.depositRequiredPercent || 50,
      active: pkgData.active ?? true,
    };
    const updated = [...pricingPackages, newPkg];
    setPricingPackages(updated);
    try {
      localStorage.setItem('trevon_pricing', JSON.stringify(updated));
      await setDoc(doc(db, 'pricing', newPkg.id), newPkg);
      logActivity(`Added new pricing package [${newPkg.name}]`, 'Studio Pricing CMS', 'project');
    } catch (e) {
      console.warn('addPricingPackage error:', e);
    }
  };

  const deletePricingPackage = async (id: string) => {
    const updated = pricingPackages.filter((p) => p.id !== id);
    setPricingPackages(updated);
    try {
      localStorage.setItem('trevon_pricing', JSON.stringify(updated));
      await deleteDoc(doc(db, 'pricing', id));
      logActivity(`Removed pricing package [${id}]`, 'Studio Pricing CMS', 'project');
    } catch (e) {
      console.warn('deletePricingPackage error:', e);
    }
  };

  const submitClientReview = async (reviewData: Omit<ClientReview, 'id' | 'createdAt'>): Promise<ClientReview> => {
    const newReview: ClientReview = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      createdAt: new Date().toISOString(),
      googleBusinessReady: true,
      status: reviewData.status || 'published',
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem('trevon_reviews', JSON.stringify(updated));
      await setDoc(doc(db, 'reviews', newReview.id), newReview);
      logActivity(`Client submitted 5★ review (${newReview.clientName} - ${newReview.serviceName})`, 'Google Business Hub', 'lead');
    } catch (e) {
      console.warn('submitClientReview error:', e);
    }
    // Also update testimonials live
    const newTestimonial: Testimonial = {
      id: newReview.id,
      clientName: newReview.clientName,
      roleCompany: `${newReview.serviceName} • ${newReview.clientCompany}`,
      quote: newReview.comment,
      projectId: newReview.projectId,
      projectTitle: newReview.headline,
      avatar: newReview.clientAvatar,
      published: true,
    };
    setTestimonials((prev) => [newTestimonial, ...prev]);
    return newReview;
  };

  const updateReviewStatus = async (id: string, status: 'published' | 'pending' | 'featured') => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    setReviews(updated);
    try {
      localStorage.setItem('trevon_reviews', JSON.stringify(updated));
      await updateDoc(doc(db, 'reviews', id), { status });
      logActivity(`Updated review status [${id}] to ${status}`, 'Google Business Hub', 'lead');
    } catch (e) {
      console.warn('updateReviewStatus error:', e);
    }
  };

  const deleteReview = async (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    try {
      localStorage.setItem('trevon_reviews', JSON.stringify(updated));
      await deleteDoc(doc(db, 'reviews', id));
      logActivity(`Deleted review [${id}]`, 'Google Business Hub', 'lead');
    } catch (e) {
      console.warn('deleteReview error:', e);
    }
  };

  const updateLandingConfig = async (updates: Partial<LandingPageConfig>) => {
    const updated: LandingPageConfig = {
      ...landingConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setLandingConfig(updated);
    try {
      localStorage.setItem('trevon_landing_config', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    try {
      await setDoc(doc(db, 'landingConfig', 'main'), updated, { merge: true });
      logActivity('Saved Landing Page updates to Cloud Firestore', 'Landing Page CMS', 'project');
    } catch (err) {
      console.warn('[Firestore] updateLandingConfig error:', err);
    }
  };

  const updatePortfolioItem = async (id: string, updates: Partial<PortfolioItem>) => {
    const updatedList = portfolio.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setPortfolio(updatedList);
    try {
      localStorage.setItem('trevon_portfolio', JSON.stringify(updatedList));
    } catch (e) {
      console.warn(e);
    }
    try {
      await setDoc(doc(db, 'portfolio', id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
      logActivity(`Updated portfolio item [${id}]`, 'Portfolio', 'project');
    } catch (err) {
      console.warn('[Firestore] updatePortfolioItem error:', err);
    }
  };

  const addPortfolioItem = async (item: Partial<PortfolioItem>) => {
    const newItem: PortfolioItem = {
      id: item.id || 'port-' + Date.now(),
      slug: item.slug || 'project-' + Date.now(),
      title: item.title || 'New Project Case Study',
      client: item.client || 'Client Organization',
      summary: item.summary || 'Summary description',
      body: item.body || 'Detailed case study and architectural overview.',
      coverImage: item.coverImage || '/trevor-portrait.jpg',
      tags: item.tags || ['Next.js', 'UI/UX Design', 'Cloud Architecture'],
      metrics: item.metrics || [{ label: 'Performance', value: '100%' }],
      architecturePoints: item.architecturePoints || ['Production-ready system architecture'],
      liveUrl: item.liveUrl || '',
      published: item.published ?? true,
      featured: item.featured ?? false,
    };
    const updatedList = [newItem, ...portfolio];
    setPortfolio(updatedList);
    try {
      localStorage.setItem('trevon_portfolio', JSON.stringify(updatedList));
      await setDoc(doc(db, 'portfolio', newItem.id), newItem);
      logActivity(`Created portfolio item [${newItem.title}]`, 'Portfolio', 'project');
    } catch (err) {
      console.warn('[Firestore] addPortfolioItem error:', err);
    }
  };

  const deletePortfolioItem = async (id: string) => {
    const updatedList = portfolio.filter((item) => item.id !== id);
    setPortfolio(updatedList);
    try {
      localStorage.setItem('trevon_portfolio', JSON.stringify(updatedList));
      await deleteDoc(doc(db, 'portfolio', id));
      logActivity(`Removed portfolio item [${id}]`, 'Portfolio', 'project');
    } catch (err) {
      console.warn('[Firestore] deletePortfolioItem error:', err);
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('trevon_landing_config');
    localStorage.removeItem('trevon_portfolio');
    localStorage.removeItem('trevon_services');
    localStorage.removeItem('trevon_pricing');
    localStorage.removeItem('trevon_reviews');
    localStorage.removeItem('trevon_settings');
    setLeads(INITIAL_LEADS);
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setPortfolio(INITIAL_PORTFOLIO);
    setServices(INITIAL_SERVICES);
    setPricingPackages(INITIAL_PRICING_PACKAGES);
    setReviews(INITIAL_REVIEWS);
    setLandingConfig(INITIAL_LANDING_CONFIG);
    setActivityLog(INITIAL_ACTIVITY);
    setCurrentProjectId('proj-kipao-retail');
  };

  return (
    <AppContext.Provider
      value={{
        surface,
        setSurface,
        currentPath,
        navigateTo,
        theme,
        toggleTheme,
        setTheme,
        currentUser,
        firebaseUser,
        firebaseAuthLoading,
        firestoreConnected,
        signInWithGoogle,
        firebaseSignOut,
        switchUser,
        clients,
        leads,
        addLead,
        updateLeadStatus,
        convertLeadToClient,
        projects,
        currentProjectId,
        setCurrentProjectId,
        currentProject,
        templates,
        portfolio,
        services,
        updateService,
        addService,
        deleteService,
        pricingPackages,
        updatePricingPackage,
        addPricingPackage,
        deletePricingPackage,
        reviews,
        submitClientReview,
        updateReviewStatus,
        deleteReview,
        landingConfig,
        updateLandingConfig,
        updatePortfolioItem,
        addPortfolioItem,
        deletePortfolioItem,
        testimonials,
        activityLog,
        settings,
        updateSettings,
        advanceStage,
        updateTaskStatus,
        submitClientTask,
        approveTask,
        rejectTask,
        createTask,
        createDocument,
        signDocument,
        signDocumentWithToken,
        createInvoice,
        payInvoice,
        payInvoiceWithToken,
        updateDocumentResponse,
        updateInvoiceResponse,
        getDocumentByToken,
        getInvoiceByToken,
        addDeliverable,
        toggleDeliverableVisibility,
        postProjectUpdate,
        submitChangeRequest,
        approveChangeRequest,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
