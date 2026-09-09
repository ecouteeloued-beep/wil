import React, { useState, useEffect, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GrievanceForm } from './components/GrievanceForm';
import { SplashScreen } from './components/SplashScreen';
import { GrievanceCategory, SystemUser } from './types';

// Lazy loaded components (Code Splitting for performance)
const Domains = React.lazy(() => import('./components/Domains').then(module => ({ default: module.Domains })));
const HowItWorks = React.lazy(() => import('./components/HowItWorks').then(module => ({ default: module.HowItWorks })));
const ContactMethods = React.lazy(() => import('./components/ContactMethods').then(module => ({ default: module.ContactMethods })));
const FAQ = React.lazy(() => import('./components/FAQ').then(module => ({ default: module.FAQ })));
const Footer = React.lazy(() => import('./components/Footer').then(module => ({ default: module.Footer })));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const ProjectVision = React.lazy(() => import('./components/ProjectVision').then(module => ({ default: module.ProjectVision })));
const DashboardLayout = React.lazy(() => import('./components/dashboard/DashboardLayout').then(module => ({ default: module.DashboardLayout })));
const AdminLogin = React.lazy(() => import('./components/dashboard/AdminLogin').then(module => ({ default: module.AdminLogin })));

// Loading fallback
const SectionLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-[#006233] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'vision' | 'admin_dashboard'>('home');
  const [adminUser, setAdminUser] = useState<SystemUser | null>(null);
  const [formActiveTab, setFormActiveTab] = useState<'new' | 'track'>('new');
  const [selectedCategory, setSelectedCategory] = useState<GrievanceCategory>('الحالة المدنية');

  useEffect(() => {
    // Check pathname, hash, and query params for admin access: e.g. /admin, #/admin, ?portal=admin
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    
    if (
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname.includes('/admin') ||
      hash.includes('admin') ||
      params.get('portal') === 'admin' ||
      params.get('admin') === 'true'
    ) {
      setCurrentView('admin_dashboard');
    }

    // Secret keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCurrentView('admin_dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTab = (tab: 'new' | 'track') => {
    setCurrentView('home');
    setFormActiveTab(tab);
  };

  const handleScrollToForm = (tab: 'new' | 'track' = 'new') => {
    setCurrentView('home');
    setFormActiveTab(tab);
    setTimeout(() => {
      const formEl = document.getElementById('interactive-form-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleDomainClick = (domainTitle: string) => {
    setCurrentView('home');
    setSelectedCategory(domainTitle as GrievanceCategory);
    handleScrollToForm('new');
  };

  if (currentView === 'admin_dashboard') {
    if (!adminUser) {
      return (
        <Suspense fallback={<SectionLoader />}>
          <AdminLogin 
            onLogin={(user) => setAdminUser(user)} 
            onCancel={() => setCurrentView('home')} 
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<SectionLoader />}>
        <DashboardLayout 
          user={adminUser} 
          onLogout={() => { setAdminUser(null); setCurrentView('home'); }} 
        />
      </Suspense>
    );
  }

  return (
    <>
      <SplashScreen 
        isOpen={showSplash}
        onClose={() => setShowSplash(false)}
        onSelectTab={(tab) => {
          setShowSplash(false);
          handleScrollToForm(tab);
        }}
      />

      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-900 font-tajawal selection:bg-[#006233]/20 selection:text-[#006233]">
        <Header 
          onNavigateToForm={handleScrollToForm} 
          onOpenWelcome={() => setShowSplash(true)}
          onAdminClick={() => setCurrentView('admin_dashboard')}
          onVisionClick={() => setCurrentView('vision')}
        />

        <main className="flex-1 w-full space-y-10">
          <Suspense fallback={<SectionLoader />}>
            {currentView === 'privacy' ? (
              <PrivacyPolicy />
            ) : currentView === 'vision' ? (
              <ProjectVision />
            ) : (
              <>
                <Hero onSelectTab={handleSelectTab} onVisionClick={() => setCurrentView('vision')} />
                
                <Domains 
                  onDomainClick={handleDomainClick}
                />
                
                <div className="w-full space-y-10 sm:space-y-12">
                  <HowItWorks />
                  
                  <GrievanceForm 
                    activeTab={formActiveTab}
                    onTabChange={setFormActiveTab}
                    initialCategory={selectedCategory}
                  />
                  
                  <ContactMethods />
                  
                  <FAQ />
                </div>
              </>
            )}
          </Suspense>
        </main>

        <Suspense fallback={<div className="h-16 bg-[#0B1519]"></div>}>
          <Footer 
            onPrivacyClick={() => {
              setCurrentView('privacy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            onSecretAdminTrigger={() => setCurrentView('admin_dashboard')}
          />
        </Suspense>
      </div>
    </>
  );
}
