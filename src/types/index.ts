export type LanguageCode =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
}

export type UserRole = 'worker' | 'employer' | 'admin';

export type AccountStatus = 'active' | 'under_review' | 'temporarily_restricted' | 'suspended';

export type IdentityStatus = 'verified' | 'not_verified' | 'pending' | 'under_review' | 'needs_more_evidence' | 'rejected';
export type SkillTrustStatus =
  | 'self_declared'
  | 'evidence_added'
  | 'assessment_completed'
  | 'skill_verified'
  | 'needs_more_evidence'
  | 'under_review';

export interface WorkerTrustProfile {
  identityStatus: IdentityStatus;
  identityDocType?: string;
  identityDocMasked?: string;
  identityVerifiedDate?: string;
  identityEvidence?: string;
  skillStatus: SkillTrustStatus;
  certificateName?: string;
  certificateIssuer?: string;
  skillEvidenceNotes?: string;
  assessmentResult?: string;
  workHistory: {
    completedJobs: number;
    platformMonths: number;
    repeatHireRate: number; // percentage
  };
  feedback: {
    rating: number; // 1-5
    totalReviews: number;
    tags: string[]; // e.g. "Punctual", "Skilled", "Polite", "Hardworking"
  };
  complaints: {
    unresolvedCount: number;
    resolvedCount: number;
  };
}

export interface EmployerTrustProfile {
  identityStatus: IdentityStatus;
  businessName?: string;
  completedJobs: number;
  workerRating: number;
  promptPaymentRate: number; // e.g. 100%
  disputeCount: number;
  identityEvidence?: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  state: string;
  district: string;
  locality: string;
  skills: string[];
  primarySkill: string;
  experienceLevel: string; // e.g. "Learned through practical experience", "3-5 yrs"
  experienceYearsNum?: number;
  expectedDailyWage: number;
  trustProfile: WorkerTrustProfile;
  accountStatus?: AccountStatus;
  accountStatusReason?: string;
  accountStatusUpdatedAt?: string;
  bio?: string;
  availableNow: boolean;
  distanceKm?: number;
  registeredDate?: string;
}

export interface Employer {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  businessName?: string;
  state: string;
  district: string;
  locality: string;
  trustProfile: EmployerTrustProfile;
  accountStatus?: AccountStatus;
  accountStatusReason?: string;
  accountStatusUpdatedAt?: string;
  registeredDate?: string;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerPhone: string;
  title: string;
  skillNeeded: string;
  workersNeeded: number;
  workersAssigned: number;
  wage: number;
  wageType: 'Daily' | 'Hourly' | 'Fixed';
  duration: string;
  startDate: string;
  state: string;
  district: string;
  locality: string;
  distanceKm: number;
  description: string;
  perks: string[];
  status: 'open' | 'in_progress' | 'completed' | 'paused' | 'cancelled' | 'under_review';
  reviewNotes?: string;
  flags?: string[];
  urgent?: boolean;
  createdAt: string;
}

export type ApplicationStatus =
  | 'request_sent'
  | 'employer_viewed'
  | 'employer_accepted'
  | 'work_started'
  | 'work_completed'
  | 'payment_confirmed'
  | 'rated'
  | 'rejected'
  | 'cancelled';

export interface MatchBreakdown {
  skillMatch: number; // max 40
  distanceMatch: number; // max 25
  wageMatch: number; // max 15
  availabilityMatch: number; // max 10
  durationMatch: number; // max 10
  totalMatch: number; // 0-100%
  reasons: string[];
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerSkill: string;
  workerExperience: string;
  workerWage: number;
  jobTitle: string;
  employerId: string;
  employerName: string;
  employerPhone: string;
  employerLocation: string;
  wage: number;
  wageType: 'Daily' | 'Hourly' | 'Fixed';
  status: ApplicationStatus;
  matchBreakdown: MatchBreakdown;
  createdAt: string;
  timeline: {
    status: ApplicationStatus;
    label: string;
    timestamp: string;
  }[];
  problemReport?: {
    reason: string;
    details: string;
    createdAt: string;
    replacementRequested: boolean;
    replacementWorkerId?: string;
  };
  ratingByWorker?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  ratingByEmployer?: {
    rating: number;
    tags: string[];
    comment: string;
    createdAt: string;
  };
}

export type ComplaintCategory =
  | 'payment_not_received'
  | 'work_not_provided'
  | 'wrong_information'
  | 'misbehavior'
  | 'fake_job'
  | 'unsafe_situation'
  | 'other';

export type ComplaintStatus = 'open' | 'under_review' | 'waiting_for_info' | 'resolved' | 'rejected';

export interface ComplaintAuditItem {
  timestamp: string;
  actor: string;
  action: string;
  note: string;
}

export interface Complaint {
  id: string;
  filedBy: 'employer' | 'worker';
  filerId: string;
  filerName: string;
  againstId: string;
  againstName: string;
  againstType: 'worker' | 'employer';
  jobId: string;
  jobTitle: string;
  category?: ComplaintCategory;
  reason: string;
  details: string;
  evidence?: string;
  status: ComplaintStatus;
  resolutionNotes?: string;
  auditHistory?: ComplaintAuditItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReplacementRequest {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  previousWorkerId: string;
  previousWorkerName: string;
  skillNeeded?: string;
  locality?: string;
  wage?: number;
  duration?: string;
  replacementWorkerId?: string;
  replacementWorkerName?: string;
  reason: string;
  status: 'pending' | 'fulfilled' | 'cancelled' | 'no_match_yet';
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  details: string;
  category: 'trust' | 'job' | 'complaint' | 'system' | 'user' | 'verification';
}
