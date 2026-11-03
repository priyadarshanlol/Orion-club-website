import React, { Suspense, lazy, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

const ConstellationBackground = lazy(() => import('./components/ConstellationBackground'));
import NoticeTicker from './components/NoticeTicker';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WingsSection from './components/WingsSection';
import MemberManagementHub from './components/MemberManagementHub';
import RecruitmentPortal from './components/RecruitmentPortal';
import EventsSection from './components/EventsSection';
import TeamSection from './components/TeamSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Toast from './components/Toast';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <AuthProvider>
      <DataProvider>
        <div className="relative min-h-screen text-[#eceef2] overflow-x-hidden font-sans">
          {/* Canvas Starfield Background */}
          <Suspense fallback={<div aria-hidden="true" className="fixed inset-0 z-0 orion-space" />}>
            <ConstellationBackground />
          </Suspense>

          {/* Main App Content */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {/* Top Live Notice Bar */}
            <NoticeTicker />

            {/* Glassmorphic Navbar */}
            <Navbar 
              isAuthOpen={showAuthModal}
              onOpenAuth={() => setShowAuthModal(true)}
              onCloseAuth={() => setShowAuthModal(false)}
            />

            {/* Main Content Sections */}
            <main className="flex-grow space-y-12">
              <Hero />
              <WingsSection />
              <MemberManagementHub onOpenAuth={() => setShowAuthModal(true)} />
              <RecruitmentPortal />
              <EventsSection />
              <TeamSection />
              <ContactSection />
            </main>

            {/* Footer */}
            <Footer />

            {/* Global Toast System */}
            <Toast />
          </div>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
