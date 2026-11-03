import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { LANGUAGES, TRANSLATIONS } from '@/lib/translations';
import { LanguageCode, UserRole } from '@/types';
import { Globe, Shield, User, HardHat, Building2, HelpCircle, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    role,
    setRole,
    activeWorkerId,
    activeEmployerId,
    setActiveWorker,
    setActiveEmployer,
    workers,
    employers,
    reopenOnboarding,
    resetToDemoData,
  } = useAppStore();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const activeWorker = workers.find((w) => w.id === activeWorkerId) || workers[0];
  const activeEmployer = employers.find((e) => e.id === activeEmployerId) || employers[0];

  return (
    <header className="sticky top-0 z-40 bg-[#123B63] text-white shadow-md border-b border-blue-900/60">
      {/* Top Banner / Civic Notice */}
      <div className="bg-[#0E2A47] px-4 py-1 text-[11px] text-blue-200 flex flex-wrap items-center justify-between border-b border-blue-950">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>India Local Work & Citizen Connection Platform • No Mandatory Certificates</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={reopenOnboarding}
            className="hover:text-white transition-colors flex items-center gap-1 text-[11px] underline underline-offset-2"
          >
            <HelpCircle className="w-3 h-3" />
            <span>How It Works</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Reset to standard seed demo data?')) {
                resetToDemoData();
              }
            }}
            className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            title="Reset platform demo data"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-extrabold shadow-sm border border-white/20 text-lg">
            WB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white">WORK BRIDGE</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-[10px] font-semibold">
                TRUSTED
              </span>
            </div>
            <p className="text-[11px] text-blue-200 tracking-wide hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector (13 Indian Languages) */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setDemoMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1E5A8A] hover:bg-[#286FA8] text-white rounded-lg text-xs font-medium border border-blue-400/30 transition-colors"
              title="Select Language (13 Languages Available)"
            >
              <Globe className="w-3.5 h-3.5 text-blue-200" />
              <span className="font-semibold">{currentLang.native}</span>
              <span className="text-[10px] text-blue-200 hidden md:inline">({currentLang.label})</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Language (13 Indian Languages)
                </div>
                <div className="grid grid-cols-1 divide-y divide-slate-100">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        language === lang.code ? 'bg-blue-50/80 font-bold text-[#123B63]' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-sm">{lang.native}</span>
                      <span className="text-[11px] text-slate-500">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setDemoMenuOpen(!demoMenuOpen);
                setLangMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-lg text-xs font-medium transition-colors"
              title="Switch demo user profile"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Demo Switch</span>
              <span className="sm:hidden">Switch</span>
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-2 z-50 text-xs">
                <div className="font-semibold text-slate-900 mb-1 px-1">Quick Demo Accounts</div>
                <div className="text-[11px] text-slate-500 mb-2 px-1">
                  Test the platform as different people with real verified trust records:
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setRole('worker');
                      setActiveWorker('w-1');
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 border ${
                      role === 'worker' && activeWorkerId === 'w-1'
                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                        : 'hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Worker: Ramesh Kumar (Mason)</div>
                      <div className="text-[10px] text-slate-500">
                        8 yrs exp • 18 completed jobs • No certificate (Honored)
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setRole('worker');
                      setActiveWorker('w-2');
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 border ${
                      role === 'worker' && activeWorkerId === 'w-2'
                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                        : 'hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Worker: Suresh Patil (Electrician)</div>
                      <div className="text-[10px] text-slate-500">
                        ITI Certified • 9 completed jobs • Verified skill
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setRole('employer');
                      setActiveEmployer('emp-1');
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 border ${
                      role === 'employer' && activeEmployerId === 'emp-1'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                        : 'hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Employer: Venkat Rao</div>
                      <div className="text-[10px] text-slate-500">
                        Contractor • 42 jobs paid • 100% prompt pay record
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setRole('admin');
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 border ${
                      role === 'admin'
                        ? 'bg-purple-50 border-purple-400 text-purple-900'
                        : 'hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Platform Admin Portal</div>
                      <div className="text-[10px] text-slate-500">
                        Identity queue, skill verification, complaints, replacements
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Switcher Tabs */}
      <div className="bg-[#0D2D4D] border-t border-blue-900/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex space-x-1 py-1.5">
            <button
              onClick={() => setRole('worker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
                role === 'worker'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>{t.workerRole}</span>
              {role === 'worker' && (
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-mono">
                  {activeWorker.name.split(' ')[0]}
                </span>
              )}
            </button>

            <button
              onClick={() => setRole('employer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
                role === 'employer'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                  : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t.employerRole}</span>
              {role === 'employer' && (
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-mono">
                  {activeEmployer.name.split(' ')[0]}
                </span>
              )}
            </button>

            <button
              onClick={() => setRole('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
                role === 'admin'
                  ? 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-300'
                  : 'text-purple-200 hover:bg-white/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{t.adminRole}</span>
            </button>
          </div>

          <div className="text-[11px] text-blue-200 hidden md:flex items-center gap-2 pr-2">
            {role === 'worker' && (
              <span>
                Active Worker: <strong>{activeWorker.name}</strong> ({activeWorker.primarySkill})
              </span>
            )}
            {role === 'employer' && (
              <span>
                Active Employer: <strong>{activeEmployer.businessName || activeEmployer.name}</strong>
              </span>
            )}
            {role === 'admin' && <span>Administrator Console: Full Access</span>}
          </div>
        </div>
      </div>
    </header>
  );
};
