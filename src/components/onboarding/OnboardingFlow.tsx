import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TRANSLATIONS, LANGUAGES } from '@/lib/translations';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  Globe,
  HardHat,
  Building2,
  Phone,
  User,
  Sparkles,
  Lock
} from 'lucide-react';
import { LanguageCode } from '@/types';

interface OnboardingFlowProps {
  open: boolean;
  onClose: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ open, onClose }) => {
  const {
    language,
    setLanguage,
    setRole,
    registerWorker,
    setActiveWorker,
    setActiveEmployer,
    workers,
    employers,
  } = useAppStore();

  // Sub-stages: 'slides' -> 'language' -> 'role' -> 'auth'
  const [stage, setStage] = useState<'slides' | 'language' | 'role' | 'auth'>('slides');
  const [slideIndex, setSlideIndex] = useState(0);

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'create'>('create');
  const [selectedRole, setSelectedRole] = useState<'worker' | 'employer'>('worker');
  const [phone, setPhone] = useState('9876543210');
  const [name, setName] = useState('');
  const [primarySkill, setPrimarySkill] = useState('Mason (మేస్త్రీ / రాజమిస్త్రీ)');
  const [yearsExp, setYearsExp] = useState('5+ years');
  const [locality, setLocality] = useState('Kukatpally, Hyderabad');
  const [dailyWage, setDailyWage] = useState(750);
  const [hasCertificate, setHasCertificate] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const slides = [
    {
      title: t.findWorkNearYou || 'Find Work Near You',
      description:
        'Find local work based on your real practical skill and exact location. Daily, weekly or monthly engagements nearby.',
      icon: MapPin,
      badge: 'Location & Proximity First',
      highlight: 'Discover jobs within 2-5 km of your locality. Speak naturally in your native language.',
    },
    {
      title: t.findTrustedPeople || 'Find Trusted People',
      description:
        'Connect with verified local employers and skilled workers. Transparent work records, prompt payments and fair reviews.',
      icon: ShieldCheck,
      badge: 'Certificates NEVER Mandatory',
      highlight: 'Practical experience learned on-site is fully respected. Earn trust through real platform jobs.',
    },
    {
      title: t.workMadeSimple || 'Work Made Simple',
      description:
        'Find work. Send request. Complete the job. Confirm payment received. Build your verified track record.',
      icon: Zap,
      badge: 'Simple 1-Tap Workflow',
      highlight: 'Full service recovery if work has issues. Request alternative workers immediately.',
    },
  ];

  if (!open) return null;

  const currentSlide = slides[slideIndex];
  const Icon = currentSlide.icon;

  const handleNextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setStage('language');
    }
  };

  const handleCreateAccountOrLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === 'worker') {
      setRole('worker');
      if (authMode === 'create') {
        const newWorker = registerWorker({
          name: name.trim() || 'New Worker (కొత్త వర్కర్)',
          phone: `+91 ${phone}`,
          locality: locality.split(',')[0]?.trim() || 'Hyderabad Local',
          skills: [primarySkill],
          primarySkill: primarySkill,
          experienceLevel: yearsExp,
          expectedDailyWage: dailyWage,
          bio: 'Hardworking skilled local worker registered on Work Bridge.',
        });
        setActiveWorker(newWorker.id);
      } else {
        // Mock Login: pick first worker
        setActiveWorker(workers[0]?.id || 'w-1');
      }
    } else {
      setRole('employer');
      if (authMode === 'create') {
        // employer creation demo
        setActiveEmployer(employers[0]?.id || 'emp-1');
      } else {
        setActiveEmployer(employers[0]?.id || 'emp-1');
      }
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-2xl">
        {/* Stage 1: Intro Slides */}
        {stage === 'slides' && (
          <div className="flex flex-col">
            <div className="bg-[#123B63] p-6 text-white text-center relative">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20 shadow-inner">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider mb-2">
                {currentSlide.badge}
              </span>
              <h2 className="text-xl font-black tracking-tight">{currentSlide.title}</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed text-center">
                {currentSlide.description}
              </p>

              <div className="p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200 text-xs text-[#123B63] flex items-start gap-2.5">
                <span className="p-1 rounded-full bg-blue-200 text-[#123B63] shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <span className="font-semibold">{currentSlide.highlight}</span>
              </div>

              {/* Dots */}
              <div className="flex justify-center items-center gap-2 pt-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === slideIndex ? 'w-7 bg-[#123B63]' : 'w-2 bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStage('language')}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {t.skip || 'Skip'}
                </button>
                <button
                  onClick={handleNextSlide}
                  className="flex-1 py-3 px-5 bg-[#123B63] hover:bg-[#1E5A8A] text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span>{slideIndex === slides.length - 1 ? 'Choose Language' : t.next || 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: 13 Indian Languages Selector */}
        {stage === 'language' && (
          <div className="flex flex-col">
            <div className="bg-[#123B63] p-5 text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
                <Globe className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-snug">Choose Your Language</h3>
                <p className="text-xs text-blue-200">మీ భాషను ఎంచుకోండి • 13 Regional Languages</p>
              </div>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto grid grid-cols-2 gap-2 bg-slate-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as LanguageCode)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    language === lang.code
                      ? 'border-[#123B63] bg-blue-100/70 shadow-sm ring-2 ring-[#123B63]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm text-slate-900">{lang.native}</span>
                  <span className="text-[11px] text-slate-500">{lang.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setStage('slides')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
              <button
                onClick={() => setStage('role')}
                className="py-2.5 px-6 bg-[#123B63] hover:bg-[#1E5A8A] text-white font-bold rounded-xl text-sm shadow flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Role Selector (Worker vs Employer) */}
        {stage === 'role' && (
          <div className="flex flex-col">
            <div className="bg-[#123B63] p-5 text-white text-center">
              <h3 className="text-lg font-black">What do you need today?</h3>
              <p className="text-xs text-blue-200 mt-1">ఈరోజు మీకు ఏమి కావాలి?</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Option 1: Worker */}
              <button
                onClick={() => {
                  setSelectedRole('worker');
                  setStage('auth');
                }}
                className="w-full p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <HardHat className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">I WANT WORK</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      వర్కర్
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Find nearby daily-wage or contract work based on your trade skills.
                  </p>
                </div>
              </button>

              {/* Option 2: Employer */}
              <button
                onClick={() => {
                  setSelectedRole('employer');
                  setStage('auth');
                }}
                className="w-full p-4 rounded-2xl border-2 border-blue-500/40 bg-blue-50/50 hover:bg-blue-100/60 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#123B63] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">I NEED WORKERS</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#123B63] text-white">
                      యజమాని
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hire verified nearby tradespeople (masons, painters, electricians, helpers).
                  </p>
                </div>
              </button>

              <button
                onClick={() => setStage('language')}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center"
              >
                Back to Languages
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Authentication (Login or Create Account) */}
        {stage === 'auth' && (
          <form onSubmit={handleCreateAccountOrLogin} className="flex flex-col">
            <div className="bg-[#123B63] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {selectedRole === 'worker' ? 'Worker Access (వర్కర్)' : 'Employer Access (యజమాని)'}
                </span>
                <h3 className="text-lg font-black mt-0.5">
                  {authMode === 'create' ? 'Create Your Account' : 'Welcome Back (Login)'}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-white/10">
                <Lock className="w-5 h-5 text-blue-200" />
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setAuthMode('create')}
                className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
                  authMode === 'create'
                    ? 'border-[#123B63] text-[#123B63] bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account (కొత్త ఖాతా)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
                  authMode === 'login'
                    ? 'border-[#123B63] text-[#123B63] bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Quick Login (లాగిన్)
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-3.5 max-h-[360px] overflow-y-auto">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (ఫోన్ నంబర్) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#123B63] focus:outline-none"
                  />
                </div>
              </div>

              {authMode === 'create' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (మీ పేరు) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar / వెంకట్ రావు"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#123B63] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Area / Locality (ప్రాంతం) *
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Kukatpally, Hyderabad"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#123B63] focus:outline-none"
                    />
                  </div>

                  {selectedRole === 'worker' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Primary Skill (పని రకం)
                        </label>
                        <select
                          value={primarySkill}
                          onChange={(e) => setPrimarySkill(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#123B63] focus:outline-none bg-white"
                        >
                          <option value="Mason (మేస్త్రీ / రాజమిస్త్రీ)">Mason (మేస్త్రీ / రాజమిస్త్రీ)</option>
                          <option value="Painter (పెయింటర్)">Painter (పెయింటర్)</option>
                          <option value="Electrician (ఎలక్ట్రీషియన్)">Electrician (ఎలక్ట్రీషియన్)</option>
                          <option value="Plumber (ప్లంబర్)">Plumber (ప్లంబర్)</option>
                          <option value="Carpenter (వడ్రంగి)">Carpenter (వడ్రంగి)</option>
                          <option value="Construction Helper (సహాయకుడు)">Construction Helper (సహాయకుడు)</option>
                          <option value="Farm Worker (వ్యవసాయ కూలీ)">Farm Worker (వ్యవసాయ కూలీ)</option>
                          <option value="Driver (డ్రైవర్)">Driver (డ్రైవర్)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Experience (అనుభవం)
                          </label>
                          <select
                            value={yearsExp}
                            onChange={(e) => setYearsExp(e.target.value)}
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white"
                          >
                            <option value="Learned through practical experience">Practical Experience</option>
                            <option value="1-3 years">1-3 years</option>
                            <option value="3-5 years">3-5 years</option>
                            <option value="5+ years">5+ years</option>
                            <option value="New Worker">New / Fresh</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Daily Wage (రోజు కూలీ ₹)
                          </label>
                          <input
                            type="number"
                            value={dailyWage}
                            onChange={(e) => setDailyWage(Number(e.target.value))}
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Certification notice */}
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Certificate Policy:</strong> Formal certificates are never mandatory. Your practical work history and employer reviews will build your platform trust.
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}

              {authMode === 'login' && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
                  <p className="font-semibold">Demo Phone Authentication</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Click Submit below to log in directly to your profile.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStage('role')}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Change Role
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-5 bg-[#123B63] hover:bg-[#1E5A8A] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{authMode === 'create' ? 'Register & Enter' : 'Sign In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
