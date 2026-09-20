import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TRANSLATIONS } from '@/lib/translations';
import { ALL_SKILLS } from '@/data/seedData';
import { Job, Worker } from '@/types';
import { calculateJobMatch } from '@/lib/matchEngine';
import { VoiceService, VoiceRecognitionResult } from '@/lib/voiceService';
import { JobDetailModal } from './JobDetailModal';
import { WorkerRegistrationModal } from './WorkerRegistrationModal';
import { MyWorkTracker } from './MyWorkTracker';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { TrustExplainerModal, BadgeType } from '@/components/trust/TrustExplainerModal';
import {
  Mic,
  MicOff,
  Search,
  Filter,
  Volume2,
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
  Briefcase,
  UserPlus,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export const WorkerHome: React.FC = () => {
  const {
    language,
    workers,
    activeWorkerId,
    jobs,
    employers,
    applications,
  } = useAppStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const activeWorker = workers.find((w) => w.id === activeWorkerId) || workers[0];

  // Tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'tracker'>('feed');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [maxDistance, setMaxDistance] = useState<number>(20);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [wageTypeFilter, setWageTypeFilter] = useState<'All' | 'Daily' | 'Hourly' | 'Fixed'>('All');

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [explainerType, setExplainerType] = useState<BadgeType | null>(null);

  // Speaking state for inline listen buttons
  const [speakingJobId, setSpeakingJobId] = useState<string | null>(null);

  const myApplicationsCount = applications.filter((a) => a.workerId === activeWorker.id).length;

  // Voice Search Handler
  const handleStartVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceNotice(null);
      return;
    }

    setIsListening(true);
    setVoiceNotice('Listening... Speak your skill (e.g. "Mason work" or "Plumber near me")');

    const stopFn = VoiceService.startListening(
      (result: VoiceRecognitionResult) => {
        setIsListening(false);
        setSearchQuery(result.transcript);
        setVoiceNotice(
          result.isSimulated
            ? `Voice recognized: "${result.transcript}"`
            : `Heard: "${result.transcript}"`
        );
        setTimeout(() => setVoiceNotice(null), 4000);
      },
      (error: string) => {
        setIsListening(false);
        setVoiceNotice('Could not recognize voice. Please type your search.');
        setTimeout(() => setVoiceNotice(null), 3000);
      },
      language
    );
  };

  const handleSpeakJobCard = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (speakingJobId === job.id) {
      VoiceService.stopSpeaking();
      setSpeakingJobId(null);
    } else {
      setSpeakingJobId(job.id);
      const text = `${job.title} in ${job.locality}. Pays rupees ${job.wage} ${job.wageType}. Duration: ${job.duration}. ${job.perks?.join(', ') || ''}`;
      VoiceService.speak(text, language);
      setTimeout(() => setSpeakingJobId(null), 7000);
    }
  };

  // Filter Jobs
  const filteredJobs = jobs.filter((job) => {
    if (job.status !== 'open') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${job.title} ${job.skillNeeded} ${job.locality} ${job.district} ${job.description}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Skill filter
    if (selectedSkill !== 'All') {
      const firstWord = selectedSkill.split(' ')[0].toLowerCase();
      if (!job.skillNeeded.toLowerCase().includes(firstWord)) return false;
    }

    // Distance filter
    if (job.distanceKm > maxDistance) return false;

    // Urgent filter
    if (urgentOnly && !job.urgent) return false;

    // Wage type filter
    if (wageTypeFilter !== 'All' && job.wageType !== wageTypeFilter) return false;

    return true;
  });

  // Calculate and sort by match score descending
  const jobsWithMatches = filteredJobs.map((job) => ({
    job,
    match: calculateJobMatch(activeWorker, job),
  })).sort((a, b) => b.match.totalMatch - a.match.totalMatch);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Worker Greeting & Trust Strip */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Namaste / Welcome, Worker
            </div>
            <h1 className="text-2xl font-extrabold text-[#123B63] tracking-tight">
              {activeWorker.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeWorker.locality}, {activeWorker.district}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-emerald-700">{activeWorker.experienceLevel}</span>
              <span className="text-slate-300">•</span>
              <span>Expected: <strong>₹{activeWorker.expectedDailyWage}/day</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRegModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors min-h-[44px]"
            >
              <UserPlus className="w-4 h-4 text-[#123B63]" />
              <span>Register New Profile</span>
            </button>
          </div>
        </div>

        {/* Transparent Trust Badges for active worker */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase">
            Your Trust Badges:
          </span>
          <TrustBadge
            type="identity"
            workerTrust={activeWorker.trustProfile}
            onOpenExplainer={(t) => setExplainerType(t)}
          />
          <TrustBadge
            type="skill"
            workerTrust={activeWorker.trustProfile}
            onOpenExplainer={(t) => setExplainerType(t)}
          />
          <TrustBadge
            type="history"
            workerTrust={activeWorker.trustProfile}
            onOpenExplainer={(t) => setExplainerType(t)}
          />
          <TrustBadge
            type="rating"
            workerTrust={activeWorker.trustProfile}
            onOpenExplainer={(t) => setExplainerType(t)}
          />
          <TrustBadge
            type="complaints"
            workerTrust={activeWorker.trustProfile}
            onOpenExplainer={(t) => setExplainerType(t)}
          />
        </div>
      </div>

      {/* Primary Action / Tab Selector */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'feed'
              ? 'border-[#123B63] text-[#123B63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t.availableJobs}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#123B63] text-xs font-mono font-bold">
            {jobsWithMatches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'tracker'
              ? 'border-[#123B63] text-[#123B63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.myWorkTracker}</span>
          {myApplicationsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-mono font-bold">
              {myApplicationsCount}
            </span>
          )}
        </button>
      </div>

      {/* Main View Switch */}
      {activeTab === 'tracker' ? (
        <MyWorkTracker />
      ) : (
        <div className="space-y-6">
          {/* Search & Voice Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              {/* Text Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by skill, area, or task (e.g. Mason, Putty, Wiring)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B63]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Big 44px+ Voice Search Button */}
              <button
                onClick={handleStartVoiceSearch}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all min-h-[48px] active:scale-98 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                    : 'bg-[#123B63] hover:bg-[#1E5A8A] text-white'
                }`}
                title="Speak to search using microphone"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-amber-300" />
                    <span>{t.voiceSearch}</span>
                  </>
                )}
              </button>
            </div>

            {/* Voice Notice Toast */}
            {voiceNotice && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-[#123B63] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Mic className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{voiceNotice}</span>
              </div>
            )}

            {/* Filter Chips: Skills */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Filter by Trade / Skill:
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedSkill('All')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                    selectedSkill === 'All'
                      ? 'bg-[#123B63] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Trades ({jobs.filter((j) => j.status === 'open').length})
                </button>
                {ALL_SKILLS.map((skill) => {
                  const isSelected = selectedSkill === skill;
                  return (
                    <button
                      key={skill}
                      onClick={() => setSelectedSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                        isSelected
                          ? 'bg-[#123B63] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {skill.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Secondary Filters */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">Distance:</span>
                {[2, 5, 10, 20].map((km) => (
                  <button
                    key={km}
                    onClick={() => setMaxDistance(km)}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      maxDistance === km
                        ? 'bg-blue-50 border-[#123B63] text-[#123B63] font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Within {km} km
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-red-600">
                  <input
                    type="checkbox"
                    checked={urgentOnly}
                    onChange={(e) => setUrgentOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>🔥 Urgent Work Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Job Feed Cards */}
          {jobsWithMatches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Jobs Match These Filters</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try expanding the distance to 20 km or select "All Trades" above.
              </p>
              <button
                onClick={() => {
                  setSelectedSkill('All');
                  setMaxDistance(20);
                  setUrgentOnly(false);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-[#123B63] text-white rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobsWithMatches.map(({ job, match }) => {
                const employer = employers.find((e) => e.id === job.employerId);
                const isSpeakingThis = speakingJobId === job.id;

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-[#123B63] hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer space-y-4 group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          {job.skillNeeded}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {job.urgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                              URGENT
                            </span>
                          )}
                          {/* Deterministic Match Pill */}
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-700" />
                            <span>{match.totalMatch}% Match</span>
                          </span>
                        </div>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#123B63] transition-colors leading-snug">
                        {job.title}
                      </h3>

                      {/* Employer & Distance */}
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.locality}, {job.district}
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          {job.distanceKm.toFixed(1)} km away
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>Employer: {job.employerName}</span>
                      </div>

                      {/* Wage Box */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Offered Wage</div>
                          <div className="text-lg font-extrabold text-[#123B63] flex items-center">
                            <IndianRupee className="w-4 h-4" />
                            <span>{job.wage}</span>
                            <span className="text-xs font-normal text-slate-500 ml-1">/{job.wageType}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Duration</div>
                          <div className="text-xs font-bold text-slate-800">{job.duration}</div>
                          <div className="text-[10px] text-emerald-700 font-medium">{job.startDate}</div>
                        </div>
                      </div>

                      {/* Match Breakdown Summary */}
                      <div className="mt-2 text-[11px] text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        <span className="font-bold text-emerald-900">Match Breakdown: </span>
                        <span>Skill {match.skillMatch}/40 • Dist {match.distanceMatch}/25 • Wage {match.wageMatch}/15</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Audio Button */}
                      <button
                        type="button"
                        onClick={(e) => handleSpeakJobCard(e, job)}
                        className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-semibold ${
                          isSpeakingThis
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Listen to this job in spoken voice"
                      >
                        <Volume2 className="w-4 h-4 text-[#123B63]" />
                        <span className="hidden sm:inline">
                          {isSpeakingThis ? 'Stop' : 'Listen'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="flex-1 py-2.5 px-4 bg-[#123B63] group-hover:bg-[#1E5A8A] text-white text-xs font-bold rounded-xl shadow-sm text-center transition-colors min-h-[44px] flex items-center justify-center gap-1"
                      >
                        <span>View Details & Apply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <JobDetailModal
        job={selectedJob}
        worker={activeWorker}
        employer={employers.find((e) => e.id === selectedJob?.employerId)}
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        onAppliedSuccessfully={() => setActiveTab('tracker')}
      />

      <WorkerRegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
      />

      <TrustExplainerModal
        isOpen={explainerType !== null}
        onClose={() => setExplainerType(null)}
        badgeType={explainerType}
        workerTrust={activeWorker.trustProfile}
        workerName={activeWorker.name}
      />
    </div>
  );
};
