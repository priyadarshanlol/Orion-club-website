import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { X, User, Save, Upload, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useData();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [branch, setBranch] = useState(currentUser?.branch || 'School of C&IT');
  const [yearOfStudy, setYearOfStudy] = useState(currentUser?.yearOfStudy || '3rd Year');
  const [usn, setUsn] = useState(currentUser?.usn || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');

  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file from your device.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
        showToast('Profile photo updated from local device!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    if (!phone.trim() || phone.trim().replace(/\D/g, '').length < 10) {
      showToast('A valid 10-digit mobile number is strictly mandatory.', 'error');
      return;
    }

    const updatedProfileData = {
      displayName: displayName.trim(),
      branch,
      yearOfStudy,
      usn: usn.trim(),
      phone: phone.trim(),
      photoURL: photoURL.trim() || currentUser.photoURL
    };

    updateUserProfile(updatedProfileData);
    showToast('Your profile details & photo have been updated successfully!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0e11] border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 font-display">
                Student Profile & Photo
              </h3>
              <p className="text-[11px] text-slate-400">Direct Local Device Photo Upload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar with Direct Device Upload */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/20 bg-slate-900 flex items-center justify-center">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-500" />
              )}
            </div>
          </div>

          <div className="w-full text-center space-y-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 cursor-pointer shadow-md hover:border-amber-400 transition-all">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Choose Photo from Device</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-500">Upload JPG, PNG or WEBP directly from your computer or phone</p>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Student Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">School / Department *</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none"
              >
                <option value="School of C&IT">School of C&IT</option>
                <option value="School of CSE">School of CSE</option>
                <option value="School of ECE">School of ECE</option>
                <option value="School of AI & DS">School of AI & DS</option>
                <option value="School of Mech">School of Mech</option>
                <option value="School of Civil">School of Civil</option>
                <option value="School of Commerce">School of Commerce</option>
                <option value="School of Management">School of Management</option>
                <option value="School of Arts & Media">School of Arts & Media</option>
                <option value="School of Architecture">School of Architecture</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Year of Study *</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">SRN / USN Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. R23CS112"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 uppercase outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Phone * (Mandatory)</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Official REVA Email (Read-Only)</label>
            <input
              type="text"
              disabled
              value={currentUser.email}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 cursor-not-allowed font-mono text-xs"
            />
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Club Position:</span>
            <span className="font-bold text-amber-300">
              {currentUser.position || 'Visitor'} {currentUser.wing && currentUser.position && !currentUser.position.toLowerCase().includes('visitor') ? `• ${currentUser.wing}` : ''}
            </span>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 font-extrabold text-slate-950 rounded-xl text-sm shadow-xl hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Profile</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
