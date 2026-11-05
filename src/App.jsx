import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { SoundProvider } from './context/SoundContext';
import NoticeTicker from './components/NoticeTicker';
import Navbar from './components/Navbar';
import MenuDrawer from './components/MenuDrawer';
import SoundPrompt from './components/SoundPrompt';
import Footer from './components/Footer';
import GyroDepth from './components/GyroDepth';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import WingDetailPage from './pages/WingDetailPage';
import PortalPage from './pages/PortalPage';
import MemberDashboard from './pages/MemberDashboard';
import CommitteeConsole from './pages/CommitteeConsole';
import DisciplineConsole from './pages/DisciplineConsole';
import DirectoryPage from './pages/DirectoryPage';
import SpotlightPage from './pages/SpotlightPage';
import HackathonPage from './pages/HackathonPage';
import ConnectPage from './pages/ConnectPage';
import { EventsListPage, EventDetailPage } from './pages/EventPages';
import {
  WingsPage,
  GalleryPage,
  RecruitmentPage,
  NotFoundPage,
} from './pages/SimplePages';

const ConstellationBackground = lazy(() => import('./components/ConstellationBackground'));

// Scroll to the top on page changes, or to the #section when the link names one.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function MaintenanceBanner() {
  const { platformSwitches } = useData();
  if (!platformSwitches.maintenanceMode) return null;
  return (
    <div className="relative z-40 bg-white text-slate-950 text-center text-xs font-semibold py-2 px-4">
      The ORION committee is updating the site. Some details may change over the next few hours.
    </div>
  );
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="relative min-h-screen text-[#eceef2] overflow-x-hidden font-sans">
      <Suspense fallback={<div aria-hidden="true" className="fixed inset-0 z-0 orion-space" />}>
        <ConstellationBackground />
      </Suspense>

      <div className="relative z-10 flex flex-col min-h-screen">
        <ScrollManager />
        <GyroDepth />
        <MaintenanceBanner />
        <NoticeTicker />
        <Navbar onOpenMenu={() => setMenuOpen(true)} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/wings" element={<WingsPage />} />
            <Route path="/wings/:wingId" element={<WingDetailPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/spotlight" element={<SpotlightPage />} />
            <Route path="/hackathon" element={<HackathonPage />} />
            <Route path="/aarambh" element={<HackathonPage />} />
            <Route path="/team" element={<DirectoryPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/contact" element={<ConnectPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/committee" element={<CommitteeConsole />} />
            <Route path="/discipline" element={<DisciplineConsole />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
        <Toast />
        <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
        <SoundPrompt />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <SoundProvider>
          <Shell />
        </SoundProvider>
      </DataProvider>
    </AuthProvider>
  );
}
