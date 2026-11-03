import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TRANSLATIONS } from '@/lib/translations';
import { Job, Application } from '@/types';
import { PostJobWizard } from './PostJobWizard';
import { ReportProblemModal } from './ReportProblemModal';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { TrustExplainerModal, BadgeType } from '@/components/trust/TrustExplainerModal';
import {
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';

export const EmployerHome: React.FC = () => {
  const {
    language,
    activeEmployerId,
    employers,
    jobs,
    applications,
    workers,
    updateApplicationStatus,
    updateJobStatus,
    rateApplication,
  } = useAppStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const activeEmployer = employers.find((e) => e.id === activeEmployerId) || employers[0];

  const [activeTab, setActiveTab] = useState<'manage' | 'post' | 'workers' | 'profile'>('manage');
  const [selectedProblemApp, setSelectedProblemApp] = useState<Application | null>(null);
  const [ratingModalApp, setRatingModalApp] = useState<Application | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingTags, setRatingTags] = useState<string[]>(['Punctual', 'Skilled']);
  const [ratingComment, setRatingComment] = useState('Completed work cleanly and on schedule.');
  const [explainerType, setExplainerType] = useState<BadgeType | null>(null);

  const myJobs = jobs.filter((j) => j.employerId === activeEmployer.id);
  const myApplications = applications.filter((a) => a.employerId === activeEmployer.id);

  const availableTags = ['Punctual', 'Skilled', 'Honest', 'Fast & Tidy', 'Brought Own Tools', 'Polite'];

  const toggleRatingTag = (tag: string) => {
    if (ratingTags.includes(tag)) {
      setRatingTags(ratingTags.filter((t) => t !== tag));
    } else {
      setRatingTags([...ratingTags, tag]);
    }
  };

  const handleRateWorker = () => {
    if (!ratingModalApp) return;
    rateApplication(ratingModalApp.id, 'employer', ratingStars, ratingComment, ratingTags);
    setRatingModalApp(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Employer Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Employer Portal
            </div>
            <h1 className="text-2xl font-extrabold text-[#123B63]">
              {activeEmployer.businessName || activeEmployer.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeEmployer.locality}, {activeEmployer.district}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">
                {activeEmployer.trustProfile.promptPaymentRate}% Prompt Payment Track Record
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('post')}
              className="px-4 py-2.5 rounded-xl bg-[#123B63] hover:bg-[#1E5A8A] text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Work</span>
            </button>
          </div>
        </div>

        {/* Employer Trust Stats */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
            Your Trust Profile:
          </span>
          <TrustBadge
            type="employer_trust"
            employerTrust={activeEmployer.trustProfile}
            onOpenExplainer={(t) => setExplainerType(t)}
          />
          <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            ⭐ {activeEmployer.trustProfile.workerRating.toFixed(1)} / 5.0 Worker Rating
          </span>
          <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            {activeEmployer.trustProfile.completedJobs} Jobs Paid & Completed
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'manage'
              ? 'border-[#123B63] text-[#123B63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Posted Jobs ({myJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('post')}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'post'
              ? 'border-[#123B63] text-[#123B63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Guided Post Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'workers'
              ? 'border-[#123B63] text-[#123B63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Browse Available Workers ({workers.length})</span>
        </button>
      </div>

      {/* Tab 1: Manage Jobs & Applicants */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {myJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md mx-auto">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Jobs Posted Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Use our simple guided wizard to publish your work requirements in 2 minutes.
              </p>
              <button
                onClick={() => setActiveTab('post')}
                className="px-5 py-2.5 bg-[#123B63] text-white rounded-xl text-xs font-bold"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myJobs.map((job) => {
                const jobApps = myApplications.filter((a) => a.jobId === job.id);

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4"
                  >
                    {/* Job Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                            {job.skillNeeded}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              job.status === 'open'
                                ? 'bg-emerald-100 text-emerald-800'
                                : job.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {job.status.replace('_', ' ')}
                          </span>
                          {job.urgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                              URGENT
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ₹{job.wage}/{job.wageType} • {job.duration} • Workers needed: {job.workersNeeded} (Assigned: {job.workersAssigned})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status === 'open' && (
                          <button
                            onClick={() => updateJobStatus(job.id, 'paused')}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Pause Job
                          </button>
                        )}
                        {job.status === 'paused' && (
                          <button
                            onClick={() => updateJobStatus(job.id, 'open')}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                          >
                            Resume Job
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Applicants for this Job */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Applicants & Assigned Workers ({jobApps.length}):
                      </div>

                      {jobApps.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                          Waiting for nearby {job.skillNeeded} workers to apply. We have notified workers in {job.locality}.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {jobApps.map((app) => {
                            const worker = workers.find((w) => w.id === app.workerId);

                            return (
                              <div
                                key={app.id}
                                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-sm text-slate-900">
                                        {app.workerName}
                                      </h4>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                        {app.matchBreakdown.totalMatch}% Match
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {app.workerExperience} • Expected ₹{app.workerWage}/day
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#123B63] uppercase font-mono">
                                      {app.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>

                                {/* Transparent trust badges */}
                                {worker && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <TrustBadge
                                      type="identity"
                                      size="sm"
                                      workerTrust={worker.trustProfile}
                                      onOpenExplainer={(t) => setExplainerType(t)}
                                    />
                                    <TrustBadge
                                      type="skill"
                                      size="sm"
                                      workerTrust={worker.trustProfile}
                                      onOpenExplainer={(t) => setExplainerType(t)}
                                    />
                                    <TrustBadge
                                      type="history"
                                      size="sm"
                                      workerTrust={worker.trustProfile}
                                      onOpenExplainer={(t) => setExplainerType(t)}
                                    />
                                    <TrustBadge
                                      type="rating"
                                      size="sm"
                                      workerTrust={worker.trustProfile}
                                      onOpenExplainer={(t) => setExplainerType(t)}
                                    />
                                  </div>
                                )}

                                {/* Employer Action Controls */}
                                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                  {/* Left: Problem Reporting & Replacement */}
                                  {(app.status === 'employer_accepted' || app.status === 'work_started') && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedProblemApp(app)}
                                      className="px-3 py-1.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 min-h-[38px]"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                      <span>⚠️ Report a Problem / Replace Worker</span>
                                    </button>
                                  )}

                                  {/* Right: Lifecycle Step Triggers */}
                                  <div className="flex items-center gap-2 ml-auto">
                                    {app.status === 'request_sent' && (
                                      <>
                                        <button
                                          onClick={() => updateApplicationStatus(app.id, 'employer_viewed')}
                                          className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-white"
                                        >
                                          Mark Viewed
                                        </button>
                                        <button
                                          onClick={() => updateApplicationStatus(app.id, 'employer_accepted')}
                                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                                        >
                                          Accept & Hire Worker ✅
                                        </button>
                                      </>
                                    )}

                                    {app.status === 'employer_viewed' && (
                                      <button
                                        onClick={() => updateApplicationStatus(app.id, 'employer_accepted')}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                                      >
                                        Accept & Hire Worker ✅
                                      </button>
                                    )}

                                    {app.status === 'employer_accepted' && (
                                      <button
                                        onClick={() => updateApplicationStatus(app.id, 'work_started')}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
                                      >
                                        Confirm Worker On Site 🔨
                                      </button>
                                    )}

                                    {app.status === 'work_started' && (
                                      <button
                                        onClick={() => updateApplicationStatus(app.id, 'work_completed')}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                                      >
                                        Mark Work Done & Ready to Pay 🏁
                                      </button>
                                    )}

                                    {app.status === 'work_completed' && (
                                      <button
                                        onClick={() => updateApplicationStatus(app.id, 'payment_confirmed')}
                                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow"
                                      >
                                        Confirm Payment Released (₹{app.wage}) 💰
                                      </button>
                                    )}

                                    {app.status === 'payment_confirmed' && !app.ratingByEmployer && (
                                      <button
                                        onClick={() => setRatingModalApp(app)}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow"
                                      >
                                        Rate Worker & Leave Endorsement ⭐
                                      </button>
                                    )}

                                    {app.ratingByEmployer && (
                                      <div className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                        <span>Rated {app.ratingByEmployer.rating}/5 stars</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Guided Post Wizard */}
      {activeTab === 'post' && (
        <PostJobWizard
          onJobCreated={() => setActiveTab('manage')}
          onCancel={() => setActiveTab('manage')}
        />
      )}

      {/* Tab 3: Browse Available Workers */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-semibold">
            All workers in your district. Reach out directly or invite to your posted job:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{worker.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {worker.primarySkill} • {worker.experienceLevel}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{worker.locality}, {worker.district} ({worker.distanceKm} km)</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-[#123B63]">
                      ₹{worker.expectedDailyWage}/day
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-bold">Available Now</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <TrustBadge
                    type="identity"
                    size="sm"
                    workerTrust={worker.trustProfile}
                    onOpenExplainer={(t) => setExplainerType(t)}
                  />
                  <TrustBadge
                    type="skill"
                    size="sm"
                    workerTrust={worker.trustProfile}
                    onOpenExplainer={(t) => setExplainerType(t)}
                  />
                  <TrustBadge
                    type="history"
                    size="sm"
                    workerTrust={worker.trustProfile}
                    onOpenExplainer={(t) => setExplainerType(t)}
                  />
                  <TrustBadge
                    type="rating"
                    size="sm"
                    workerTrust={worker.trustProfile}
                    onOpenExplainer={(t) => setExplainerType(t)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem & Replacement Modal */}
      <ReportProblemModal
        application={selectedProblemApp}
        isOpen={selectedProblemApp !== null}
        onClose={() => setSelectedProblemApp(null)}
      />

      {/* Rate Worker Modal */}
      {ratingModalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#123B63]">
              Rate Worker: {ratingModalApp.workerName}
            </h3>
            <p className="text-xs text-slate-500">
              Provide fair ratings and category tags. Your endorsement builds their platform reputation.
            </p>

            <div className="flex justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingStars(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingStars ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Worker Strengths & Tags:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isChecked = ratingTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleRatingTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isChecked
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employer Review Note
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#123B63]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRatingModalApp(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRateWorker}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Submit Endorsement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust Explainer Modal */}
      <TrustExplainerModal
        isOpen={explainerType !== null}
        onClose={() => setExplainerType(null)}
        badgeType={explainerType}
        employerTrust={activeEmployer.trustProfile}
        employerName={activeEmployer.name}
      />
    </div>
  );
};
