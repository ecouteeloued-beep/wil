/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

import { GrievanceCategory } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'privacy'>('home');
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
    }, 100);
  };

  const handleDomainClick = (domainTitle: string) => {
    setCurrentView('home');
    setSelectedCategory(domainTitle as GrievanceCategory);
    handleScrollToForm('new');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-900 font-tajawal selection:bg-[#006233]/20 selection:text-[#006233]">
      {/* 1. Header (Sticky) */}
      <Header onNavigateToForm={handleScrollToForm} />

      {/* Main Content Sections */}
      <main className="flex-1 w-full space-y-10">
        {currentView === 'privacy' ? (
          <PrivacyPolicy />
        ) : (
          <>
            {/* 2. Hero Section */}
            <Hero onSelectTab={handleSelectTab} />

            <Domains onDomainClick={handleDomainClick} />

            {/* Single-column constrained wrapper for body sections (max-w ~520px on mobile/tablet) */}
            <div className="w-full space-y-10 sm:space-y-12">
              {/* 3. How It Works (Vertical Timeline) */}
              <HowItWorks />

              {/* 5. Interactive Form & Tracking (Primary card) */}
              <GrievanceForm 
                activeTab={formActiveTab} 
                onTabChange={setFormActiveTab}
                initialCategory={selectedCategory}
              />

              {/* 6. Other Contact Methods */}
              <ContactMethods />

              {/* 7. Frequently Asked Questions (Accordion) */}
              <FAQ />
            </div>
          </>
        )}
      </main>

      {/* 8. Dark Navy Footer */}
      <Footer onPrivacyClick={() => {
        setCurrentView('privacy');
        window.scrollTo(0, 0);
      }} />
    </div>
  );
}
