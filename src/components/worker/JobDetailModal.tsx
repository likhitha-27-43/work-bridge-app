import React, { useState } from 'react';
import { Job, Worker, Employer, MatchBreakdown } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { TRANSLATIONS } from '@/lib/translations';
import { calculateJobMatch } from '@/lib/matchEngine';
import { VoiceService } from '@/lib/voiceService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TrustExplainerModal, BadgeType } from '@/components/trust/TrustExplainerModal';
import { MapPin, Calendar, Clock, Volume2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  worker: Worker;
  employer?: Employer;
  isOpen: boolean;
  onClose: () => void;
  onAppliedSuccessfully: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  worker,
  employer,
  isOpen,
  onClose,
  onAppliedSuccessfully,
}) => {
  const { language, applyForJob, applications } = useAppStore();
  const [confirming, setConfirming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [explainerType, setExplainerType] = useState<BadgeType | null>(null);

  if (!job) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const match: MatchBreakdown = calculateJobMatch(worker, job);
  const existingApp = applications.find(
    (a) => a.jobId === job.id && a.workerId === worker.id
  );

  const handleSpeak = () => {
    if (isSpeaking) {
      VoiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const speechText = `Job: ${job.title}. Location: ${job.locality}, ${job.district}. Daily wage: Rupees ${job.wage} ${job.wageType}. Duration: ${job.duration}. Employer: ${job.employerName}. Requirement: ${job.description}.`;
      VoiceService.speak(speechText, language);
      setTimeout(() => setIsSpeaking(false), 9000);
    }
  };

  const handleApply = () => {
    applyForJob(job.id, worker.id);
    setConfirming(false);
    onClose();
    onAppliedSuccessfully();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white text-slate-900 border border-slate-200">
          {/* Header */}
          <div className="bg-[#123B63] p-5 text-white">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-100 border border-blue-400/30">
                {job.skillNeeded}
              </span>
              {job.urgent && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse">
                  URGENT REQUIREMENT
                </span>
              )}
            </div>

            <DialogTitle className="text-lg sm:text-xl font-bold leading-snug text-white">
              {job.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-blue-200 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{job.locality}, {job.district} • {job.distanceKm.toFixed(1)} km away</span>
            </DialogDescription>
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Wage & Key Details Banner */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Offered Wage</div>
                <div className="text-lg font-extrabold text-[#123B63]">
                  ₹{job.wage}
                  <span className="text-xs font-normal text-slate-500">/{job.wageType}</span>
                </div>
              </div>
              <div className="border-x border-slate-200 px-1">
                <div className="text-[11px] text-slate-500 font-medium">Workers Needed</div>
                <div className="text-lg font-extrabold text-slate-800">
                  {job.workersNeeded}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Duration</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{job.duration}</div>
              </div>
            </div>

            {/* Voice Audio Readout Button */}
            <button
              onClick={handleSpeak}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all min-h-[44px] ${
                isSpeaking
                  ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                  : 'bg-blue-50 border-blue-200 text-[#123B63] hover:bg-blue-100'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#123B63]" />
              <span>{isSpeaking ? 'Speaking Job Details... (Tap to stop)' : t.listenDetails}</span>
            </button>

            {/* Deterministic Match Breakdown (Requirement 6 & 7) */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Match Breakdown for You
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-extrabold">
                  {match.totalMatch}% Match
                </span>
              </div>

              {/* Progress Bar Grid */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                <div className="bg-white p-1.5 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 block">Skill</span>
                  <span className="font-bold text-emerald-800">{match.skillMatch}/40</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 block">Dist</span>
                  <span className="font-bold text-emerald-800">{match.distanceMatch}/25</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 block">Wage</span>
                  <span className="font-bold text-emerald-800">{match.wageMatch}/15</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 block">Avail</span>
                  <span className="font-bold text-emerald-800">{match.availabilityMatch}/10</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 block">Dur</span>
                  <span className="font-bold text-emerald-800">{match.durationMatch}/10</span>
                </div>
              </div>

              {/* Reasons list */}
              <div className="space-y-1">
                {match.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Perks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Work Requirements
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {job.description}
              </p>

              {job.perks && job.perks.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    On-Site Perks & Facilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.perks.map((perk, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-medium"
                      >
                        ✓ {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Employer Trust Profile */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Posted By Employer</span>
                  <span className="text-xs font-bold text-slate-900">{job.employerName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExplainerType('employer_trust')}
                  className="px-2 py-1 bg-blue-100 text-blue-900 rounded-full text-[11px] font-semibold flex items-center gap-1 hover:bg-blue-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Verified Employer</span>
                </button>
              </div>

              {employer?.trustProfile && (
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Prompt Pay</span>
                    <span className="font-bold text-emerald-600">{employer.trustProfile.promptPaymentRate}%</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Jobs Done</span>
                    <span className="font-bold text-slate-800">{employer.trustProfile.completedJobs}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Worker Rating</span>
                    <span className="font-bold text-amber-600">⭐ {employer.trustProfile.workerRating.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer / Big CTA Button */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            {existingApp ? (
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-center text-xs font-semibold">
                ✓ You already applied for this work. Status: <strong className="uppercase">{existingApp.status.replace('_', ' ')}</strong>
              </div>
            ) : confirming ? (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-300 text-xs">
                  <strong>Confirm Work Request:</strong> You are requesting to work as {job.skillNeeded} for {job.employerName} at ₹{job.wage}/{job.wageType}. The employer will receive your verified profile immediately.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfirming(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow min-h-[44px]"
                  >
                    Confirm & Send Request
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="w-full py-3.5 px-6 bg-[#123B63] hover:bg-[#1E5A8A] text-white text-base font-extrabold rounded-2xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>{t.askForWork}</span>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Trust Explainer Modal */}
      <TrustExplainerModal
        isOpen={explainerType !== null}
        onClose={() => setExplainerType(null)}
        badgeType={explainerType}
        employerTrust={employer?.trustProfile}
        employerName={job.employerName}
      />
    </>
  );
};
