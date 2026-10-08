import React, { useState, useEffect } from 'react';
import { useApp } from './store/AppContext';
import { RoleBanner } from './components/common/RoleBanner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PublicHome } from './components/public/PublicHome';
import { WorkPage } from './components/public/WorkPage';
import { AboutPage } from './components/public/AboutPage';
import { ContactModal } from './components/public/ContactModal';
import { DirectorySwitcher } from './components/common/DirectorySwitcher';
import { ClientPortal } from './components/portal/ClientPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { SecureDocumentModal } from './components/secure/SecureDocumentModal';
import { Document, Invoice, Project } from './types';

export const AppContent: React.FC = () => {
  const { surface, currentPath, navigateTo, getDocumentByToken, getInvoiceByToken, projects } = useApp();
  const [activePublicTab, setActivePublicTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      if (p === '/work' || p === '/case-studies') return 'work';
      if (p === '/about' || p === '/architect') return 'about';
    }
    return 'home';
  });
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDirectorySwitcherOpen, setIsDirectorySwitcherOpen] = useState(false);
  const [showDevHud, setShowDevHud] = useState(false);

  // Standalone Secure Token Gateway Modal
  const [secureModalOpen, setSecureModalOpen] = useState(false);
  const [secureDoc, setSecureDoc] = useState<Document | null>(null);
  const [secureInv, setSecureInv] = useState<Invoice | null>(null);
  const [secureProj, setSecureProj] = useState<Project | null>(null);

  // Detect secure token from query string (e.g. ?secureToken=... or ?docToken=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('secureToken') || params.get('docToken') || params.get('invToken') || params.get('token');
    if (token) {
      const docMatch = getDocumentByToken(token);
      if (docMatch) {
        setSecureDoc(docMatch.document);
        setSecureInv(null);
        setSecureProj(docMatch.project);
        setSecureModalOpen(true);
        return;
      }
      const invMatch = getInvoiceByToken(token);
      if (invMatch) {
        setSecureInv(invMatch.invoice);
        setSecureDoc(null);
        setSecureProj(invMatch.project);
        setSecureModalOpen(true);
        return;
      }
    }
  }, [projects]);

  // Sync activePublicTab with currentPath
  useEffect(() => {
    if (currentPath === '/work' || currentPath === '/case-studies') {
      setActivePublicTab('work');
    } else if (currentPath === '/about' || currentPath === '/architect') {
      setActivePublicTab('about');
    } else if (currentPath === '/contact') {
      setIsContactOpen(true);
    } else if (currentPath === '/' || currentPath === '/overview' || currentPath === '/home') {
      setActivePublicTab('home');
    }
  }, [currentPath]);

  // Global hotkeys: Cmd/Ctrl+K for directory switcher, Ctrl+Shift+D for dev HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsDirectorySwitcherOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDevHud((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[#00FF00] selection:text-black transition-colors duration-200">
      {/* 1. Global Role / Surface Switcher Banner (Hidden on public site, active in /portal, /admin, or via Dev HUD) */}
      {(surface !== 'public' || showDevHud) && <RoleBanner />}

      {/* 2. Top Navigation Bar (Rendered on public site only; dashboards use dedicated side panel) */}
      {surface === 'public' && (
        <Header
          onOpenContact={() => setIsContactOpen(true)}
          activePublicTab={activePublicTab}
          setActivePublicTab={setActivePublicTab}
        />
      )}

      {/* 3. Main Surface Renderer */}
      <main className="flex-1 flex flex-col">
        {surface === 'public' && (
          <>
            {activePublicTab === 'home' && (
              <PublicHome
                onOpenContact={() => setIsContactOpen(true)}
                onExploreWork={() => {
                  setActivePublicTab('work');
                  navigateTo('/work');
                }}
              />
            )}
            {activePublicTab === 'work' && (
              <WorkPage onOpenContact={() => setIsContactOpen(true)} />
            )}
            {activePublicTab === 'about' && (
              <AboutPage onOpenContact={() => setIsContactOpen(true)} />
            )}
          </>
        )}

        {surface === 'client' && <ClientPortal />}

        {surface === 'admin' && <AdminPortal />}
      </main>

      {/* 4. Footer with Directory Navigation (Rendered on public site only) */}
      {surface === 'public' && (
        <Footer
          onOpenContact={() => setIsContactOpen(true)}
          onOpenDirectories={() => setIsDirectorySwitcherOpen(true)}
        />
      )}

      {/* 5. Project Inquiry Intake Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* 6. System Directory Switcher Modal (⌘K / Ctrl+K) */}
      <DirectorySwitcher
        isOpen={isDirectorySwitcherOpen}
        onClose={() => setIsDirectorySwitcherOpen(false)}
      />

      {/* 7. Direct Secure Link Document / Invoice Gateway Modal */}
      <SecureDocumentModal
        isOpen={secureModalOpen}
        onClose={() => setSecureModalOpen(false)}
        document={secureDoc}
        invoice={secureInv}
        project={secureProj}
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
