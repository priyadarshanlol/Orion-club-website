import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import EventsSection from '../components/EventsSection';
import TeamSection from '../components/TeamSection';
import RecruitmentPortal from '../components/RecruitmentPortal';
import ContactSection from '../components/ContactSection';
import WingsShowcase from '../components/WingsShowcase';
import WingCard from '../components/WingCard';
import Gallery from '../components/Gallery';
import { Announcements } from '../components/HomeSections';
import { PageHeader, PageShell, EmptyState, primaryButton } from '../components/ui';

export function WingsPage() {
  const { wings } = useData();
  return (
    <>
      <WingsShowcase headingAs="h1" />
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {wings.map((w) => (
            <Link key={w.id} to={`/wings/${w.id}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded-3xl">
              <WingCard wing={w} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function EventsPage() {
  return (
    <div className="pt-4">
      <EventsSection />
      <Announcements limit={6} />
    </div>
  );
}

export function TeamPage() {
  return <div className="pt-4"><TeamSection /></div>;
}

export function RecruitmentPage() {
  return <div className="pt-4"><RecruitmentPortal /></div>;
}

export function ContactPage() {
  return <div className="pt-4"><ContactSection /></div>;
}

export function GalleryPage() {
  const { events } = useData();
  return (
    <PageShell>
      <PageHeader eyebrow="Visual archive" title="Media" accent="Gallery">
        Photos and films from every completed ORION event, curated by the Media &amp; Marketing wing. Select any frame to open it full screen.
      </PageHeader>
      <Gallery events={events} />
    </PageShell>
  );
}

export function NotFoundPage() {
  return (
    <PageShell>
      <EmptyState
        title="This star is not on our chart"
        action={<Link to="/" className={`${primaryButton} mt-4`}>Back to campus home</Link>}
      >
        The page you followed doesn’t exist or has moved.
      </EmptyState>
    </PageShell>
  );
}
