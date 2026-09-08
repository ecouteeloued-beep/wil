import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Domains } from './components/Domains';
import { HowItWorks } from './components/HowItWorks';
import { GrievanceForm } from './components/GrievanceForm';
import { ContactMethods } from './components/ContactMethods';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { SplashScreen } from './components/SplashScreen';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AdminLoginView } from './components/dashboard/AdminLoginView';
import { AdminService } from './services/adminService';
import { GrievanceCategory } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'dashboard' | 'admin_login'>('home');
  const [formActiveTab, setFormActiveTab] = useState<'new' | 'track'>('new');
  const [selectedCategory, setSelectedCategory] = useState<GrievanceCategory>('الحالة المدنية');

  // Detect /admin or #admin in URL
  useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      
      const isAdminRoute = 
        path === '/admin' || 
        path === '/admin/' || 
        path.startsWith('/admin') ||
        path.endsWith('/admin') ||
        hash === '#admin' || 
        hash === '#/admin' ||
        hash.includes('admin');

      if (isAdminRoute) {
        setShowSplash(false);
        if (AdminService.isAdminLoggedIn()) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('admin_login');
        }
      } else {
        // If on root or other path
        if (currentView === 'admin_login' || currentView === 'dashboard') {
          if (path === '/' || path === '' || !isAdminRoute) {
            setCurrentView('home');
          }
        }
      }
    };

    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    window.addEventListener('popstate', handleUrlCheck);
    return () => {
      window.removeEventListener('hashchange', handleUrlCheck);
      window.removeEventListener('popstate', handleUrlCheck);
    };
  }, [currentView]);

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

  const handleOpenDashboard = () => {
    try {
      if (window.location.pathname !== '/admin') {
        window.history.pushState({ route: 'admin' }, '', '/admin');
      }
    } catch {
      // safe fallback in iframe environments
    }

    if (AdminService.isAdminLoggedIn()) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('admin_login');
    }
  };

  const handleLogoutAdmin = () => {
    AdminService.logoutAdmin();
    try {
      if (window.location.pathname !== '/admin') {
        window.history.pushState({ route: 'admin' }, '', '/admin');
      }
    } catch {
      // safe fallback
    }
    setCurrentView('admin_login');
  };

  // Dedicated full-screen Dashboard view for cell staff, supervisor, and super_admin
  if (currentView === 'dashboard') {
    return (
      <DashboardLayout 
        onExitDashboard={() => {
          try {
            window.history.pushState({ route: 'home' }, '', '/');
          } catch {
            // safe fallback
          }
          setCurrentView('home');
        }} 
        onLogout={handleLogoutAdmin}
      />
    );
  }

  // Dedicated official /admin Login screen with 3 roles and PIN authentication
  if (currentView === 'admin_login') {
    return (
      <AdminLoginView
        onLoginSuccess={() => {
          try {
            if (window.location.pathname !== '/admin') {
              window.history.pushState({ route: 'admin' }, '', '/admin');
            }
          } catch {
            // safe fallback
          }
          setCurrentView('dashboard');
        }}
        onExitToCitizenPortal={() => {
          try {
            window.history.pushState({ route: 'home' }, '', '/');
          } catch {
            // safe fallback
          }
          setCurrentView('home');
        }}
      />
    );
  }

  return (
    <>
      {/* 1. Official Ministry-Inspired Welcome / Intro Portal Screen */}
      <SplashScreen 
        isOpen={showSplash}
        onClose={() => setShowSplash(false)}
        onSelectTab={(tab) => {
          setShowSplash(false);
          handleScrollToForm(tab);
        }}
      />

      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-900 font-tajawal selection:bg-[#006233]/20 selection:text-[#006233]">
        {/* 2. Official Algerian Ministry-Style Header (Customized for Wilaya d'El Oued) */}
        <Header 
          onNavigateToForm={handleScrollToForm} 
          onOpenWelcome={() => setShowSplash(true)}
          onOpenDashboard={handleOpenDashboard}
        />

        {/* Main Content Sections */}
        <main className="flex-1 w-full space-y-10">
          {currentView === 'privacy' ? (
            <PrivacyPolicy />
          ) : (
            <>
              {/* Hero Section */}
              <Hero onSelectTab={handleSelectTab} />
              
              <Domains 
                onDomainClick={handleDomainClick} 
              />
              
              {/* Single-column constrained wrapper for body sections */}
              <div className="w-full space-y-10 sm:space-y-12">
                {/* How It Works (Vertical Timeline) */}
                <HowItWorks />
                
                {/* Interactive Form & Tracking (Primary card) */}
                <GrievanceForm 
                  activeTab={formActiveTab} 
                  onTabChange={setFormActiveTab}
                  initialCategory={selectedCategory}
                />
                
                {/* Other Contact Methods & Hotline */}
                <ContactMethods />
                
                {/* Frequently Asked Questions */}
                <FAQ />
              </div>
            </>
          )}
        </main>

        {/* Official Footer */}
        <Footer onPrivacyClick={() => {
          setCurrentView('privacy');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      </div>
    </>
  );
}
