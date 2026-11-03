import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WorkerTrustProfile, EmployerTrustProfile } from '@/types';
import { ShieldCheck, ShieldAlert, Award, Briefcase, Star, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type BadgeType = 'identity' | 'skill' | 'history' | 'rating' | 'complaints' | 'employer_trust';

interface TrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeType: BadgeType | null;
  workerTrust?: WorkerTrustProfile;
  workerName?: string;
  employerTrust?: EmployerTrustProfile;
  employerName?: string;
}

export const TrustExplainerModal: React.FC<TrustModalProps> = ({
  isOpen,
  onClose,
  badgeType,
  workerTrust,
  workerName = 'Worker',
  employerTrust,
  employerName = 'Employer',
}) => {
  if (!badgeType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white text-slate-900 border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-full bg-blue-50 text-blue-800">
              <Info className="w-5 h-5" />
            </span>
            <DialogTitle className="text-xl text-[#123B63] font-bold">
              Transparent Trust System
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Work Bridge separates trust into independent, verified pillars. No hidden black-box algorithms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm text-slate-700">
          {/* Identity Explainer */}
          {badgeType === 'identity' && workerTrust && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-emerald-900">
                    {workerTrust.identityStatus === 'verified'
                      ? 'Identity Verified'
                      : workerTrust.identityStatus === 'pending'
                      ? 'Identity Review In Progress'
                      : 'Identity Not Verified'}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {workerTrust.identityStatus === 'verified'
                      ? `Government ID (${workerTrust.identityDocType || 'Govt Document'}) has been cross-checked by platform administrators.`
                      : 'Worker has not yet submitted a government identification document.'}
                  </p>
                </div>
              </div>

              {/* Crucial explicit platform notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                  ⚠️ Platform Notice: Identity verification confirms identity, does NOT prove skill. Skill is evaluated separately through work history and practical experience.
                </p>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Document Type</span>
                  <span className="font-medium text-slate-800">{workerTrust.identityDocType || 'Aadhaar / Voter ID'}</span>
                </div>
                {workerTrust.identityDocMasked && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Document Number</span>
                    <span className="font-medium font-mono text-slate-800">{workerTrust.identityDocMasked}</span>
                  </div>
                )}
                {workerTrust.identityVerifiedDate && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Verified On</span>
                    <span className="font-medium text-slate-800">{workerTrust.identityVerifiedDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skill Explainer */}
          {badgeType === 'skill' && workerTrust && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
                <Award className="w-6 h-6 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900">
                    {workerTrust.skillStatus === 'skill_verified'
                      ? 'Skill Verified (Certificate / Trade Assessment)'
                      : workerTrust.skillStatus === 'evidence_added'
                      ? 'Skill Evidence Added'
                      : workerTrust.skillStatus === 'under_review'
                      ? 'Skill Evidence Under Review'
                      : 'Self-Declared Skill (Honored)'}
                  </h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    {workerTrust.skillStatus === 'skill_verified'
                      ? `Certified by: ${workerTrust.certificateIssuer || 'Vocational Trade Board'}`
                      : 'Worker declared this trade and backs it with real on-site work and customer ratings.'}
                  </p>
                </div>
              </div>

              {/* Fundamental Work Bridge philosophy */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Certificates are NEVER mandatory on Work Bridge. Millions of India's finest master craftsmen, masons, and painters learned through hands-on practical experience. Practical work is fully respected and ranked fairly.
                </p>
              </div>

              {workerTrust.certificateName && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <span className="text-slate-500 block">Certificate on Record:</span>
                  <p className="font-semibold text-slate-800">{workerTrust.certificateName}</p>
                  <p className="text-slate-600">Issuer: {workerTrust.certificateIssuer}</p>
                </div>
              )}

              {workerTrust.skillEvidenceNotes && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 block mb-1">Practical Evidence Notes:</span>
                  <p className="text-slate-700 italic">"{workerTrust.skillEvidenceNotes}"</p>
                </div>
              )}
            </div>
          )}

          {/* Work History Explainer */}
          {badgeType === 'history' && workerTrust && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-start gap-3">
                <Briefcase className="w-6 h-6 text-indigo-700 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-900">Platform Work History</h4>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    Real, verified jobs successfully completed with end-to-end payment confirmation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-bold text-[#123B63]">{workerTrust.workHistory.completedJobs}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Completed Jobs</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-bold text-emerald-600">{workerTrust.workHistory.repeatHireRate}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Repeat Hire Rate</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-bold text-indigo-600">{workerTrust.workHistory.platformMonths}m</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Active Months</div>
                </div>
              </div>
            </div>
          )}

          {/* Rating & Feedback */}
          {badgeType === 'rating' && workerTrust && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <Star className="w-6 h-6 text-amber-600 fill-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900">
                    {workerTrust.feedback.rating.toFixed(1)} / 5.0 Star Rating
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Based on {workerTrust.feedback.totalReviews} verified employer reviews following completed work.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Top Employer Endorsements:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {workerTrust.feedback.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-medium border border-amber-200"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Complaints Explainer */}
          {badgeType === 'complaints' && workerTrust && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  workerTrust.complaints.unresolvedCount === 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {workerTrust.complaints.unresolvedCount === 0 ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                )}
                <div>
                  <h4
                    className={`font-semibold ${
                      workerTrust.complaints.unresolvedCount === 0
                        ? 'text-emerald-900'
                        : 'text-red-900'
                    }`}
                  >
                    {workerTrust.complaints.unresolvedCount === 0
                      ? 'Zero Unresolved Complaints'
                      : `${workerTrust.complaints.unresolvedCount} Open Complaint Under Investigation`}
                  </h4>
                  <p className="text-xs mt-0.5 text-slate-600">
                    {workerTrust.complaints.unresolvedCount === 0
                      ? 'This worker is in complete good standing with no safety or misconduct disputes.'
                      : 'A dispute has been logged and is under transparent community safety mediation.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Employer Trust Explainer */}
          {badgeType === 'employer_trust' && employerTrust && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-700 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900">Employer Trust Profile: {employerName}</h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Work Bridge holds employers to the same high standards of transparency as workers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-emerald-600">
                    {employerTrust.promptPaymentRate}%
                  </div>
                  <div className="text-slate-500">On-Time Payment Record</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-[#123B63]">
                    {employerTrust.completedJobs}
                  </div>
                  <div className="text-slate-500">Jobs Paid & Completed</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-amber-600">
                    ⭐ {employerTrust.workerRating.toFixed(1)} / 5.0
                  </div>
                  <div className="text-slate-500">Rating by Workers</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-indigo-600">
                    {employerTrust.disputeCount === 0 ? '0' : employerTrust.disputeCount}
                  </div>
                  <div className="text-slate-500">Disputes Reported</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#123B63] hover:bg-[#1E5A8A] text-white font-medium rounded-xl text-sm transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
