import React from 'react';
import { WorkerTrustProfile, EmployerTrustProfile } from '@/types';
import { ShieldCheck, ShieldAlert, Award, Briefcase, Star, HelpCircle } from 'lucide-react';
import { BadgeType } from './TrustExplainerModal';

interface TrustBadgeProps {
  type: BadgeType;
  workerTrust?: WorkerTrustProfile;
  employerTrust?: EmployerTrustProfile;
  onOpenExplainer?: (type: BadgeType) => void;
  size?: 'sm' | 'md';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  type,
  workerTrust,
  employerTrust,
  onOpenExplainer,
  size = 'md',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenExplainer) {
      onOpenExplainer(type);
    }
  };

  const isSmall = size === 'sm';
  const baseClasses = `inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer hover:shadow-sm active:scale-95 ${
    isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  }`;

  if (type === 'identity' && workerTrust) {
    if (workerTrust.identityStatus === 'verified') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`${baseClasses} bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100`}
          title="Click to view identity verification details"
        >
          <ShieldCheck className={isSmall ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          <span>Identity Verified</span>
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      );
    } else if (workerTrust.identityStatus === 'pending') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`${baseClasses} bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100`}
          title="Click to view identity status"
        >
          <ShieldAlert className={isSmall ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>Identity Pending</span>
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      );
    } else {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`${baseClasses} bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200`}
          title="Click to view identity status"
        >
          <ShieldAlert className={isSmall ? 'w-3 h-3 text-slate-500' : 'w-3.5 h-3.5 text-slate-500'} />
          <span>Identity Not Verified</span>
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      );
    }
  }

  if (type === 'skill' && workerTrust) {
    if (workerTrust.skillStatus === 'skill_verified') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`${baseClasses} bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100`}
          title="Click to view skill verification details"
        >
          <Award className={isSmall ? 'w-3 h-3 text-blue-700' : 'w-3.5 h-3.5 text-blue-700'} />
          <span>Skill Verified</span>
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      );
    } else if (workerTrust.skillStatus === 'evidence_added') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`${baseClasses} bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100`}
          title="Click to view skill evidence details"
        >
          <Award className={isSmall ? 'w-3 h-3 text-purple-700' : 'w-3.5 h-3.5 text-purple-700'} />
          <span>Evidence Added</span>
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      );
    } else if (workerTrust.skillStatus === 'under_review') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`${baseClasses} bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100`}
        >
          <Award className={isSmall ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>Skill Under Review</span>
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      );
    } else {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`${baseClasses} bg-sky-50 text-sky-900 border border-sky-300 hover:bg-sky-100`}
          title="Self-declared skill: Honored without mandatory certificates"
        >
          <Briefcase className={isSmall ? 'w-3 h-3 text-sky-700' : 'w-3.5 h-3.5 text-sky-700'} />
          <span>Self-Declared (Honored)</span>
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </button>
      );
    }
  }

  if (type === 'history' && workerTrust) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${baseClasses} bg-slate-50 text-slate-800 border border-slate-300 hover:bg-slate-100`}
        title="View platform work history"
      >
        <Briefcase className={isSmall ? 'w-3 h-3 text-slate-600' : 'w-3.5 h-3.5 text-slate-600'} />
        <span>{workerTrust.workHistory.completedJobs} Jobs Done</span>
        {workerTrust.workHistory.repeatHireRate > 0 && (
          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 rounded font-semibold">
            {workerTrust.workHistory.repeatHireRate}% Repeat
          </span>
        )}
      </button>
    );
  }

  if (type === 'rating' && workerTrust) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${baseClasses} bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100`}
        title="View ratings and reviews"
      >
        <Star className={isSmall ? 'w-3 h-3 text-amber-600 fill-amber-500' : 'w-3.5 h-3.5 text-amber-600 fill-amber-500'} />
        <span className="font-bold">{workerTrust.feedback.rating.toFixed(1)}</span>
        <span className="text-slate-500 text-[10px]">({workerTrust.feedback.totalReviews})</span>
      </button>
    );
  }

  if (type === 'complaints' && workerTrust) {
    const isClean = workerTrust.complaints.unresolvedCount === 0;
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${baseClasses} ${
          isClean
            ? 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100'
            : 'bg-red-50 text-red-800 border border-red-300 hover:bg-red-100'
        }`}
        title="View complaint record"
      >
        {isClean ? (
          <>
            <ShieldCheck className={isSmall ? 'w-3 h-3 text-teal-600' : 'w-3.5 h-3.5 text-teal-600'} />
            <span>0 Complaints</span>
          </>
        ) : (
          <>
            <ShieldAlert className={isSmall ? 'w-3 h-3 text-red-600' : 'w-3.5 h-3.5 text-red-600'} />
            <span>{workerTrust.complaints.unresolvedCount} Dispute</span>
          </>
        )}
      </button>
    );
  }

  if (type === 'employer_trust' && employerTrust) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${baseClasses} bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100`}
      >
        <ShieldCheck className={isSmall ? 'w-3 h-3 text-blue-700' : 'w-3.5 h-3.5 text-blue-700'} />
        <span>Verified Employer ({employerTrust.promptPaymentRate}% Prompt Pay)</span>
      </button>
    );
  }

  return null;
};
