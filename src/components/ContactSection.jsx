import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MapPin, Mail, Phone, Send, Building2, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ContactSection() {
  const { showToast } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'Event Collaboration',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast('📩 Inquiry sent to Club ORION Executive Council! We will respond within 24 hours.', 'success');
      setFormData({
        name: '',
        email: '',
        inquiryType: 'Event Collaboration',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Headquarters & Endorsements</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-display">
            Contact & <span className="gold-glow text-amber-400">Collaborate</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            Have questions regarding Recruitment 2026, faculty endorsements, or inter-college event sponsorships? Reach out directly.
          </p>
        </div>

        {/* Contact Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Address Card & Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6 bg-gradient-to-b from-[#101216]/90 to-[#0c0d10]">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-100 font-display">Club ORION HQ</h3>
                <p className="text-xs text-amber-400 font-semibold">REVA University Student Organization Office</p>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200 block mb-0.5">Official Address</span>
                    <span>Rukmini Knowledge Park, Kattigenahalli, Yelahanka, Bengaluru – 560064, Karnataka, India</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Mail className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">General Inquiries</span>
                    <span className="text-slate-400">orion.club@reva.edu.in</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Phone className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">Student Helpline</span>
                    <span className="text-slate-400">+91 080 4696 6966 (Ext. 204)</span>
                  </div>
                </div>
              </div>

              {/* Campus Location Link */}
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=REVA+University+Bengaluru"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Open REVA Campus Map Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Inquiry Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5 bg-gradient-to-b from-[#0c0d10] to-[#101216]">
              <h3 className="text-xl font-bold text-slate-100 font-display">Official Inquiry Form</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Prof. Vivek Sharma / Delegate"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@reva.edu.in or org email"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Type</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:border-amber-400 outline-none"
                  >
                    <option value="Event Collaboration">Event Collaboration (Inter-College)</option>
                    <option value="Sponsorship & Brands">Corporate Sponsorship & Brands</option>
                    <option value="Faculty / Admin Inquiry">Faculty / Campus Admin Inquiry</option>
                    <option value="Recruitment Query">Recruitment 2026 Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Detail</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide complete context regarding your inquiry or proposal..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:border-amber-400 outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Transmit Inquiry'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
