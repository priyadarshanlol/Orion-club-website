import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  X, 
  Upload, 
  Edit3, 
  Save, 
  Music,
  Trash2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventsSection() {
  const { events, rsvpEvent, uploadEventMedia, updateEventVenue, updateCulturalDetails, showToast } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Permission Checks:
  const isSuperAdmin = currentUser?.isAdmin;
  const isInternalExternalLeader = 
    isSuperAdmin || 
    (currentUser && (currentUser.wing === 'Internal & External Wing' || currentUser.wing?.toUpperCase().includes('INTERNAL')) &&
    (currentUser.role?.includes('Director') || currentUser.role?.includes('Secretary') || currentUser.role?.includes('Lead')));
  
  const isMediaMarketingLeader = 
    isSuperAdmin || 
    (currentUser && (currentUser.wing === 'Media & Marketing Wing' || currentUser.wing?.toUpperCase().includes('MEDIA')) &&
    (currentUser.role?.includes('Director') || currentUser.role?.includes('Secretary') || currentUser.role?.includes('Lead')));

  const isCulturalLeader = 
    isSuperAdmin || 
    (currentUser && (currentUser.wing === 'Cultural Wing' || currentUser.wing?.toUpperCase().includes('CULTURAL')) &&
    (currentUser.role?.includes('Director') || currentUser.role?.includes('Secretary') || currentUser.role?.includes('Lead')));

  // Edit Mode States in Modal
  const [isEditingVenue, setIsEditingVenue] = useState(false);
  const [editVenueInput, setEditVenueInput] = useState('');
  const [editDateInput, setEditDateInput] = useState('');
  const [editTimeInput, setEditTimeInput] = useState('');
  const [editCoordinatorInput, setEditCoordinatorInput] = useState('');

  // Media & Marketing Wing Upload States
  const [isEditingMedia, setIsEditingMedia] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);

  // Cultural Edit States
  const [isEditingCultural, setIsEditingCultural] = useState(false);
  const [performerInput, setPerformerInput] = useState('');
  const [stageAgendaInput, setStageAgendaInput] = useState('');

  const upcomingEvents = events.filter(e => e.isUpcoming || !e.isFinished);
  const finishedEvents = events.filter(e => e.isFinished || !e.isUpcoming);

  // Live Countdown Hook for flagship event
  const [timeLeft, setTimeLeft] = useState({ days: 7, hours: 14, mins: 32, secs: 10 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Open Event Modal
  const handleOpenEvent = (evt) => {
    setSelectedEventModal(evt);
    setIsEditingVenue(false);
    setIsEditingMedia(false);
    setIsEditingCultural(false);
    setEditVenueInput(evt.venue || '');
    setEditDateInput(evt.date || '');
    setEditTimeInput(evt.time || '');
    setEditCoordinatorInput(evt.venueCoordinator || '');
    setGalleryImages(evt.media?.images || []);
    setGalleryVideos(evt.media?.videos || []);
    setPerformerInput(evt.culturalDetails?.performers?.join(', ') || '');
    setStageAgendaInput(evt.culturalDetails?.stageAgenda || '');
  };

  // Handle local device image upload for finished event (Max 10 images)
  const handleImageFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (galleryImages.length + files.length > 10) {
      showToast('Maximum 10 images allowed per finished event.', 'error');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages(prev => {
          if (prev.length >= 10) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
    showToast(`Added ${files.length} images from local device!`, 'info');
  };

  // Handle local video file upload (Max 5 videos)
  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (galleryVideos.length >= 5) {
      showToast('Maximum 5 videos allowed per finished event.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGalleryVideos(prev => [...prev, reader.result]);
      showToast('Video clip uploaded from local device!', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Save Event Venue (Internal & External)
  const handleSaveVenue = () => {
    if (!selectedEventModal) return;
    updateEventVenue(selectedEventModal.id, {
      venue: editVenueInput,
      date: editDateInput,
      time: editTimeInput,
      venueCoordinator: editCoordinatorInput
    });
    setSelectedEventModal(prev => ({
      ...prev,
      venue: editVenueInput,
      date: editDateInput,
      time: editTimeInput,
      venueCoordinator: editCoordinatorInput
    }));
    setIsEditingVenue(false);
  };

  // Save Event Media Gallery (Media & Marketing Wing)
  const handleSaveMedia = () => {
    if (!selectedEventModal) return;
    uploadEventMedia(selectedEventModal.id, {
      images: galleryImages,
      videos: galleryVideos
    });
    setSelectedEventModal(prev => ({
      ...prev,
      isFinished: true,
      media: {
        images: galleryImages,
        videos: galleryVideos
      }
    }));
    setIsEditingMedia(false);
  };

  // Save Cultural Details
  const handleSaveCultural = () => {
    if (!selectedEventModal) return;
    const performersList = performerInput.split(',').map(p => p.trim()).filter(Boolean);
    updateCulturalDetails(selectedEventModal.id, {
      performers: performersList,
      stageAgenda: stageAgendaInput
    });
    setSelectedEventModal(prev => ({
      ...prev,
      culturalDetails: {
        performers: performersList,
        stageAgenda: stageAgendaInput
      }
    }));
    setIsEditingCultural(false);
  };

  return (
    <section id="events" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Flagships & Timeline • 5 Wings</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-100 leading-tight">
              Events & <span className="heading-accent">Exhibitions</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400">
              Explore upcoming REVA flagship confections managed by Internal & External, and relive completed moments with media galleries curated by Media & Marketing.
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2.5 rounded-xl transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upcoming Events ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2.5 rounded-xl transition-all ${
                activeTab === 'past'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Finished Events Gallery ({finishedEvents.length})
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* UPCOMING EVENTS VIEW */}
        {/* ============================================================ */}
        {activeTab === 'upcoming' && (
          <div className="space-y-8">
            {/* Featured Event Hero Card */}
            {upcomingEvents[0] && (
              <div 
                onClick={() => handleOpenEvent(upcomingEvents[0])}
                className="glass-panel rounded-3xl overflow-hidden border border-amber-500/30 grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-r from-[#101216] to-[#0c0d10] cursor-pointer hover:border-amber-400/60 transition-all group shadow-2xl"
              >
                <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                        {upcomingEvents[0].wing}
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Flagship Countdown
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-display leading-tight group-hover:text-amber-300 transition-colors">
                      {upcomingEvents[0].title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {upcomingEvents[0].description}
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Live Event Countdown</span>
                    <div className="grid grid-cols-4 gap-3 max-w-sm">
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-amber-400 font-display">{timeLeft.days}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">Days</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-amber-400 font-display">{timeLeft.hours}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">Hours</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-amber-400 font-display">{timeLeft.mins}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">Mins</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                        <span className="block text-2xl font-bold text-cyan-400 font-display">{timeLeft.secs}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">Secs</span>
                      </div>
                    </div>
                  </div>

                  {/* Venue & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>{upcomingEvents[0].date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{upcomingEvents[0].venue}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        rsvpEvent(upcomingEvents[0].id);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 rounded-xl text-xs shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all"
                    >
                      RSVP / Book Slot
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 relative min-h-[250px] lg:min-h-full">
                  <img
                    src={upcomingEvents[0].bannerUrl}
                    alt={upcomingEvents[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-transparent to-[#101216]/90" />
                </div>
              </div>
            )}

            {/* Other Upcoming Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.slice(1).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => handleOpenEvent(evt)}
                  className="rounded-3xl border border-slate-800 bg-[#0d0e11] hover:border-amber-500/40 transition-all cursor-pointer overflow-hidden group shadow-lg flex flex-col justify-between"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e11] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      {evt.wing}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> {evt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" /> {evt.time || 'TBA'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display group-hover:text-amber-300 transition-colors">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2">{evt.description}</p>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-cyan-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{evt.venue}</span>
                      </span>
                      <span className="text-xs font-bold text-amber-400 group-hover:underline">
                        View Details & Venue &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FINISHED EVENTS VIEW (MULTIMEDIA GALLERY) */}
        {/* ============================================================ */}
        {activeTab === 'past' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedEvents.map((evt) => {
                const imgCount = evt.media?.images?.length || 0;
                const vidCount = evt.media?.videos?.length || 0;

                return (
                  <div
                    key={evt.id}
                    onClick={() => handleOpenEvent(evt)}
                    className="rounded-3xl border border-slate-800 bg-[#0d0e11] hover:border-amber-500/40 transition-all cursor-pointer overflow-hidden group shadow-lg flex flex-col justify-between"
                  >
                    <div className="h-52 relative overflow-hidden">
                      <img
                        src={evt.bannerUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e11] via-transparent to-transparent" />
                      
                      {/* Media Counts Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> {imgCount}/10 Photos
                        </span>
                        {vidCount > 0 && (
                          <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <Video className="w-3 h-3" /> {vidCount}/5 Videos
                          </span>
                        )}
                      </div>

                      <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        COMPLETED EVENT
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{evt.wing}</span>
                        <span>{evt.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white font-display group-hover:text-amber-300 transition-colors">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2">{evt.description}</p>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[180px]">{evt.venue}</span>
                        <span className="text-amber-400 font-bold group-hover:underline">
                          Open Gallery &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* COMPREHENSIVE EVENT DETAIL & MEDIA GALLERY MODAL */}
        {/* ============================================================ */}
        <AnimatePresence>
          {selectedEventModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-3xl w-full bg-[#0c0d10] border border-amber-500/40 rounded-3xl overflow-hidden relative shadow-2xl space-y-6 p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-slate-100"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="absolute top-5 right-5 z-10 p-2 bg-slate-900/80 text-slate-300 hover:text-white rounded-full border border-slate-700 hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Banner & Title Header */}
                <div className="space-y-4">
                  <div className="h-48 sm:h-56 rounded-2xl overflow-hidden relative border border-slate-800">
                    <img src={selectedEventModal.bannerUrl} alt={selectedEventModal.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                        {selectedEventModal.wing}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md ${
                        selectedEventModal.isFinished ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {selectedEventModal.isFinished ? 'Finished Event' : 'Upcoming Event'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      {selectedEventModal.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {selectedEventModal.description}
                    </p>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* VENUE & LOGISTICS SECTION (Managed by Internal & External) */}
                {/* ============================================================ */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      <MapPin className="w-4 h-4" />
                      <span>Venue & Event Schedule (Internal & External Affairs Wing)</span>
                    </div>

                    {isInternalExternalLeader && (
                      <button
                        type="button"
                        onClick={() => setIsEditingVenue(!isEditingVenue)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditingVenue ? 'Cancel' : 'Edit Venue Details'}</span>
                      </button>
                    )}
                  </div>

                  {isEditingVenue ? (
                    <div className="space-y-3 pt-2 text-xs">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Campus Venue</label>
                        <input
                          type="text"
                          value={editVenueInput}
                          onChange={(e) => setEditVenueInput(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Date</label>
                          <input
                            type="text"
                            value={editDateInput}
                            onChange={(e) => setEditDateInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Time</label>
                          <input
                            type="text"
                            value={editTimeInput}
                            onChange={(e) => setEditTimeInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Venue Coordinator</label>
                        <input
                          type="text"
                          value={editCoordinatorInput}
                          onChange={(e) => setEditCoordinatorInput(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveVenue}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Venue Logistics</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Campus Venue:</span>
                        <span className="font-bold text-slate-100">{selectedEventModal.venue}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Date & Time:</span>
                        <span className="font-bold text-slate-100">{selectedEventModal.date} • {selectedEventModal.time || 'TBA'}</span>
                      </div>
                      {selectedEventModal.venueCoordinator && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 block">Coordinated By:</span>
                          <span className="text-cyan-300 font-medium">{selectedEventModal.venueCoordinator}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ============================================================ */}
                {/* CULTURAL SECTION (If Cultural Wing or Managed by Cultural) */}
                {/* ============================================================ */}
                {(selectedEventModal.wingId === 'cultural' || selectedEventModal.culturalDetails || isCulturalLeader) && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-pink-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
                        <Music className="w-4 h-4" />
                        <span>Stage Performances & Talent (Cultural Wing)</span>
                      </div>

                      {isCulturalLeader && (
                        <button
                          type="button"
                          onClick={() => setIsEditingCultural(!isEditingCultural)}
                          className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditingCultural ? 'Cancel' : 'Edit Stage Line-up'}</span>
                        </button>
                      )}
                    </div>

                    {isEditingCultural ? (
                      <div className="space-y-3 pt-2 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Artist / Troupe Line-up (Comma separated)</label>
                          <input
                            type="text"
                            value={performerInput}
                            onChange={(e) => setPerformerInput(e.target.value)}
                            placeholder="e.g. Orion Fusion Band, Dhwani Street Crew, REVA Dramatics"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Stage Agenda / Rehearsal Schedule</label>
                          <input
                            type="text"
                            value={stageAgendaInput}
                            onChange={(e) => setStageAgendaInput(e.target.value)}
                            placeholder="e.g. Soundcheck at 4PM, Opening performance at 6PM"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveCultural}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Cultural Schedule</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1">
                        {selectedEventModal.culturalDetails?.performers && selectedEventModal.culturalDetails.performers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedEventModal.culturalDetails.performers.map((p, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-pink-950/80 text-pink-300 border border-pink-500/30 rounded-lg text-[11px] font-semibold">
                                🎭 {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No stage performers confirmed yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================ */}
                {/* FINISHED EVENT MULTIMEDIA GALLERY (Max 10 Images, Max 5 Videos) */}
                {/* Handled by Media & Marketing Wing */}
                {/* ============================================================ */}
                {selectedEventModal.isFinished && (
                  <div className="space-y-4 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <ImageIcon className="w-4 h-4" />
                        <span>Multimedia Gallery (Managed by Media & Marketing Wing)</span>
                      </div>

                      {isMediaMarketingLeader && (
                        <button
                          type="button"
                          onClick={() => setIsEditingMedia(!isEditingMedia)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isEditingMedia ? 'Done Editing' : 'Upload Photos / Videos'}</span>
                        </button>
                      )}
                    </div>

                    {/* Media & Marketing Wing Upload Tool */}
                    {isEditingMedia && isMediaMarketingLeader && (
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300">Media Upload Center (Max 10 Photos, Max 5 Videos)</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {galleryImages.length}/10 Photos • {galleryVideos.length}/5 Videos
                          </span>
                        </div>

                        {/* Local File Pickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Photo Upload */}
                          <label className={`p-3 rounded-xl border border-dashed text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                            galleryImages.length >= 10 ? 'opacity-40 pointer-events-none border-slate-700' : 'border-amber-500/40 hover:bg-amber-500/10'
                          }`}>
                            <ImageIcon className="w-6 h-6 text-amber-400" />
                            <span className="font-bold text-slate-200">Upload Photos from Device</span>
                            <span className="text-[10px] text-slate-400">Max 10 Images total (PNG, JPG)</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={galleryImages.length >= 10}
                              onChange={handleImageFilesUpload}
                              className="hidden"
                            />
                          </label>

                          {/* Video Upload */}
                          <label className={`p-3 rounded-xl border border-dashed text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                            galleryVideos.length >= 5 ? 'opacity-40 pointer-events-none border-slate-700' : 'border-cyan-500/40 hover:bg-cyan-500/10'
                          }`}>
                            <Video className="w-6 h-6 text-cyan-400" />
                            <span className="font-bold text-slate-200">Upload Video Clip from Device</span>
                            <span className="text-[10px] text-slate-400">Max 5 Videos total (MP4, WEBM)</span>
                            <input
                              type="file"
                              accept="video/*"
                              disabled={galleryVideos.length >= 5}
                              onChange={handleVideoFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Save Button */}
                        <button
                          type="button"
                          onClick={handleSaveMedia}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save & Publish Media Gallery</span>
                        </button>
                      </div>
                    )}

                    {/* PHOTOS GRID (Max 10) */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-300 block">
                        Event Photographs ({galleryImages.length}/10 Photos)
                      </span>
                      {galleryImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                          {galleryImages.map((img, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-800 bg-slate-900">
                              <img src={img} alt={`Event ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <button
                                type="button"
                                onClick={() => setLightboxImage(img)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                              >
                                <Maximize2 className="w-5 h-5" />
                              </button>
                              {isEditingMedia && (
                                <button
                                  type="button"
                                  onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg hover:bg-rose-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                          No photographs uploaded for this event yet.
                        </p>
                      )}
                    </div>

                    {/* VIDEOS GRID (Max 5) */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-semibold text-slate-300 block">
                        Event Videos & Highlights ({galleryVideos.length}/5 Videos)
                      </span>
                      {galleryVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {galleryVideos.map((vid, vIdx) => (
                            <div key={vIdx} className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video flex flex-col justify-center">
                              <video src={vid} controls className="w-full h-full object-contain" />
                              {isEditingMedia && (
                                <button
                                  type="button"
                                  onClick={() => setGalleryVideos(galleryVideos.filter((_, i) => i !== vIdx))}
                                  className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-lg hover:bg-rose-700 z-10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                          No videos uploaded for this event yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg">
              <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute -top-10 right-0 text-white p-2 rounded-full hover:bg-slate-800"
                >
                  <X className="w-6 h-6" />
                </button>
                <img src={lightboxImage} alt="Expanded preview" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
