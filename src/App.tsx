import React, { useState } from 'react';
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
import { ProjectVision } from './components/ProjectVision';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { GrievanceCategory } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'vision' | 'admin_dashboard'>('home');
  const [formActiveTab, setFormActiveTab] = useState<'new' | 'track'>('new');
  const [selectedCategory, setSelectedCategory] = useState<GrievanceCategory>('الحالة المدنية');

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
    return <DashboardLayout onLogout={() => setCurrentView('home')} />;
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
        </main>

        <Footer onPrivacyClick={() => {
          setCurrentView('privacy');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      </div>
    </>
  );
}
