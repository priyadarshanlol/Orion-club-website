import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  X, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  User, 
  Hash, 
  Phone, 
  Upload 
} from 'lucide-react';
import { motion } from 'framer-motion';

// Official Microsoft 4-Color Logo
export function MicrosoftLogo({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 23 23">
      <path fill="#f25022" d="M0 0h11v11H0z" />
      <path fill="#00a4ef" d="M12 0h11v11H12z" />
      <path fill="#7fba00" d="M0 12h11v11H0z" />
      <path fill="#ffb900" d="M12 12h11v11H12z" />
    </svg>
  );
}

const REVA_BRANCHES = [
  'School of C&IT (Computer Science & Info Tech)',
  'School of CSE (Computer Science & Engineering)',
  'School of ECE (Electronics & Communication)',
  'School of AI & Data Science',
  'School of Mechanical Engineering',
  'School of Civil Engineering',
  'School of Arts, Humanities & Social Sciences',
  'School of Media & Journalism',
  'School of Management Studies',
  'School of Commerce',
  'School of Applied Sciences',
  'School of Legal Studies'
];

const REVA_YEARS = ['1st Year (Fresher)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)'];

const WING_OPTIONS = [
  '01 - NANAK (Discipline & Governance)',
  '02 - ZAYD-BODHI (Internal & External Affairs)',
  '03 - KALA-SANSKRITI (Cultural & Performing Arts)',
  '04 - ARJUNA (Technical & Web Innovation)',
  '05 - MEDIA & MARKETING (Media, Campaigns & PR)'
];

