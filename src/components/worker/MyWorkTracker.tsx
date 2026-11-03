import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Application, ApplicationStatus } from '@/types';
import {
  CheckCircle2,
  Clock,
  Eye,
  CheckCheck,
  Hammer,
  Flag,
  IndianRupee,
  Star,
  Phone,
  MapPin,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const STEPS: { status: ApplicationStatus; title: string; desc: string; icon: any }[] = [
  { status: 'request_sent', title: 'Request Sent', desc: 'Application sent to employer', icon: Clock },
  { status: 'employer_viewed', title: 'Employer Saw It', desc: 'Profile opened & reviewed', icon: Eye },
  { status: 'employer_accepted', title: 'Accepted', desc: 'Work confirmed & scheduled', icon: CheckCheck },
  { status: 'work_started', title: 'Work Started', desc: 'Worker on site doing the job', icon: Hammer },
  { status: 'work_completed', title: 'Work Completed', desc: 'Work finished on schedule', icon: Flag },
  { status: 'payment_confirmed', title: 'Payment Confirmed', desc: 'Cash / UPI received', icon: IndianRupee },
  { status: 'rated', title: 'Feedback & Rating', desc: 'Mutual ratings exchanged', icon: Star },
];

export const MyWorkTracker: React.FC = () => {
  const { applications, activeWorkerId, updateApplicationStatus, rateApplication } = useAppStore();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Filter applications for active worker
  const myApps = applications.filter((a) => a.workerId === activeWorkerId);
  const activeApp = myApps.find((a) => a.id === selectedAppId) || myApps[0];

  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('Payment received promptly in cash. Good experience.');
  const [showRatingModal, setShowRatingModal] = useState(false);

  const getStepIndex = (status: ApplicationStatus) => {
    return STEPS.findIndex((s) => s.status === status);
  };

  if (myApps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto my-6">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#123B63] mx-auto mb-3">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Applications Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Explore nearby jobs on the Find Work tab and tap "Ask For This Work" to begin.
        </p>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(activeApp.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Selector if multiple applications */}
      {myApps.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {myApps.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                activeApp.id === app.id
                  ? 'bg-[#123B63] text-white border-[#123B63] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{app.jobTitle.slice(0, 28)}...</span>
              <span className="ml-1.5 px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono">
                {app.status.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Active Application Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#123B63] to-[#1E5A8A] p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/20">
              {activeApp.workerSkill}
            </span>
            <span className="text-xs text-blue-200">
              Applied on {new Date(activeApp.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h2 className="text-xl font-bold">{activeApp.jobTitle}</h2>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-blue-100">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeApp.employerLocation}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-300">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>₹{activeApp.wage} / {activeApp.wageType}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Employer: {activeApp.employerPhone} ({activeApp.employerName})</span>
            </div>
          </div>
        </div>

        {/* 7-Step Horizontal / Vertical Lifecycle Stepper */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Application Lifecycle Progress</span>
            <span className="text-[#123B63]">
              Step {currentStepIdx + 1} of 7 ({Math.round(((currentStepIdx + 1) / 7) * 100)}%)
            </span>
          </div>

          {/* Stepper Dots & Line */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isFuture = idx > currentStepIdx;

              return (
                <div
                  key={step.status}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-blue-50 border-[#123B63] ring-2 ring-[#123B63]/30 shadow-sm'
                      : isPast
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5 ${
                      isCurrent
                        ? 'bg-[#123B63] text-white animate-bounce'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-xs font-bold truncate">{step.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Action Bar for Worker */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
            <div>
              <div className="text-xs font-bold text-[#123B63]">Current Milestone:</div>
              <div className="text-sm font-extrabold text-slate-900">
                {STEPS[currentStepIdx]?.title} — {STEPS[currentStepIdx]?.desc}
              </div>
            </div>

            {/* Contextual Worker Action Buttons */}
            <div className="flex items-center gap-2">
              {activeApp.status === 'employer_accepted' && (
                <button
                  onClick={() => updateApplicationStatus(activeApp.id, 'work_started')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow min-h-[44px]"
                >
                  I Have Arrived & Started Work 🔨
                </button>
              )}

              {activeApp.status === 'work_started' && (
                <button
                  onClick={() => updateApplicationStatus(activeApp.id, 'work_completed')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow min-h-[44px]"
                >
                  Mark Work Completed 🏁
                </button>
              )}

              {activeApp.status === 'work_completed' && (
                <button
                  onClick={() => updateApplicationStatus(activeApp.id, 'payment_confirmed')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow min-h-[44px]"
                >
                  Confirm Payment Received (₹{activeApp.wage}) 💰
                </button>
              )}

              {activeApp.status === 'payment_confirmed' && !activeApp.ratingByWorker && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow min-h-[44px]"
                >
                  Rate Employer ⭐
                </button>
              )}

              {activeApp.ratingByWorker && (
                <div className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>You rated this employer {activeApp.ratingByWorker.rating}/5 stars</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline audit trail */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Activity History & Verification Log
            </h4>
            <div className="space-y-2 border-l-2 border-slate-200 pl-4 py-1">
              {activeApp.timeline.map((entry, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#123B63] ring-4 ring-white" />
                  <div className="text-xs font-semibold text-slate-800">{entry.label}</div>
                  <div className="text-[11px] text-slate-400">{entry.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rate Employer Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#123B63]">Rate Employer: {activeApp.employerName}</h3>
            <p className="text-xs text-slate-500">
              Your transparent rating helps other workers know how respectfully and promptly this employer pays.
            </p>

            <div className="flex justify-center gap-2 py-2">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Feedback
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#123B63]"
                placeholder="Paid on time, treated respectfully, safe work site..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rateApplication(activeApp.id, 'worker', ratingStars, ratingComment);
                  setShowRatingModal(false);
                }}
                className="px-5 py-2 bg-[#123B63] text-white rounded-xl text-xs font-bold shadow"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
