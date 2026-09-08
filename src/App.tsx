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
import { GrievanceCategory } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'privacy'>('home');
  const [formActiveTab, setFormActiveTab] = useState<'new' | 'track'>('new');
  const [selectedCategory, setSelectedCategory] = useState<GrievanceCategory>('الحالة المدنية');

  useEffect(() => {
    // Check if user chose to skip welcome intro on startup
    const skip = localStorage.getItem('eloued_skip_welcome');
    if (skip === 'true') {
      setShowSplash(false);
    }
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
        />

        {/* Main Content Sections */}
        <main className="flex-1 w-full space-y-10">
          {currentView === 'privacy' ? (
            <PrivacyPolicy />
          ) : (
            <>
              {/* Hero Section */}
              <Hero onSelectTab={handleSelectTab} />
              
              <Domains onDomainClick={handleDomainClick} />
              
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