export default function MicrosoftAuthModal({ isOpen, onClose }) {
  const { 
    loginWithMicrosoft, 
    signUpWithEmailPassword, 
    signInWithEmailPassword, 
    resetPassword,
    validatePassword,
    authError, 
    clearAuthError 
  } = useAuth();

  const { showToast } = useData();

  // Step flow: 'email-step' | 'password-step' | 'signup' | 'forgot-password'
  const [step, setStep] = useState('email-step');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [localError, setLocalError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Comprehensive Student Sign-up Details
  const [fullName, setFullName] = useState('');
  const [srn, setSrn] = useState('');
  const [branch, setBranch] = useState(REVA_BRANCHES[0]);
  const [year, setYear] = useState(REVA_YEARS[1]);
  const [primaryWing, setPrimaryWing] = useState(WING_OPTIONS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const passwordChecks = validatePassword(password);

  if (!isOpen) return null;

  // Handle Local Device Photo Upload
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setLocalError('Please upload a valid image file (PNG, JPG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Step 1 -> Step 2
  const handleEmailNext = (e) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    const clean = email.trim().toLowerCase();
    if (!clean) {
      setLocalError('Please enter your REVA Microsoft email or SRN.');
      return;
    }

    if (clean.includes('@gmail.com') || clean.includes('@googlemail.com') || clean.includes('google')) {
      setLocalError('Google accounts are not permitted. Authentication is strictly via your official REVA University Microsoft 365 account (@reva.edu.in).');
      return;
    }

    let formatted = clean;
    if (!clean.includes('@')) {
      formatted = `${clean}@reva.edu.in`;
      setEmail(formatted);
    } else if (!clean.endsWith('@reva.edu.in')) {
      setLocalError('Access Restricted: Only official @reva.edu.in Microsoft student accounts are authorized. Google and external accounts are not supported.');
      return;
    }

    setStep('password-step');
  };

  // Handle Step 2: Password Sign In
  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    if (!password) {
      setLocalError('Please enter your Microsoft password.');
      return;
    }

    const res = await signInWithEmailPassword(email, password);
    if (res.success) {
      showToast('Signed in successfully with Microsoft SSO!', 'success');
      onClose();
    } else {
      setLocalError(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  // Handle Comprehensive Student Sign Up
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    if (!fullName.trim() || !srn.trim()) {
      setLocalError('Full Name and Student Registration Number (SRN) are mandatory.');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.trim().replace(/\D/g, '').length < 10) {
      setLocalError('A valid 10-digit mobile/WhatsApp number is strictly required.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.includes('@gmail.com') || cleanEmail.includes('@googlemail.com') || cleanEmail.includes('google')) {
      setLocalError('Google accounts are not permitted. Registration is strictly restricted to your official REVA University Microsoft 365 account (@reva.edu.in).');
      return;
    }
    if (!cleanEmail.endsWith('@reva.edu.in')) {
      setLocalError('Registration requires an official @reva.edu.in Microsoft student email.');
      return;
    }

    if (!passwordChecks.isValid) {
      setLocalError(passwordChecks.errorMessage);
      return;
    }

    const signupPayload = {
      name: fullName.trim(),
      email: cleanEmail,
      password,
      srn: srn.trim().toUpperCase(),
      branch,
      year,
      wing: primaryWing,
      phone: phoneNumber.trim(),
      avatar: avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.trim()}`
    };

    const res = await signUpWithEmailPassword(signupPayload);

    if (res.success) {
      showToast(`Welcome to Club ORION, ${fullName.trim()}! Account created in Student Visitor mode.`, 'success');
      onClose();
    } else {
      setLocalError(res.error || 'Registration could not be completed.');
    }
  };

  // Handle 1-Click Microsoft Azure AD SSO
  const handleDirectMicrosoftSSO = async () => {
    setLocalError('');
    clearAuthError();
    const res = await loginWithMicrosoft();
    if (res.success) {
      showToast('Authenticated via REVA Microsoft Azure AD!', 'success');
      onClose();
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    setResetSuccess('');
    clearAuthError();

    if (!email.trim().toLowerCase().endsWith('@reva.edu.in')) {
      setLocalError('Please provide an official @reva.edu.in email to send reset instructions.');
      return;
    }

    const res = await resetPassword(email);
    if (res.success) {
      setResetSuccess(res.message);
    } else {
      setLocalError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-[#18181b] border border-[#27272a] rounded-2xl p-7 sm:p-9 max-w-md w-full shadow-2xl relative text-slate-100 font-['Segoe_UI',-apple-system,BlinkMacSystemFont,Roboto,sans-serif]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Microsoft Header with 4-Color Logo */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <MicrosoftLogo className="w-6 h-6" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-tight text-white font-['Segoe_UI',sans-serif]">
                Microsoft
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-wider uppercase">
                REVA Azure AD SSO
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Microsoft 365
          </span>
        </div>

        {/* Error Banners */}
        {(localError || authError) && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: EMAIL / SRN ENTRY */}
        {/* ============================================================ */}
        {step === 'email-step' && (
          <form onSubmit={handleEmailNext} className="space-y-4">
            <div className="space-y-1 mb-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign in</h2>
              <p className="text-xs text-slate-400">
                Official REVA University Microsoft authentication. Personal Google accounts are not supported.
              </p>
            </div>

            {/* Direct 1-Click Microsoft Azure AD SSO */}
            <button
              type="button"
              onClick={handleDirectMicrosoftSSO}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0067b8] hover:bg-[#0078d4] text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2.5 border border-[#0078d4]/50 hover:scale-[1.01]"
            >
              <MicrosoftLogo className="w-4 h-4" />
              <span>Sign in with Microsoft 365 (Azure AD SSO)</span>
            </button>

            {/* Visual Divider */}
            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-slate-700/80"></div>
              <span className="px-2.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                OR ENTER REVA MICROSOFT EMAIL
              </span>
              <div className="flex-1 border-t border-slate-700/80"></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Microsoft Email or SRN
              </label>
              <input
                type="text"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="srn@reva.edu.in"
                className="w-full px-3.5 py-2.5 bg-[#09090b] border border-slate-700 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8] outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">Institutional @reva.edu.in accounts only</p>
            </div>

            <div className="text-xs space-y-1 text-slate-400">
              <div>
                <span>No account? </span>
                <button
                  type="button"
                  onClick={() => { setStep('signup'); setLocalError(''); }}
                  className="text-[#00a4ef] hover:underline font-medium"
                >
                  Create one!
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => { setStep('forgot-password'); setLocalError(''); }}
                  className="text-[#00a4ef] hover:underline"
                >
                  Can't access your account?
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-[#0067b8] hover:bg-[#0078d4] text-white font-semibold text-sm shadow-md transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 2: PASSWORD ENTRY */}
        {/* ============================================================ */}
        {step === 'password-step' && (
          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setStep('email-step')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="truncate max-w-[260px] font-mono text-cyan-400">{email}</span>
              </button>
              <h2 className="text-2xl font-bold text-white tracking-tight">Enter password</h2>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3.5 py-2.5 pr-10 bg-[#09090b] border border-slate-700 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-[#0067b8] focus:ring-0"
                />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => { setStep('forgot-password'); setLocalError(''); }}
                className="text-[#00a4ef] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('email-step')}
                className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-[#0067b8] hover:bg-[#0078d4] text-white font-semibold text-sm shadow-md transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 3: COMPREHENSIVE STUDENT SIGN-UP */}
        {/* ============================================================ */}
        {step === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>REVA Student Identification Required</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Create Club Account</h2>
              <p className="text-xs text-slate-400">All fields are strictly required for university verification.</p>
            </div>

            {/* Profile Photo Direct Device Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Profile Photo (Direct Device Upload)
              </label>
              <div className="flex items-center gap-3 p-2.5 bg-[#09090b] border border-slate-700 rounded-xl">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-600 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <label className="flex-1 cursor-pointer px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-center font-semibold text-slate-200 border border-slate-600 transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{avatarPreview ? 'Change Photo from Device' : 'Choose File from Device'}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Student Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohan Mehta"
                  className="w-full px-3 py-2 pl-9 bg-[#09090b] border border-slate-700 rounded-md text-xs text-slate-100 focus:border-[#0067b8] outline-none"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* SRN */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Registration Number (SRN) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={srn}
                  onChange={(e) => setSrn(e.target.value)}
                  placeholder="e.g. R23CS112 / R22CI045"
                  className="w-full px-3 py-2 pl-9 bg-[#09090b] border border-slate-700 rounded-md text-xs text-slate-100 uppercase focus:border-[#0067b8] outline-none"
                />
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* REVA Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">REVA Microsoft Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="srn@reva.edu.in"
                className="w-full px-3 py-2 bg-[#09090b] border border-slate-700 rounded-md text-xs text-slate-100 focus:border-[#0067b8] outline-none"
              />
              <p className="text-[10px] text-amber-400/90 mt-0.5">Must end with @reva.edu.in</p>
            </div>

            {/* Branch & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">School / Branch *</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-2 py-2 bg-[#09090b] border border-slate-700 rounded-md text-[11px] text-slate-200 outline-none"
                >
                  {REVA_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2 py-2 bg-[#09090b] border border-slate-700 rounded-md text-[11px] text-slate-200 outline-none"
                >
                  {REVA_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Primary Wing & Mandatory Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Wing Preference *</label>
                <select
                  value={primaryWing}
                  onChange={(e) => setPrimaryWing(e.target.value)}
                  className="w-full px-2 py-2 bg-[#09090b] border border-slate-700 rounded-md text-[11px] text-slate-200 outline-none"
                >
                  {WING_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Mobile Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 pl-8 bg-[#09090b] border border-slate-700 rounded-md text-xs text-slate-100 focus:border-[#0067b8] outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Create Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars, 1 uppercase, 1 number, 1 special"
                  className="w-full px-3 py-2 pr-10 bg-[#09090b] border border-slate-700 rounded-md text-xs text-slate-100 focus:border-[#0067b8] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Password Checklist */}
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-slate-800 text-[10px] space-y-1">
              <div className={`flex items-center gap-1.5 ${passwordChecks.checks.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                <Check className="w-3 h-3" /> 8+ characters
              </div>
              <div className={`flex items-center gap-1.5 ${passwordChecks.checks.hasUppercase && passwordChecks.checks.hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                <Check className="w-3 h-3" /> Upper and lowercase letters
              </div>
              <div className={`flex items-center gap-1.5 ${passwordChecks.checks.hasNumber && passwordChecks.checks.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                <Check className="w-3 h-3" /> Number and special character (!@#$)
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => { setStep('email-step'); setLocalError(''); }}
                className="text-xs text-[#00a4ef] hover:underline"
              >
                Already registered? Sign in
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-md bg-[#0067b8] hover:bg-[#0078d4] text-white font-semibold text-xs shadow-md transition-colors"
              >
                Register & Verify
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 4: FORGOT PASSWORD */}
        {/* ============================================================ */}
        {step === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Reset password</h2>
              <p className="text-xs text-slate-400">
                Enter your official REVA email to receive password reset instructions.
              </p>
            </div>

            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="srn@reva.edu.in"
                className="w-full px-3.5 py-2.5 bg-[#09090b] border border-slate-700 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:border-[#0067b8] outline-none"
              />
            </div>

            {resetSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setStep('email-step'); setLocalError(''); setResetSuccess(''); }}
                className="text-xs text-[#00a4ef] hover:underline"
              >
                ← Back to sign in
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-[#0067b8] hover:bg-[#0078d4] text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Send link</span>
              </button>
            </div>
          </form>
        )}

        {/* Microsoft Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 text-center flex items-center justify-center gap-3">
          <span className="hover:underline cursor-pointer">Terms of use</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Privacy & cookies</span>
          <span>•</span>
          <span>REVA Azure AD</span>
        </div>
      </motion.div>
    </div>
  );
}
