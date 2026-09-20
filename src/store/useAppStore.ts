import { create } from 'zustand';
import {
  LanguageCode,
  UserRole,
  Worker,
  Employer,
  Job,
  Application,
  Complaint,
  ReplacementRequest,
  AuditLogItem,
  ApplicationStatus,
} from '@/types';
import {
  SEED_WORKERS,
  SEED_EMPLOYERS,
  SEED_JOBS,
  SEED_APPLICATIONS,
  SEED_COMPLAINTS,
  SEED_REPLACEMENTS,
  SEED_AUDIT_LOGS,
} from '@/data/seedData';
import { calculateJobMatch } from '@/lib/matchEngine';

interface AppState {
  language: LanguageCode;
  role: UserRole;
  showSplash: boolean;
  showOnboarding: boolean;
  activeWorkerId: string;
  activeEmployerId: string;
  workers: Worker[];
  employers: Employer[];
  jobs: Job[];
  applications: Application[];
  complaints: Complaint[];
  replacements: ReplacementRequest[];
  auditLogs: AuditLogItem[];

  // Actions
  setLanguage: (lang: LanguageCode) => void;
  setRole: (role: UserRole) => void;
  dismissSplash: () => void;
  dismissOnboarding: () => void;
  reopenOnboarding: () => void;
  setActiveWorker: (id: string) => void;
  setActiveEmployer: (id: string) => void;

