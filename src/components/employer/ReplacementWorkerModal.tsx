import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Application, Worker } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { calculateJobMatch } from '@/lib/matchEngine';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { TrustExplainerModal, BadgeType } from '@/components/trust/TrustExplainerModal';
import { Check, UserCheck, AlertTriangle, ArrowRight, Sparkles, MapPin, IndianRupee } from 'lucide-react';

interface ReplacementWorkerModalProps {
  application: Application | null;
  reason: string;
  notes: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReplacementWorkerModal: React.FC<ReplacementWorkerModalProps> = ({
  application,
  reason,
  notes,
  isOpen,
  onClose,
}) => {
  const { workers, jobs, reportProblemAndRequestReplacement } = useAppStore();
  const [selectedReplacementId, setSelectedReplacementId] = useState<string | null>(null);
  const [explainerType, setExplainerType] = useState<BadgeType | null>(null);
  const [explainerWorker, setExplainerWorker] = useState<Worker | null>(null);
  const [dispatched, setDispatched] = useState(false);

  if (!application) return null;

  const job = jobs.find((j) => j.id === application.jobId);

  // Replacement search engine:
  // Find other available workers who have the matching skill and are not the previous worker
  const candidates = workers.filter((w) => {
    if (w.id === application.workerId) return false;
    const reqSkill = application.workerSkill.split(' ')[0].toLowerCase();
    const hasSkill = w.skills.some((s) => s.toLowerCase().includes(reqSkill)) ||
      w.primarySkill.toLowerCase().includes(reqSkill);
    return hasSkill && w.availableNow;
  });

  const rankedCandidates = candidates.map((w) => ({
    worker: w,
    match: job ? calculateJobMatch(w, job) : { totalMatch: 90, reasons: [] },
  })).sort((a, b) => b.match.totalMatch - a.match.totalMatch);

  const handleConfirmReplacement = () => {
    if (!selectedReplacementId) {
      alert('Please select a replacement candidate');
      return;
    }

    reportProblemAndRequestReplacement(
      application.id,
      reason,
      notes,
      selectedReplacementId
    );

    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      onClose();
    }, 2000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white text-slate-900 border border-slate-200">
          <div className="bg-[#123B63] p-5 text-white">
            <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
              <span>SERVICE RECOVERY ENGINE</span>
              <span className="font-bold text-emerald-300">✓ {rankedCandidates.length} Candidates Available</span>
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              Instant Replacement Worker Match
            </DialogTitle>
            <DialogDescription className="text-xs text-blue-100 mt-0.5">
              Replacing {application.workerName} for "{application.jobTitle}". Transparent profiles ranked strictly by skill match, distance, and wage.
            </DialogDescription>
          </div>

          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {dispatched ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Replacement Worker Dispatched!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Previous worker assignment has been safely cancelled. Your chosen replacement worker is now confirmed and notified to report immediately.
                </p>
              </div>
            ) : rankedCandidates.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-semibold text-slate-700">No other workers available for this trade nearby right now.</p>
                <p>You can adjust wage or wait for nearby workers to become available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Select A Replacement Candidate:
                </div>

                <div className="space-y-2.5">
                  {rankedCandidates.map(({ worker, match }) => {
                    const isSelected = selectedReplacementId === worker.id;

                    return (
                      <div
                        key={worker.id}
                        onClick={() => setSelectedReplacementId(worker.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-[#123B63] ring-2 ring-[#123B63] shadow-md'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{worker.name}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-700" />
                                <span>{match.totalMatch}% Match</span>
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span className="font-medium text-slate-700">{worker.primarySkill}</span>
                              <span>•</span>
                              <span>{worker.experienceLevel}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">{worker.distanceKm} km away</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-extrabold text-[#123B63] block">
                              ₹{worker.expectedDailyWage}/day
                            </span>
                            <span className="text-[10px] text-emerald-600 font-medium">Ready now</span>
                          </div>
                        </div>

                        {/* Badges strip */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          <TrustBadge
                            type="identity"
                            size="sm"
                            workerTrust={worker.trustProfile}
                            onOpenExplainer={(t) => {
                              setExplainerWorker(worker);
                              setExplainerType(t);
                            }}
                          />
                          <TrustBadge
                            type="skill"
                            size="sm"
                            workerTrust={worker.trustProfile}
                            onOpenExplainer={(t) => {
                              setExplainerWorker(worker);
                              setExplainerType(t);
                            }}
                          />
                          <TrustBadge
                            type="rating"
                            size="sm"
                            workerTrust={worker.trustProfile}
                            onOpenExplainer={(t) => {
                              setExplainerWorker(worker);
                              setExplainerType(t);
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {!dispatched && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 min-h-[44px]"
              >
                Cancel
              </button>

              <button
                disabled={!selectedReplacementId || rankedCandidates.length === 0}
                onClick={handleConfirmReplacement}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow transition-colors flex items-center gap-1.5 min-h-[44px]"
              >
                <span>Confirm & Dispatch Replacement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Trust modal */}
      <TrustExplainerModal
        isOpen={explainerType !== null}
        onClose={() => setExplainerType(null)}
        badgeType={explainerType}
        workerTrust={explainerWorker?.trustProfile}
        workerName={explainerWorker?.name}
      />
    </>
  );
};
