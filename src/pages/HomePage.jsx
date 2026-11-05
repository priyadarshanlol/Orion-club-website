import React from 'react';
import Hero from '../components/Hero';
import WingsShowcase from '../components/WingsShowcase';
import { EventsPreview, Milestones, GalleryPreview, Announcements, LeadershipPreview, JoinSection } from '../components/HomeSections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <WingsShowcase />
      <EventsPreview />
      <Milestones />
      <GalleryPreview />
      <Announcements />
      <LeadershipPreview />
      <JoinSection />
    </>
  );
}