  // Workflows
  applyForJob: (jobId: string, customWorkerId?: string) => Application;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationStatus,
    extra?: { note?: string }
  ) => void;
  postNewJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'workersAssigned'>) => Job;
  updateJobStatus: (jobId: string, status: Job['status']) => void;
  registerWorker: (workerData: Partial<Worker>) => Worker;

  // Trust & Verification
  verifyWorkerIdentity: (workerId: string, docType: string, maskedNum: string) => void;
  verifyWorkerSkill: (workerId: string, certName: string, issuer: string) => void;

  // Complaints & Recovery
  reportProblemAndRequestReplacement: (
    applicationId: string,
    reason: string,
    notes: string,
    replacementWorkerId?: string
  ) => void;
  fileComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  resolveComplaint: (complaintId: string, status: Complaint['status'], notes: string) => void;

  // Ratings
  rateApplication: (
    applicationId: string,
    by: 'worker' | 'employer',
    rating: number,
    comment: string,
    tags?: string[]
  ) => void;

  // Reset / Demo
  resetToDemoData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: 'en',
  role: 'worker',
  showSplash: true, // Show splash screen initially for immersive startup experience
  showOnboarding: false,
  activeWorkerId: 'w-1',
  activeEmployerId: 'emp-1',
  workers: SEED_WORKERS,
  employers: SEED_EMPLOYERS,
  jobs: SEED_JOBS,
  applications: SEED_APPLICATIONS,
  complaints: SEED_COMPLAINTS,
  replacements: SEED_REPLACEMENTS,
  auditLogs: SEED_AUDIT_LOGS,

  setLanguage: (language) => set({ language }),
  setRole: (role) => set({ role }),
  dismissSplash: () => set({ showSplash: false, showOnboarding: true }),
  dismissOnboarding: () => set({ showOnboarding: false }),
  reopenOnboarding: () => set({ showOnboarding: true }),
  setActiveWorker: (id) => set({ activeWorkerId: id }),
  setActiveEmployer: (id) => set({ activeEmployerId: id }),

  applyForJob: (jobId, customWorkerId) => {
    const state = get();
    const workerId = customWorkerId || state.activeWorkerId;
    const worker = state.workers.find((w) => w.id === workerId) || state.workers[0];
    const job = state.jobs.find((j) => j.id === jobId);

    if (!job) throw new Error('Job not found');

    const match = calculateJobMatch(worker, job);
    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      workerId: worker.id,
      workerName: worker.name,
      workerSkill: worker.primarySkill,
      workerExperience: worker.experienceLevel,
      workerWage: worker.expectedDailyWage,
      jobTitle: job.title,
      employerId: job.employerId,
      employerName: job.employerName,
      employerPhone: job.employerPhone,
      employerLocation: `${job.locality}, ${job.district}`,
      wage: job.wage,
      wageType: job.wageType,
      status: 'request_sent',
      matchBreakdown: match,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'request_sent',
          label: `Work request sent by ${worker.name}`,
          timestamp: 'Just now',
        },
      ],
    };

    const newAudit: AuditLogItem = {
      id: `audit-${Date.now()}`,
      action: 'WORK_REQUEST_SUBMITTED',
      actor: worker.name,
      target: `Job: ${job.title}`,
      timestamp: new Date().toLocaleString(),
      details: `Matched with ${match.totalMatch}% score`,
      category: 'job',
    };

    set({
      applications: [newApp, ...state.applications],
      auditLogs: [newAudit, ...state.auditLogs],
    });

    return newApp;
  },

  updateApplicationStatus: (applicationId, status, extra) => {
    const state = get();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) return;

    let eventLabel = `Status changed to ${status}`;
    if (status === 'employer_viewed') eventLabel = 'Employer reviewed worker profile';
    if (status === 'employer_accepted') eventLabel = 'Employer accepted work request';
    if (status === 'work_started') eventLabel = 'Worker arrived on site & started';
    if (status === 'work_completed') eventLabel = 'Work marked completed';
    if (status === 'payment_confirmed') eventLabel = 'Payment confirmed received';

    const updatedTimeline = [
      ...app.timeline,
      {
        status,
        label: extra?.note || eventLabel,
        timestamp: 'Just now',
      },
    ];

    const updatedApps = state.applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            status,
            timeline: updatedTimeline,
          }
        : a
    );

    // If completed or accepted, update job workers count
    let updatedJobs = state.jobs;
    if (status === 'employer_accepted') {
      updatedJobs = state.jobs.map((j) =>
        j.id === app.jobId ? { ...j, workersAssigned: j.workersAssigned + 1 } : j
      );
    }

    set({
      applications: updatedApps,
      jobs: updatedJobs,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: `APP_STATUS_${status.toUpperCase()}`,
          actor: 'System / User Action',
          target: `Application #${applicationId}`,
          timestamp: new Date().toLocaleString(),
          details: eventLabel,
          category: 'job',
        },
        ...state.auditLogs,
      ],
    });
  },

  postNewJob: (jobData) => {
    const state = get();
    const employer = state.employers.find((e) => e.id === state.activeEmployerId) || state.employers[0];
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      employerId: employer.id,
      employerName: employer.businessName || employer.name,
      employerPhone: employer.phone,
      workersAssigned: 0,
      createdAt: new Date().toISOString(),
    };

    set({
      jobs: [newJob, ...state.jobs],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'JOB_POSTED',
          actor: employer.name,
          target: newJob.title,
          timestamp: new Date().toLocaleString(),
          details: `Needed ${newJob.workersNeeded} workers for ${newJob.skillNeeded}`,
          category: 'job',
        },
        ...state.auditLogs,
      ],
    });

    return newJob;
  },

  updateJobStatus: (jobId, status) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
    }));
  },

  registerWorker: (workerData) => {
    const state = get();
    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      name: workerData.name || 'New Worker',
      phone: workerData.phone || '+91 99999 00000',
      state: workerData.state || 'Telangana',
      district: workerData.district || 'Hyderabad',
      locality: workerData.locality || 'Kukatpally',
      skills: workerData.skills || ['Construction Helper (निर्माण सहायक)'],
      primarySkill: workerData.primarySkill || workerData.skills?.[0] || 'Construction Helper (निर्माण सहायक)',
      experienceLevel: workerData.experienceLevel || 'Learned through practical experience',
      expectedDailyWage: workerData.expectedDailyWage || 700,
      availableNow: true,
      distanceKm: 2.5,
      bio: workerData.bio || 'Hardworking local worker ready for daily engagements.',
      trustProfile: {
        identityStatus: 'pending',
        skillStatus: 'self_declared',
        workHistory: {
          completedJobs: 0,
          platformMonths: 1,
          repeatHireRate: 0,
        },
        feedback: {
          rating: 5.0,
          totalReviews: 0,
          tags: ['Newly Registered'],
        },
        complaints: {
          unresolvedCount: 0,
          resolvedCount: 0,
        },
      },
    };

    set({
      workers: [newWorker, ...state.workers],
      activeWorkerId: newWorker.id,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'WORKER_REGISTERED',
          actor: newWorker.name,
          target: `Worker ID: ${newWorker.id}`,
          timestamp: new Date().toLocaleString(),
          details: `Registered with ${newWorker.skills.length} skills. Identity pending review.`,
          category: 'trust',
        },
        ...state.auditLogs,
      ],
    });

    return newWorker;
  },

  verifyWorkerIdentity: (workerId, docType, maskedNum) => {
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === workerId
          ? {
              ...w,
              trustProfile: {
                ...w.trustProfile,
                identityStatus: 'verified',
                identityDocType: docType,
                identityDocMasked: maskedNum,
                identityVerifiedDate: new Date().toISOString().split('T')[0],
              },
            }
          : w
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'IDENTITY_VERIFIED',
          actor: 'Admin Portal',
          target: `Worker ${workerId}`,
          timestamp: new Date().toLocaleString(),
          details: `Verified ${docType} (${maskedNum}). Note: Confirms identity, not skill.`,
          category: 'trust',
        },
        ...state.auditLogs,
      ],
    }));
  },

  verifyWorkerSkill: (workerId, certName, issuer) => {
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === workerId
          ? {
              ...w,
              trustProfile: {
                ...w.trustProfile,
                skillStatus: 'skill_verified',
                certificateName: certName,
                certificateIssuer: issuer,
              },
            }
          : w
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'SKILL_VERIFIED',
          actor: 'Admin Reviewer',
          target: `Worker ${workerId}`,
          timestamp: new Date().toLocaleString(),
          details: `Trade assessment / certificate verified: ${certName}`,
          category: 'trust',
        },
        ...state.auditLogs,
      ],
    }));
  },

  reportProblemAndRequestReplacement: (applicationId, reason, notes, replacementWorkerId) => {
    const state = get();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) return;

    let repItem: ReplacementRequest | null = null;
    let replacementWorkerName = '';

    if (replacementWorkerId) {
      const repWorker = state.workers.find((w) => w.id === replacementWorkerId);
      replacementWorkerName = repWorker?.name || 'Replacement Worker';

      repItem = {
        id: `rep-${Date.now()}`,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        employerId: app.employerId,
        employerName: app.employerName,
        previousWorkerId: app.workerId,
        previousWorkerName: app.workerName,
        replacementWorkerId,
        replacementWorkerName,
        reason,
        status: 'fulfilled',
        createdAt: new Date().toISOString(),
      };
    }

    const updatedApps = state.applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            problemReport: {
              reason,
              details: notes,
              createdAt: new Date().toISOString(),
              replacementRequested: !!replacementWorkerId,
              replacementWorkerId,
            },
          }
        : a
    );

    // If replacement was selected, create an assigned application for replacement worker
    let newApplications = updatedApps;
    if (replacementWorkerId) {
      const repWorker = state.workers.find((w) => w.id === replacementWorkerId);
      const job = state.jobs.find((j) => j.id === app.jobId);
      if (repWorker && job) {
        const replacementApp: Application = {
          id: `app-rep-${Date.now()}`,
          jobId: job.id,
          workerId: repWorker.id,
          workerName: repWorker.name,
          workerSkill: repWorker.primarySkill,
          workerExperience: repWorker.experienceLevel,
          workerWage: repWorker.expectedDailyWage,
          jobTitle: `[Replacement] ${job.title}`,
          employerId: job.employerId,
          employerName: job.employerName,
          employerPhone: job.employerPhone,
          employerLocation: `${job.locality}, ${job.district}`,
          wage: job.wage,
          wageType: job.wageType,
          status: 'work_started',
          matchBreakdown: calculateJobMatch(repWorker, job),
          createdAt: new Date().toISOString(),
          timeline: [
            {
              status: 'request_sent',
              label: 'Emergency replacement dispatched',
              timestamp: 'Just now',
            },
            {
              status: 'employer_accepted',
              label: 'Auto-accepted by employer',
              timestamp: 'Just now',
            },
            {
              status: 'work_started',
              label: 'Replacement arrived on site',
              timestamp: 'Just now',
            },
          ],
        };
        newApplications = [replacementApp, ...updatedApps];
      }
    }

    set({
      applications: newApplications,
      replacements: repItem ? [repItem, ...state.replacements] : state.replacements,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: replacementWorkerId ? 'REPLACEMENT_DISPATCHED' : 'PROBLEM_REPORTED',
          actor: app.employerName,
          target: `Job: ${app.jobTitle}`,
          timestamp: new Date().toLocaleString(),
          details: `Reason: ${reason}. Replacement: ${replacementWorkerName || 'None'}`,
          category: 'job',
        },
        ...state.auditLogs,
      ],
    });
  },

  fileComplaint: (complaintData) => {
    const state = get();
    const newComplaint: Complaint = {
      ...complaintData,
      id: `comp-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({
      complaints: [newComplaint, ...state.complaints],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'COMPLAINT_FILED',
          actor: complaintData.filerName,
          target: `Against: ${complaintData.againstName}`,
          timestamp: new Date().toLocaleString(),
          details: complaintData.reason,
          category: 'complaint',
        },
        ...state.auditLogs,
      ],
    });
  },

  resolveComplaint: (complaintId, status, notes) => {
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status,
              resolutionNotes: notes,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: `COMPLAINT_${status.toUpperCase()}`,
          actor: 'Safety Team / Admin',
          target: `Complaint #${complaintId}`,
          timestamp: new Date().toLocaleString(),
          details: notes,
          category: 'complaint',
        },
        ...state.auditLogs,
      ],
    }));
  },

  rateApplication: (applicationId, by, rating, comment, tags = []) => {
    const state = get();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) return;

    const updatedApps = state.applications.map((a) => {
      if (a.id !== applicationId) return a;
      if (by === 'worker') {
        return {
          ...a,
          ratingByWorker: { rating, comment, createdAt: new Date().toISOString() },
        };
      } else {
        return {
          ...a,
          status: 'rated' as ApplicationStatus,
          ratingByEmployer: { rating, tags, comment, createdAt: new Date().toISOString() },
        };
      }
    });

    set({
      applications: updatedApps,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'FEEDBACK_SUBMITTED',
          actor: by === 'worker' ? app.workerName : app.employerName,
          target: `Application #${applicationId}`,
          timestamp: new Date().toLocaleString(),
          details: `Rated ${rating}/5 stars: "${comment}"`,
          category: 'trust',
        },
        ...state.auditLogs,
      ],
    });
  },

  resetToDemoData: () => {
    set({
      workers: SEED_WORKERS,
      employers: SEED_EMPLOYERS,
      jobs: SEED_JOBS,
      applications: SEED_APPLICATIONS,
      complaints: SEED_COMPLAINTS,
      replacements: SEED_REPLACEMENTS,
      auditLogs: SEED_AUDIT_LOGS,
    });
  },
}));
