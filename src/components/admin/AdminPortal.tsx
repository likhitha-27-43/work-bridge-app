import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Worker, Employer, Job, Application, Complaint, ReplacementRequest, AuditLogItem } from '@/types';
import {
  LayoutDashboard,
  ShieldCheck,
  Award,
  Users,
  Briefcase,
  FileSpreadsheet,
  AlertOctagon,
  BarChart3,
  FileText,
  Clock,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Phone,
  Building,
  UserCheck,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    workers,
    employers,
    jobs,
    applications,
    complaints,
    replacements,
    auditLogs,
    verifyWorkerIdentity,
    verifyWorkerSkill,
    resolveComplaint,
    updateJobStatus,
  } = useAppStore();

  // Navigation State
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [activeSubNav, setActiveSubNav] = useState<string>('overview');

  // Time Range Filter
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');

  // Verification Search & Filter
  const [idSearch, setIdSearch] = useState('');
  const [idStatusFilter, setIdStatusFilter] = useState('all');
  const [skillSearch, setSkillSearch] = useState('');
  const [skillStatusFilter, setSkillStatusFilter] = useState('all');

  // User Management
  const [userTab, setUserTab] = useState<'workers' | 'employers'>('workers');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Job Filters
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobSkillFilter, setJobSkillFilter] = useState('all');

  // App Filter
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Trust & Safety
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('all');

  // Modals & Active Selections
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementRequest | null>(null);

  // Local interactive state extensions
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLogItem[]>(auditLogs);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const addAudit = (action: string, actor: string, target: string, details: string, category: 'trust' | 'job' | 'complaint' | 'system') => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      action,
      actor,
      target,
      timestamp: new Date().toLocaleString('en-IN'),
      details,
      category,
    };
    setLocalAuditLogs((prev) => [newLog, ...prev]);
  };

  // Top KPIs
  const totalWorkers = workers.length;
  const totalEmployers = employers.length;
  const activeJobs = jobs.filter((j) => j.status === 'open' || j.status === 'in_progress').length;
  const pendingApplications = applications.filter((a) => a.status === 'request_sent' || a.status === 'employer_viewed').length;
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const pendingVerifications = workers.filter((w) => w.trustProfile.identityStatus === 'pending' || w.trustProfile.skillStatus === 'under_review').length;
  const openComplaints = complaints.filter((c) => c.status === 'open' || c.status === 'under_review').length;
  const totalReplacements = replacements.filter((r) => r.status === 'pending').length;

  // Daily Counts
  const todayStats = {
    newWorkers: 4,
    newEmployers: 2,
    jobsPosted: 3,
    appsReceived: 12,
    jobsAccepted: 5,
    jobsStarted: 3,
    jobsCompleted: 4,
    complaintsReceived: 1,
    complaintsResolved: 2,
    pendingVerifications: pendingVerifications,
    replacementRequests: totalReplacements,
  };

  // Skill Demand vs Supply Data
  const skillSupplyDemand = [
    { skill: 'Mason', workers: 120, jobs: 85, apps: 160, completed: 78, status: 'Balanced' },
    { skill: 'Painter', workers: 64, jobs: 110, apps: 95, completed: 82, status: 'High Demand' },
    { skill: 'Electrician', workers: 72, jobs: 95, apps: 130, completed: 70, status: 'High Demand' },
    { skill: 'Plumber', workers: 88, jobs: 82, apps: 115, completed: 64, status: 'Balanced' },
    { skill: 'Carpenter', workers: 95, jobs: 52, apps: 72, completed: 45, status: 'More Available Workers' },
    { skill: 'Welder', workers: 40, jobs: 48, apps: 50, completed: 34, status: 'Balanced' },
    { skill: 'Helper', workers: 210, jobs: 135, apps: 280, completed: 112, status: 'More Available Workers' },
  ];

  // CSV Export Action
  const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let val = row[k] === null || row[k] === undefined ? '' : row[k];
              val = typeof val === 'object' ? JSON.stringify(val).replace(/"/g, '""') : String(val).replace(/"/g, '""');
              return `"${val}"`;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filename}.csv successfully`);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 font-sans">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#123B63] text-white px-5 py-3 rounded-lg shadow-xl border border-blue-400 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <aside className="w-64 bg-[#123B63] text-white flex flex-col shrink-0 border-r border-[#0E2A47]">
        <div className="p-4 border-b border-blue-800/60 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base tracking-wide flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-300" />
              Work Bridge
            </h2>
            <p className="text-xs text-blue-200">Admin Control Center</p>
          </div>
          <span className="bg-blue-700/70 text-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-500/30">
            SECURE
          </span>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto text-sm">
          {/* Dashboard */}
          <button
            onClick={() => { setActiveNav('dashboard'); setActiveSubNav('overview'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-left transition-colors ${
              activeNav === 'dashboard' ? 'bg-[#1E5A8A] text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          {/* Verification Header */}
          <div className="pt-2 pb-1 px-3 text-[11px] font-semibold tracking-wider text-blue-300 uppercase">
            Verification
          </div>
          <button
            onClick={() => { setActiveNav('verification'); setActiveSubNav('identity'); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'verification' && activeSubNav === 'identity'
                ? 'bg-[#1E5A8A] text-white shadow-sm'
                : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Identity Verification
            </span>
            <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {workers.filter((w) => w.trustProfile.identityStatus === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveNav('verification'); setActiveSubNav('skills'); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'verification' && activeSubNav === 'skills'
                ? 'bg-[#1E5A8A] text-white shadow-sm'
                : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-blue-300" />
              Skill Verification
            </span>
            <span className="bg-blue-600/40 text-blue-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {workers.filter((w) => w.trustProfile.skillStatus === 'under_review' || w.trustProfile.skillStatus === 'evidence_added').length}
            </span>
          </button>

          {/* Users Header */}
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold tracking-wider text-blue-300 uppercase">
            User Management
          </div>
          <button
            onClick={() => { setActiveNav('users'); setActiveSubNav('workers'); setUserTab('workers'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'users' && userTab === 'workers' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Workers ({totalWorkers})
          </button>
          <button
            onClick={() => { setActiveNav('users'); setActiveSubNav('employers'); setUserTab('employers'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'users' && userTab === 'employers' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <Building className="w-4 h-4" />
            Employers ({totalEmployers})
          </button>

          {/* Jobs & Applications */}
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold tracking-wider text-blue-300 uppercase">
            Operations
          </div>
          <button
            onClick={() => { setActiveNav('jobs'); setActiveSubNav('active'); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'jobs' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4" />
              Jobs Monitoring
            </span>
            <span className="bg-slate-700/60 text-slate-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {jobs.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveNav('applications'); setActiveSubNav('all'); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'applications' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4" />
              Applications
            </span>
            <span className="bg-slate-700/60 text-slate-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {applications.length}
            </span>
          </button>

          {/* Trust & Safety */}
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold tracking-wider text-blue-300 uppercase">
            Trust & Safety
          </div>
          <button
            onClick={() => { setActiveNav('trust_safety'); setActiveSubNav('complaints'); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'trust_safety' && activeSubNav === 'complaints' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              Complaints
            </span>
            <span className="bg-red-500/40 text-red-100 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {openComplaints}
            </span>
          </button>
          <button
            onClick={() => { setActiveNav('trust_safety'); setActiveSubNav('replacements'); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'trust_safety' && activeSubNav === 'replacements' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-amber-300" />
              Replacements
            </span>
            <span className="bg-amber-500/40 text-amber-100 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {totalReplacements}
            </span>
          </button>
          <button
            onClick={() => { setActiveNav('trust_safety'); setActiveSubNav('suspicious'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'trust_safety' && activeSubNav === 'suspicious' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Needs Review Signals
          </button>

          {/* Analytics & Reports */}
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold tracking-wider text-blue-300 uppercase">
            Intelligence
          </div>
          <button
            onClick={() => { setActiveNav('analytics'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'analytics' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics Center
          </button>
          <button
            onClick={() => { setActiveNav('reports'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'reports' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Reports & Export
          </button>
          <button
            onClick={() => { setActiveNav('audit'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-xs transition-colors ${
              activeNav === 'audit' ? 'bg-[#1E5A8A] text-white' : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Admin Activity Log
          </button>
        </nav>

        <div className="p-3 border-t border-blue-800/60 bg-[#0E2A47]/40 text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Platform Status: Operational</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#123B63] capitalize">
              {activeNav === 'dashboard' && 'Platform Overview & Daily Monitoring'}
              {activeNav === 'verification' && `Verification Center — ${activeSubNav === 'identity' ? 'Identity Queue' : 'Skill Assessment Queue'}`}
              {activeNav === 'users' && `User Management — ${userTab === 'workers' ? 'Workers Registry' : 'Employers Registry'}`}
              {activeNav === 'jobs' && 'Jobs Monitoring & Supervision'}
              {activeNav === 'applications' && 'Job Applications Monitoring'}
              {activeNav === 'trust_safety' && 'Trust, Safety & Resolution Center'}
              {activeNav === 'analytics' && 'Operational Analytics & Demand/Supply Intelligence'}
              {activeNav === 'reports' && 'Exportable Platform Reports'}
              {activeNav === 'audit' && 'Immutable Administrator Activity Log'}
            </h1>
            <p className="text-xs text-slate-500">
              Work Bridge Civic Employment Administration • Real-time Data
            </p>
          </div>

          {/* Time Filter Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Timeframe:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {(['today', '7days', '30days', 'custom'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-[#123B63] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range === 'today' && 'Today'}
                  {range === '7days' && 'Last 7 Days'}
                  {range === '30days' && 'Last 30 Days'}
                  {range === 'custom' && 'Custom'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* SECTION 1: DASHBOARD OVERVIEW */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              {/* Top 8 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Workers', count: totalWorkers, icon: Users, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', nav: 'users', sub: 'workers' },
                  { label: 'Total Employers', count: totalEmployers, icon: Building, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', nav: 'users', sub: 'employers' },
                  { label: 'Active Jobs', count: activeJobs, icon: Briefcase, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', nav: 'jobs', sub: 'active' },
                  { label: 'Pending Applications', count: pendingApplications, icon: FileSpreadsheet, color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200', nav: 'applications', sub: 'all' },
                  { label: 'Completed Jobs', count: completedJobs, icon: CheckCircle2, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', nav: 'jobs', sub: 'completed' },
                  { label: 'Pending Verifications', count: pendingVerifications, icon: ShieldCheck, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', nav: 'verification', sub: 'identity' },
                  { label: 'Open Complaints', count: openComplaints, icon: AlertOctagon, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', nav: 'trust_safety', sub: 'complaints' },
                  { label: 'Replacement Requests', count: totalReplacements, icon: RefreshCw, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', nav: 'trust_safety', sub: 'replacements' },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setActiveNav(kpi.nav); setActiveSubNav(kpi.sub); }}
                      className={`text-left p-4 rounded-xl border ${kpi.border} ${kpi.bg} shadow-xs hover:shadow-md transition-all hover:scale-[1.01] flex items-center justify-between group`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                        <p className={`text-2xl font-bold ${kpi.color} mt-1`}>{kpi.count}</p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-slate-600">
                          View details <ChevronRight className="w-3 h-3" />
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-white/80 shadow-xs ${kpi.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Section 2: Daily Monitoring Board */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-[#123B63] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Today's Operational Pulse
                    </h3>
                    <p className="text-xs text-slate-500">Live platform throughput counters for today</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Streaming
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'New Workers Today', val: todayStats.newWorkers, color: 'text-blue-600' },
                    { label: 'New Employers Today', val: todayStats.newEmployers, color: 'text-indigo-600' },
                    { label: 'Jobs Posted Today', val: todayStats.jobsPosted, color: 'text-emerald-600' },
                    { label: 'Applications Received', val: todayStats.appsReceived, color: 'text-cyan-600' },
                    { label: 'Jobs Accepted Today', val: todayStats.jobsAccepted, color: 'text-teal-600' },
                    { label: 'Jobs Started Today', val: todayStats.jobsStarted, color: 'text-sky-600' },
                    { label: 'Jobs Completed Today', val: todayStats.jobsCompleted, color: 'text-emerald-700' },
                    { label: 'Complaints Received', val: todayStats.complaintsReceived, color: 'text-red-600' },
                    { label: 'Complaints Resolved', val: todayStats.complaintsResolved, color: 'text-emerald-600' },
                    { label: 'Pending Verifications', val: todayStats.pendingVerifications, color: 'text-amber-600' },
                    { label: 'Replacement Requests', val: todayStats.replacementRequests, color: 'text-purple-600' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                      <p className="text-[11px] text-slate-500 font-medium truncate">{item.label}</p>
                      <p className={`text-xl font-bold ${item.color} mt-1`}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 16: Platform Health & Work Impact Funnel */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-[#123B63] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Work Bridge Health — Work Lifecycle Conversion Funnel
                  </h3>
                  <p className="text-xs text-slate-500">Measuring true economic impact: from registration to completed paid work</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                  {[
                    { stage: 'Workers Registered', count: '1,420', pct: '100%', bg: 'bg-slate-100', border: 'border-slate-300' },
                    { stage: 'Requested Work', count: '980', pct: '69.0%', bg: 'bg-blue-50', border: 'border-blue-200' },
                    { stage: 'Applications Sent', count: '740', pct: '52.1%', bg: 'bg-cyan-50', border: 'border-cyan-200' },
                    { stage: 'Accepted by Employer', count: '460', pct: '32.4%', bg: 'bg-indigo-50', border: 'border-indigo-200' },
                    { stage: 'Work Started', count: '410', pct: '28.8%', bg: 'bg-teal-50', border: 'border-teal-200' },
                    { stage: 'Work Completed', count: '365', pct: '25.7%', bg: 'bg-emerald-50', border: 'border-emerald-300' },
                    { stage: 'Feedback Received', count: '320', pct: '22.5%', bg: 'bg-emerald-100', border: 'border-emerald-400' },
                  ].map((step, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${step.border} ${step.bg} flex flex-col justify-between`}>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{step.stage}</span>
                      <p className="text-lg font-bold text-slate-800 my-1">{step.count}</p>
                      <span className="text-[11px] font-semibold text-slate-600 bg-white/70 py-0.5 rounded border border-slate-200">
                        {step.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Activity Timeline */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#123B63] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Real-time Platform Activity Timeline
                  </h3>
                  <button
                    onClick={() => setActiveNav('audit')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    View Complete Audit Log →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {localAuditLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <span className="p-1.5 rounded-md bg-slate-100 text-[#123B63] mt-0.5 font-bold text-[10px]">
                          {log.category.toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{log.action}</p>
                          <p className="text-slate-500">{log.details}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Target: {log.target} • Actor: {log.actor}</p>
                        </div>
                      </div>
                      <span className="text-slate-400 whitespace-nowrap text-[11px]">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3 & 4: IDENTITY VERIFICATION */}
          {activeNav === 'verification' && activeSubNav === 'identity' && (
            <div className="space-y-5">
              {/* Trust Policy Rule Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-900 text-xs flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Fundamental Trust Rule: Identity ≠ Skill</h4>
                  <p className="mt-1 leading-relaxed">
                    Identity verification confirms only the legal existence and identity of the individual or enterprise (Aadhaar / Voter ID). 
                    It does <strong>NOT</strong> grant skill certification. Workers are never required to hold academic degrees or certificates to be employed.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search candidate or employer by name/phone..."
                      value={idSearch}
                      onChange={(e) => setIdSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={idStatusFilter}
                    onChange={(e) => setIdStatusFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700"
                  >
                    <option value="all">All Verification Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Showing {workers.length} registered candidate records
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">User / Role</th>
                      <th className="py-3 px-4 font-semibold">Location</th>
                      <th className="py-3 px-4 font-semibold">Document Evidence</th>
                      <th className="py-3 px-4 font-semibold">Identity Status</th>
                      <th className="py-3 px-4 font-semibold">Submission Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workers
                      .filter((w) => {
                        const matchName = w.name.toLowerCase().includes(idSearch.toLowerCase()) || w.phone.includes(idSearch);
                        const matchStatus = idStatusFilter === 'all' ? true : w.trustProfile.identityStatus === idStatusFilter;
                        return matchName && matchStatus;
                      })
                      .map((worker) => (
                        <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{worker.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{worker.phone} • Worker</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800">{worker.locality}</div>
                            <div className="text-[11px] text-slate-400">{worker.district}, {worker.state}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {worker.trustProfile.identityDocType || 'Govt ID'}: {worker.trustProfile.identityDocMasked || 'XXXX-XXXX-4920'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {worker.trustProfile.identityStatus === 'verified' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                              </span>
                            )}
                            {worker.trustProfile.identityStatus === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Pending Review
                              </span>
                            )}
                            {worker.trustProfile.identityStatus === 'not_verified' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                                <HelpCircle className="w-3 h-3 text-slate-500" /> Unverified
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {worker.trustProfile.identityVerifiedDate || 'Recent'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            {worker.trustProfile.identityStatus !== 'verified' ? (
                              <>
                                <button
                                  onClick={() => {
                                    verifyWorkerIdentity(worker.id, 'Aadhaar Card', 'XXXX-XXXX-8921');
                                    addAudit('IDENTITY_VERIFIED', 'Admin / Safety Officer', worker.name, `Verified identity for ${worker.name}`, 'trust');
                                    showNotification(`Identity verified for ${worker.name}`);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium shadow-xs"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => {
                                    addAudit('EVIDENCE_REQUESTED', 'Admin / Safety Officer', worker.name, `Requested additional identity document from ${worker.name}`, 'trust');
                                    showNotification(`Requested additional evidence from ${worker.name}`);
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                                >
                                  Request Info
                                </button>
                              </>
                            ) : (
                              <span className="text-emerald-700 font-medium text-[11px]">Approved</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 5: SKILL VERIFICATION */}
          {activeNav === 'verification' && activeSubNav === 'skills' && (
            <div className="space-y-5">
              {/* Trust Policy Rule Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-[#123B63] text-xs flex items-start gap-3">
                <Award className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#123B63]">Skill Trust Rule: Practical Experience & Peer Ratings</h4>
                  <p className="mt-1 leading-relaxed text-slate-600">
                    Certificates are <strong>strictly optional</strong>. Workers demonstrate genuine vocational mastery through years of hands-on experience, completed platform jobs, peer ratings, and photographic evidence of physical work.
                  </p>
                </div>
              </div>

              {/* Worker Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <div key={worker.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{worker.name}</h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] rounded font-semibold">
                            Primary: {worker.primarySkill}
                          </span>
                        </div>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                          ₹{worker.expectedDailyWage}/day
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Experience:</span>
                          <span className="font-medium text-slate-800">{worker.experienceLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Completed Jobs:</span>
                          <span className="font-medium text-slate-800">{worker.trustProfile.workHistory.completedJobs} jobs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Employer Rating:</span>
                          <span className="font-semibold text-emerald-700">★ {worker.trustProfile.feedback.rating} / 5 ({worker.trustProfile.feedback.totalReviews} reviews)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Certification:</span>
                          <span className="italic text-slate-500">
                            {worker.trustProfile.certificateName ? worker.trustProfile.certificateName : 'None (Optional)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <span className="text-slate-400">Skill Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            worker.trustProfile.skillStatus === 'skill_verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {worker.trustProfile.skillStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          verifyWorkerSkill(worker.id, worker.trustProfile.certificateName || 'Platform Verified Work Experience', 'Work Bridge Board');
                          addAudit('SKILL_VERIFIED', 'Admin / Skill Assessor', worker.name, `Verified skill expertise based on ${worker.experienceLevel} and feedback`, 'trust');
                          showNotification(`Skill verified for ${worker.name}`);
                        }}
                        className="flex-1 py-1.5 bg-[#123B63] hover:bg-blue-900 text-white rounded text-xs font-medium text-center transition-colors"
                      >
                        Verify Skill
                      </button>
                      <button
                        onClick={() => {
                          addAudit('MORE_SKILL_EVIDENCE_REQUESTED', 'Admin', worker.name, 'Requested additional photo/work history evidence', 'trust');
                          showNotification(`Requested additional skill evidence from ${worker.name}`);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                      >
                        Request Evidence
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: USER MONITORING (WORKERS & EMPLOYERS) */}
          {activeNav === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setUserTab('workers')}
                  className={`pb-2 px-3 text-sm font-semibold transition-colors border-b-2 ${
                    userTab === 'workers' ? 'border-[#123B63] text-[#123B63]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Workers Registry ({workers.length})
                </button>
                <button
                  onClick={() => setUserTab('employers')}
                  className={`pb-2 px-3 text-sm font-semibold transition-colors border-b-2 ${
                    userTab === 'employers' ? 'border-[#123B63] text-[#123B63]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Employers Registry ({employers.length})
                </button>
              </div>

              {/* Workers View */}
              {userTab === 'workers' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-3 px-4 font-semibold">Worker Name</th>
                        <th className="py-3 px-4 font-semibold">Primary Skill</th>
                        <th className="py-3 px-4 font-semibold">Location</th>
                        <th className="py-3 px-4 font-semibold">Expected Wage</th>
                        <th className="py-3 px-4 font-semibold">Identity Status</th>
                        <th className="py-3 px-4 font-semibold">Skill Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Account Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workers.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-semibold text-slate-900">{w.name}</td>
                          <td className="py-3 px-4 text-blue-700 font-medium">{w.primarySkill}</td>
                          <td className="py-3 px-4 text-slate-600">{w.locality}, {w.district}</td>
                          <td className="py-3 px-4 text-slate-800 font-mono">₹{w.expectedDailyWage}/day</td>
                          <td className="py-3 px-4 capitalize">{w.trustProfile.identityStatus}</td>
                          <td className="py-3 px-4 capitalize">{w.trustProfile.skillStatus.replace('_', ' ')}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-semibold text-[11px] border border-emerald-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Employers View */}
              {userTab === 'employers' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-3 px-4 font-semibold">Employer Name / Business</th>
                        <th className="py-3 px-4 font-semibold">Phone</th>
                        <th className="py-3 px-4 font-semibold">Location</th>
                        <th className="py-3 px-4 font-semibold">Completed Hires</th>
                        <th className="py-3 px-4 font-semibold">Payment Promptness</th>
                        <th className="py-3 px-4 font-semibold text-right">Account Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employers.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-[11px] text-slate-500">{emp.businessName || 'Individual Employer'}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{emp.phone}</td>
                          <td className="py-3 px-4 text-slate-600">{emp.locality}, {emp.district}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{emp.trustProfile.completedJobs} hires</td>
                          <td className="py-3 px-4 text-emerald-700 font-medium">{emp.trustProfile.promptPaymentRate}% on-time</td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-semibold text-[11px] border border-emerald-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: JOB MONITORING */}
          {activeNav === 'jobs' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Job Title</th>
                      <th className="py-3 px-4 font-semibold">Employer</th>
                      <th className="py-3 px-4 font-semibold">Skill Needed</th>
                      <th className="py-3 px-4 font-semibold">Location</th>
                      <th className="py-3 px-4 font-semibold">Wage & Duration</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Supervisor Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-900">{job.title}</td>
                        <td className="py-3 px-4 text-slate-600">{job.employerName}</td>
                        <td className="py-3 px-4 text-blue-700 font-medium">{job.skillNeeded}</td>
                        <td className="py-3 px-4 text-slate-600">{job.locality}, {job.district}</td>
                        <td className="py-3 px-4 font-mono text-slate-800">₹{job.wage} / {job.duration}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            job.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'completed' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {job.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          {job.status !== 'paused' ? (
                            <button
                              onClick={() => {
                                updateJobStatus(job.id, 'paused');
                                addAudit('JOB_PAUSED', 'Admin', job.title, `Paused job ${job.title}`, 'job');
                                showNotification(`Paused job: ${job.title}`);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px]"
                            >
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateJobStatus(job.id, 'open');
                                addAudit('JOB_REOPENED', 'Admin', job.title, `Reopened job ${job.title}`, 'job');
                                showNotification(`Reopened job: ${job.title}`);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px]"
                            >
                              Reopen
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 8: APPLICATION MONITORING */}
          {activeNav === 'applications' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Candidate</th>
                      <th className="py-3 px-4 font-semibold">Target Job</th>
                      <th className="py-3 px-4 font-semibold">Skill</th>
                      <th className="py-3 px-4 font-semibold">Employer</th>
                      <th className="py-3 px-4 font-semibold">Application Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Lifecycle Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-900">{app.workerName}</td>
                        <td className="py-3 px-4 text-slate-800">{app.jobTitle}</td>
                        <td className="py-3 px-4 text-blue-700 font-medium">{app.workerSkill}</td>
                        <td className="py-3 px-4 text-slate-600">{app.employerName}</td>
                        <td className="py-3 px-4 text-slate-500">{app.createdAt}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {app.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 11 & ANALYTICS: DEMAND VS SUPPLY */}
          {activeNav === 'analytics' && (
            <div className="space-y-6">
              {/* Section 11: Demand vs Supply Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-base font-bold text-[#123B63] mb-1">Skill Demand & Supply Equilibrium</h3>
                <p className="text-xs text-slate-500 mb-4">Real-time vocational trade availability vs active postings across India</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-4 font-semibold">Trade / Skill</th>
                        <th className="py-2.5 px-4 font-semibold">Available Workers</th>
                        <th className="py-2.5 px-4 font-semibold">Active Jobs</th>
                        <th className="py-2.5 px-4 font-semibold">Applications</th>
                        <th className="py-2.5 px-4 font-semibold">Jobs Completed</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Equilibrium Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {skillSupplyDemand.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{row.skill}</td>
                          <td className="py-3 px-4 text-slate-700 font-mono">{row.workers}</td>
                          <td className="py-3 px-4 text-slate-700 font-mono">{row.jobs}</td>
                          <td className="py-3 px-4 text-slate-700 font-mono">{row.apps}</td>
                          <td className="py-3 px-4 text-slate-700 font-mono">{row.completed}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              row.status === 'High Demand' ? 'bg-amber-100 text-amber-800' :
                              row.status === 'Balanced' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 12: Location Analytics */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-base font-bold text-[#123B63] mb-1">Location Distribution (India Hierarchy)</h3>
                <p className="text-xs text-slate-500 mb-4">State → District → Locality density (Locality privacy preserved)</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { state: 'Karnataka', district: 'Bengaluru Urban', locality: 'Whitefield & Marathahalli', jobs: 64, workers: 92, topSkill: 'Electrician' },
                    { state: 'Telangana', district: 'Hyderabad', locality: 'Hitec City & Madhapur', jobs: 58, workers: 84, topSkill: 'Plumber' },
                    { state: 'Maharashtra', district: 'Pune', locality: 'Kothrud & Hinjewadi', jobs: 42, workers: 60, topSkill: 'Mason' },
                  ].map((loc, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {loc.locality}
                      </div>
                      <p className="text-slate-500">{loc.district}, {loc.state}</p>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-medium">
                        <span>Active Jobs: <strong className="text-slate-800">{loc.jobs}</strong></span>
                        <span>Workers: <strong className="text-slate-800">{loc.workers}</strong></span>
                      </div>
                      <p className="text-[11px] text-blue-700 font-semibold">Highest Demand: {loc.topSkill}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 13: TRUST & SAFETY CENTER */}
          {activeNav === 'trust_safety' && (
            <div className="space-y-6">
              {/* Complaints Queue */}
              {activeSubNav === 'complaints' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#123B63]">Trust & Safety Complaints Docket</h3>
                      <p className="text-xs text-slate-500">Every dispute is reviewed with mediation and audit accountability</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {complaints.map((c) => (
                      <div key={c.id} className="py-4 flex flex-col md:flex-row items-start justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{c.reason}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {c.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{c.details}</p>
                          <p className="text-[11px] text-slate-400">
                            Filed By: <strong>{c.filerName}</strong> against <strong>{c.againstName}</strong> • Job: {c.jobTitle}
                          </p>
                          {c.resolutionNotes && (
                            <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
                              Resolution: {c.resolutionNotes}
                            </p>
                          )}
                        </div>

                        {c.status !== 'resolved' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                resolveComplaint(c.id, 'resolved', 'Mediated by Safety Officer: Payment adjusted & case settled.');
                                addAudit('COMPLAINT_RESOLVED', 'Safety Officer', c.id, `Resolved dispute between ${c.filerName} and ${c.againstName}`, 'complaint');
                                showNotification(`Resolved Complaint #${c.id}`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-xs text-xs"
                            >
                              Resolve Dispute
                            </button>
                            <button
                              onClick={() => {
                                resolveComplaint(c.id, 'rejected', 'Dismissed after evidentiary review.');
                                addAudit('COMPLAINT_REJECTED', 'Safety Officer', c.id, 'Dismissed frivolous dispute', 'complaint');
                                showNotification(`Dismissed Complaint #${c.id}`);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replacements Queue */}
              {activeSubNav === 'replacements' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-[#123B63]">Service Recovery & Worker Replacement Queue</h3>
                  <p className="text-xs text-slate-500">When an assignment fails or is abandoned, immediate candidate dispatch is triggered</p>

                  <div className="space-y-3">
                    {replacements.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start justify-between gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{r.jobTitle}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {r.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">Previous Candidate: <strong>{r.previousWorkerName}</strong> • Reason: {r.reason}</p>
                          <p className="text-[11px] text-slate-500">Employer: {r.employerName}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              addAudit('REPLACEMENT_ASSIGNED', 'Dispatch Coordinator', r.jobTitle, 'Dispatched replacement candidate with matching skill and distance', 'trust');
                              showNotification(`Dispatched matching replacement worker for ${r.jobTitle}`);
                            }}
                            className="px-3 py-1.5 bg-[#123B63] hover:bg-blue-900 text-white rounded font-medium shadow-xs text-xs"
                          >
                            Dispatch Match
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Needs Review Area */}
              {activeSubNav === 'suspicious' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-xs text-orange-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>
                      <strong>Neutral Evaluation Rule:</strong> Flagged patterns indicate "Needs Review", not an automatic determination of fraud.
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { type: 'Duplicate Job Postings', entity: 'Metro Builders Corp', detail: '3 identical Mason postings within 10 minutes in same locality', action: 'Merge or Clarify' },
                      { type: 'Repeated Cancellation', entity: 'Vikram Singh (Contractor)', detail: 'Cancelled 2 accepted assignments within 24 hours', action: 'Contact Coordinator' },
                      { type: 'Wage Anomaly', entity: 'Painting Job #1042', detail: 'Offered wage ₹250/day is below local benchmark (₹700/day)', action: 'Flag for Wage Review' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{item.type} — <span className="font-normal text-slate-600">{item.entity}</span></p>
                          <p className="text-slate-500">{item.detail}</p>
                        </div>
                        <button
                          onClick={() => {
                            addAudit('REVIEW_FLAG_HANDLED', 'Admin', item.entity, `Handled review signal: ${item.type}`, 'system');
                            showNotification(`Reviewed and marked resolved: ${item.type}`);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                        >
                          Resolve Signal
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 17: IMMUTABLE AUDIT LOG */}
          {activeNav === 'audit' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-[#123B63]">Administrative Audit Trail</h3>
                  <p className="text-xs text-slate-500">Immutable ledger of all supervisor and safety officer actions</p>
                </div>
                <button
                  onClick={() => exportToCSV('audit_trail', localAuditLogs)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Audit CSV
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Timestamp</th>
                      <th className="py-3 px-4 font-semibold">Action Type</th>
                      <th className="py-3 px-4 font-semibold">Administrator</th>
                      <th className="py-3 px-4 font-semibold">Target Entity</th>
                      <th className="py-3 px-4 font-semibold">Details / Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono">{log.timestamp}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#123B63]">{log.action}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{log.actor}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{log.target}</td>
                        <td className="py-3 px-4 text-slate-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 18: REPORTS & EXPORTS */}
          {activeNav === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#123B63]">Official Reports & Export Center</h3>
                <p className="text-xs text-slate-500">Generate verified civic reports in CSV and printable PDF formats</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">Workers & Skills Register</h4>
                    <p className="text-xs text-slate-500">Comprehensive dataset of candidate profiles, verified skills, and work counts.</p>
                    <button
                      onClick={() => exportToCSV('work_bridge_workers', workers)}
                      className="w-full py-2 bg-[#123B63] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-900"
                    >
                      <Download className="w-3.5 h-3.5" /> Download CSV
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">Jobs & Applications Summary</h4>
                    <p className="text-xs text-slate-500">Active postings, placement statuses, duration, and wage benchmarks.</p>
                    <button
                      onClick={() => exportToCSV('work_bridge_jobs', jobs)}
                      className="w-full py-2 bg-[#123B63] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-900"
                    >
                      <Download className="w-3.5 h-3.5" /> Download CSV
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">Trust & Safety Docket</h4>
                    <p className="text-xs text-slate-500">Complaints register, resolution times, and mediation audit records.</p>
                    <button
                      onClick={() => exportToCSV('work_bridge_complaints', complaints)}
                      className="w-full py-2 bg-[#123B63] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-900"
                    >
                      <Download className="w-3.5 h-3.5" /> Download CSV
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print / Save PDF Platform Audit Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
