import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Application } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, UserX, Clock, ThumbsDown, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ReplacementWorkerModal } from './ReplacementWorkerModal';

interface ReportProblemModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

const PROBLEM_REASONS = [
  { id: 'no_show', label: 'Worker Did Not Arrive (No Show)', icon: UserX },
  { id: 'late', label: 'Extremely Late Arrival', icon: Clock },
  { id: 'poor_quality', label: 'Work Quality or Safety Issues', icon: ThumbsDown },
  { id: 'incomplete', label: 'Left Site Without Completing Work', icon: AlertTriangle },
  { id: 'disagreement', label: 'Wage / Task Disagreement on Site', icon: AlertTriangle },
  { id: 'safety', label: 'Safety or Behavior Concern', icon: ShieldAlert },
];

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  const { fileComplaint } = useAppStore();

  const [selectedReason, setSelectedReason] = useState(PROBLEM_REASONS[0].label);
  const [notes, setNotes] = useState('');
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [complaintFiled, setComplaintFiled] = useState(false);

  if (!application) return null;

  const handleFileOnlyComplaint = () => {
    fileComplaint({
      filedBy: 'employer',
      filerId: application.employerId,
      filerName: application.employerName,
      againstId: application.workerId,
      againstName: application.workerName,
      againstType: 'worker',
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      reason: selectedReason,
      details: notes || 'Employer reported problem on site.',
    });
    setComplaintFiled(true);
    setTimeout(() => {
      setComplaintFiled(false);
      onClose();
    }, 2000);
  };

  return (
    <>
      <Dialog open={isOpen && !showReplacementModal} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white text-slate-900 border border-slate-200">
          <div className="bg-amber-600 p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Service Recovery & Assistance
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              Report a Problem on Site
            </DialogTitle>
            <DialogDescription className="text-xs text-amber-100 mt-0.5">
              Work Bridge ensures reliable delivery. You can file a dispute or immediately summon a qualified replacement worker.
            </DialogDescription>
          </div>

          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
            {complaintFiled ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Complaint Logged into Safety Queue</h4>
                <p className="text-slate-500">
                  Platform resolution officers will investigate and mediate promptly.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    What is the issue with worker {application.workerName}?
                  </label>
                  <div className="space-y-1.5">
                    {PROBLEM_REASONS.map((reason) => {
                      const Icon = reason.icon;
                      const isSelected = selectedReason === reason.label;
                      return (
                        <button
                          key={reason.id}
                          type="button"
                          onClick={() => setSelectedReason(reason.label)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors min-h-[44px] ${
                            isSelected
                              ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-700' : 'text-slate-400'}`} />
                          <span>{reason.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Describe what happened (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Provide context so our mediation team can assist..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Service Recovery Highlight Card */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>⚡ Emergency Replacement Engine</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Don't let your project stall. Our real-time replacement engine matches verified available workers nearby with identical skills and wage expectations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowReplacementModal(true)}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <span>REQUEST ANOTHER WORKER NOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={onClose}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileOnlyComplaint}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                  >
                    Log Complaint Only
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Replacement Worker Modal */}
      <ReplacementWorkerModal
        application={application}
        reason={selectedReason}
        notes={notes}
        isOpen={showReplacementModal}
        onClose={() => {
          setShowReplacementModal(false);
          onClose();
        }}
      />
    </>
  );
};
