import { useState } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  HelpCircle,
  Laptop,
  Layers,
  ListChecks,
  Lock,
  Search,
  ShieldAlert,
  Sliders,
  Sparkles,
  Tag,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, PageHeading, ProgressBar, StatusPill } from '../components';
import { buildingPlanItems } from '../data';
import { useDemo } from '../state';

export function OnboardingPage({ adminMode = false }: { adminMode?: boolean }) {
  const { buildingDecisions, updateBuildingDecision } = useDemo();

  const [activeTab, setActiveTab] = useState<'dossier' | 'stages' | 'schema' | 'plans'>('dossier');
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [planSearch, setPlanSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [exportNotice, setExportNotice] = useState('');

  // Project Open Question states from ComplyPilot-Project-Docs.md
  const [platformDecision, setPlatformDecision] = useState<'web' | 'native'>('web');
  const [industrySpecialization, setIndustrySpecialization] = useState<'generic' | 'tech' | 'healthcare' | 'finance'>('tech');

  // Persona Sam / Maya Chen dossier data (from PRD & current state)
  const employeeData = {
    id: 'CP-1048',
    legalName: 'Maya Chen (Persona: Sam)',
    preferredName: 'Maya',
    email: 'maya.chen@example.test',
    personalEmail: 'mayachen.personal@example.test',
    phone: '+1 (555) 014-2078',
    location: 'San Francisco, CA (Pacific Time, UTC-7)',
    workModel: 'Hybrid (2 days in-office · Mission Bay HQ)',
    startDate: 'Wednesday, October 1, 2026',
    department: 'People & Culture',
    role: 'People Operations Associate',
    level: 'IC-2',
    manager: 'Jordan Lee (Persona: Dana / Head of People)',
    managerEmail: 'jordan.lee@example.test',
    buddy: 'Taylor Brooks / Priya (Team Manager)',
    emergencyContact: 'David Chen (Brother) · +1 (555) 019-3321',
  };

  const projectPersonas = [
    {
      name: 'Sam (New Hire / Employee)',
      role: 'Represented by Maya Chen (CP-1048)',
      pain: 'Started this week, has a dozen onboarding emails, doesn’t know what is required vs optional, and wants self-serve policy answers.',
      solution: 'Personalized onboarding dashboard, clear due dates, document status tracking, and 24/7 AI policy assistant.',
      color: 'sage',
    },
    {
      name: 'Dana (HR Generalist / HR Admin)',
      role: 'Represented by Jordan Lee (Head of People)',
      pain: 'Manages 15–40 new hires/quarter across offices in shared spreadsheets; dreads yearly audits because evidence is scattered.',
      solution: 'Org-wide overview, template task builder, instant deadline adjustments, automated email reminders, and one-click CSV audit export.',
      color: 'blue',
    },
    {
      name: 'Priya (Team Manager)',
      role: 'Represented by Jordan Lee / Taylor Brooks',
      pain: 'Wants a simple heads-up if her new report is stuck or behind on compliance, without logging into a complex HRIS.',
      solution: 'Manager-only team view with direct report progress, overdue flags, and scheduled 1:1 check-in templates.',
      color: 'gold',
    },
  ];

  const hardwareAssets = [
    { name: 'Apple MacBook Pro 16" (M3 Max, 36GB RAM)', tag: 'ASSET-8842', serial: 'C02G90XXMD6R', status: 'Delivered & Enrolled', icon: Laptop },
    { name: 'Dell UltraSharp 27" 4K USB-C Monitor', tag: 'ASSET-8843', serial: 'CN-0K793H-74261', status: 'Delivered', icon: Laptop },
    { name: 'YubiKey 5C NFC (Hardware MFA Token)', tag: 'KEY-4102', serial: 'YUBI-9923812', status: 'Activated', icon: Lock },
  ];

  const saasAccounts = [
    { name: 'Google Workspace (Gmail & Drive)', role: 'maya.chen@example.test', access: 'Standard Team', status: 'Active' },
    { name: 'Slack Enterprise Grid', role: '@mayachen', access: 'Member · #people-ops, #all-hands', status: 'Active' },
    { name: 'Supabase Auth & Storage', role: 'maya.chen@example.test', access: 'Role: employee (RLS-enforced)', status: 'Active' },
    { name: '1Password Enterprise', role: 'maya.chen@example.test', access: 'Work Vault + Team Shared', status: 'Active' },
    { name: 'GitHub Enterprise Org', role: 'mayachen-work', access: 'Read: Handbooks & Policies', status: 'Active' },
  ];

  const stagesData = [
    {
      stageNumber: 0,
      title: 'Pre-Boarding & Offer Finalization',
      timeline: 'Days -14 to Day 0',
      description: 'Formal candidate conversion, background verification, and equipment provisioning.',
      status: 'Completed',
      tasks: [
        { title: 'Countersign offer letter & IP agreements', owner: 'Employee', due: 'Day -10', verified: true, verification: 'Cryptographic DocuSign certificate' },
        { title: 'Criminal & employment background check', owner: 'HR Admin', due: 'Day -7', verified: true, verification: 'Checkr background report cleared' },
        { title: 'Confirm remote home office shipping address', owner: 'Employee', due: 'Day -7', verified: true, verification: 'FedEx Tracking #783921049281' },
        { title: 'Provision Google Workspace & Slack credentials', owner: 'IT Ops', due: 'Day -2', verified: true, verification: 'Okta automated provisioning hook' },
        { title: 'Send first-day welcome email & agenda', owner: 'Jordan Lee', due: 'Day -1', verified: true, verification: 'Sent to personal email' },
      ],
    },
    {
      stageNumber: 1,
      title: 'Day One: Identity, Access & Warm Welcome',
      timeline: 'Day 1',
      description: 'Form I-9 verification, payroll setup, hardware unboxing, and initial 1:1 check-in.',
      status: 'Completed',
      tasks: [
        { title: 'Section 2 Form I-9 document verification', owner: 'HR Admin', due: 'Day 1', verified: true, verification: 'Passport verified by Jordan Lee' },
        { title: 'Direct deposit routing & W-4 tax withholding', owner: 'Employee', due: 'Day 1', verified: true, verification: 'Bank routing verified & submitted' },
        { title: 'Hardware unboxing, FileVault & 1Password setup', owner: 'Employee', due: 'Day 1', verified: true, verification: 'Jamf MDM compliance pass' },
        { title: 'First 1:1 welcome conversation with Jordan Lee', owner: 'Manager', due: 'Day 1 · 10:30 AM', verified: true, verification: 'Completed calendar invite' },
        { title: 'Team meet & greet / virtual welcome coffee', owner: 'People Team', due: 'Day 1 · 2:00 PM', verified: true, verification: 'Team welcome call completed' },
      ],
    },
    {
      stageNumber: 2,
      title: 'Week One: Core Policies & Health Benefits',
      timeline: 'Days 2 to 7',
      description: 'Compliance training, code of conduct acknowledgement, and benefits selection.',
      status: 'In Progress',
      tasks: [
        { title: 'Review employee handbook & workplace policies', owner: 'Employee', due: 'Day 5', verified: true, verification: 'Digital acknowledgement recorded' },
        { title: 'Review & sign Code of Conduct & Ethics', owner: 'Employee', due: 'Day 5', verified: false, verification: 'Pending employee electronic signoff' },
        { title: 'Mandatory SOC2 security & phishing awareness', owner: 'Employee', due: 'Day 7', verified: false, verification: 'KnowBe4 module completion' },
        { title: 'Select health, dental, and 401(k) retirement plan', owner: 'Employee', due: 'Day 14', verified: false, verification: '30-day enrollment window open' },
        { title: 'End-of-week 1 check-in with buddy Taylor Brooks', owner: 'Buddy', due: 'Day 5 · 4:00 PM', verified: true, verification: 'Informal sync completed' },
      ],
    },
    {
      stageNumber: 3,
      title: 'Month One (Days 8 to 30): Workflow Immersion',
      timeline: 'Days 8 to 30',
      description: 'Role-specific shadowing, first deliverables, and 30-day milestone check-in.',
      status: 'Up Next',
      tasks: [
        { title: 'Shadow 5 candidate onboarding flows with Jordan', owner: 'Employee', due: 'Day 20', verified: false, verification: 'Shadowing log checklist' },
        { title: 'Publish first draft update to Policy Library FAQ', owner: 'Employee', due: 'Day 25', verified: false, verification: 'Peer review in ComplyPilot Policies' },
        { title: 'Complete 30-day alignment review with Jordan Lee', owner: 'Manager', due: 'Day 30', verified: false, verification: '30-day performance review form' },
        { title: 'Establish recurring weekly team sync cadence', owner: 'Employee', due: 'Day 14', verified: false, verification: 'Calendar sync set' },
      ],
    },
    {
      stageNumber: 4,
      title: 'Days 31 to 60: Autonomy & Ownership',
      timeline: 'Days 31 to 60',
      description: 'Independent cohort management, process optimization, and 60-day check-in.',
      status: 'Scheduled',
      tasks: [
        { title: 'Lead end-to-end onboarding for new hire cohort', owner: 'Employee', due: 'Day 45', verified: false, verification: 'Cohort completion rate > 90%' },
        { title: 'Partner with IT on automated equipment tracking', owner: 'Employee', due: 'Day 55', verified: false, verification: 'Workflow spec documented' },
        { title: '60-day milestone check-in & experience feedback', owner: 'Manager', due: 'Day 60', verified: false, verification: 'Survey feedback completed' },
      ],
    },
    {
      stageNumber: 5,
      title: 'Days 61 to 90: Mastery & Graduation',
      timeline: 'Days 61 to 90',
      description: 'Final probationary evaluation, goal setting, and full onboarding graduation.',
      status: 'Scheduled',
      tasks: [
        { title: 'Deliver onboarding friction retrospective report', owner: 'Employee', due: 'Day 80', verified: false, verification: 'Presented to Head of People' },
        { title: 'Set Q1 individual performance objectives (OKRs)', owner: 'Employee', due: 'Day 85', verified: false, verification: 'Logged in HRIS performance module' },
        { title: 'Formal 90-day onboarding sign-off & graduation', owner: 'Jordan Lee', due: 'Day 90', verified: false, verification: 'Permanent employee status verified' },
      ],
    },
  ];

  // 10 Database Schema Tables from TRD / ComplyPilot-Project-Docs.md
  const databaseTables = [
    { name: 'profiles', pk: 'id (uuid)', purpose: 'Application-level user profile & role enum', rls: 'Employee reads self; Manager reads direct reports; Admin reads all' },
    { name: 'onboarding_templates', pk: 'id (uuid)', purpose: 'HR-defined reusable checklist templates by department/role', rls: 'HR Admin read/write only' },
    { name: 'template_tasks', pk: 'id (uuid)', purpose: 'Individual task definitions within a template with relative due offsets', rls: 'HR Admin read/write only' },
    { name: 'employee_tasks', pk: 'id (uuid)', purpose: 'Per-employee generated checklist tasks with computed due dates', rls: 'Employee reads self; Admin updates; Manager reads reports' },
    { name: 'documents', pk: 'id (uuid)', purpose: 'Uploaded identity/tax documents stored in private Supabase bucket', rls: 'Private RLS-gated by employee_id and hr_admin role' },
    { name: 'policies', pk: 'id (uuid)', purpose: 'Company policy documents and handbook versions', rls: 'All authenticated users read; Admin writes' },
    { name: 'policy_chunks', pk: 'id (uuid)', purpose: 'Vectorized policy sections (vector 1536) for pgvector RAG similarity search', rls: 'Internal RAG pipeline & Claude API read' },
    { name: 'compliance_requirements', pk: 'id (uuid)', purpose: 'Statutory compliance rules (one-time vs annual cadence)', rls: 'Admin read/write; Employee read' },
    { name: 'compliance_records', pk: 'id (uuid)', purpose: 'Per-employee compliance completion tracking & audit status', rls: 'Employee reads self; Admin updates & exports' },
    { name: 'audit_log', pk: 'id (uuid)', purpose: 'Tamper-evident record of all status changes, reviews, and CSV exports', rls: 'System-inserted; HR Admin read-only for audits' },
  ];

  // 10-Phase Implementation Roadmap from Section 5 of ComplyPilot-Project-Docs.md
  const implementationPhases = [
    { phase: 'Phase 0', name: 'Setup & Free-Tier Infrastructure', goal: 'Next.js 14 App Router + Supabase + pgvector enabled + Vercel deployment skeleton.', status: 'Complete' },
    { phase: 'Phase 1', name: 'Database Schema & Auth', goal: '10 tables created, RLS security policies enforced, role-based login routing.', status: 'Complete' },
    { phase: 'Phase 2', name: 'Onboarding Checklist Engine', goal: 'Template builder + per-employee task generation + interactive status toggles.', status: 'Complete' },
    { phase: 'Phase 3', name: 'Document Upload & Review', goal: 'Private storage bucket + simulated upload/retry + HR approval/reject workflow.', status: 'Complete' },
    { phase: 'Phase 4', name: 'Policy Q&A RAG Pipeline', goal: 'Grounded Claude API answers with citations and honest "ask HR" fallback.', status: 'Complete' },
    { phase: 'Phase 5', name: 'Compliance Tracking & Deadlines', goal: 'Configurable requirements + deadline tracking + automated email triggers.', status: 'Complete' },
    { phase: 'Phase 6', name: 'HR Admin Dashboard & Audit Export', goal: 'Aggregated KPI metrics + overdue flags + CSV audit report generation.', status: 'Complete' },
    { phase: 'Phase 7', name: 'End-to-End Testing & Access Control', goal: 'Verify Journeys A, B, and C with zero cross-role data leaks.', status: 'Complete' },
    { phase: 'Phase 8', name: 'Production Polish & Build Verification', goal: 'Zero TypeScript warnings, responsive layouts, reduced-motion compliance.', status: 'Complete' },
    { phase: 'Phase 9', name: 'Minimal Public Landing Page', goal: 'Static entry page at / with tagline, feature bullets, and login routing.', status: 'Complete' },
  ];

  const filteredPlanItems = buildingPlanItems.filter((item) => {
    const matchesSearch = `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(planSearch.toLowerCase());
    const decision = buildingDecisions[item.id]?.decision ?? 'In Review';
    const matchesFilter = planFilter === 'All' || decision === planFilter;
    return matchesSearch && matchesFilter;
  });

  function exportDecisionsCSV() {
    const headers = ['Feature ID', 'Title', 'Category', 'Target Role', 'Effort Estimate', 'Priority', 'Decision', 'Notes'];
    const rows = buildingPlanItems.map((item) => {
      const decision = buildingDecisions[item.id] || { priority: item.defaultPriority, decision: 'In Review', notes: '' };
      return [
        item.id,
        item.title,
        item.category,
        item.targetRole,
        item.effort,
        decision.priority,
        decision.decision,
        decision.notes,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complypilot-project-building-plans-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExportNotice('Building plan decision matrix exported as CSV.');
    window.setTimeout(() => setExportNotice(''), 3500);
  }

  const approvedCount = Object.values(buildingDecisions).filter((d) => d.decision === 'Approved').length;
  const inReviewCount = Object.values(buildingDecisions).filter((d) => d.decision === 'In Review').length;
  const onHoldCount = Object.values(buildingDecisions).filter((d) => d.decision === 'Hold').length;

  return (
    <>
      <PageHeading
        eyebrow="COMPLYPILOT MASTER SPECIFICATION & ONBOARDING BLUEPRINT"
        title="Comprehensive Onboarding & Growth Hub"
        description="Single source of truth for new hire onboarding, technical architecture schema, regulatory compliance, and future building plans based on project documentation."
        action={
          <div className="onboarding-heading-actions">
            <button className="button button-secondary button-small" onClick={exportDecisionsCSV}>
              <Download size={14} /> Export building plan CSV
            </button>
            {adminMode ? (
              <Link to="/admin/templates" className="button button-primary button-small">
                <Sliders size={14} /> Manage Templates
              </Link>
            ) : (
              <Link to="/app/tasks" className="button button-primary button-small">
                <ListChecks size={14} /> View My Tasks
              </Link>
            )}
          </div>
        }
      />

      {exportNotice && (
        <div className="inline-success date-update-banner">
          <CheckCircle2 size={15} /> {exportNotice}
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="onboarding-tabs-bar">
        <button
          className={`onboarding-tab ${activeTab === 'dossier' ? 'onboarding-tab-active' : ''}`}
          onClick={() => setActiveTab('dossier')}
        >
          <User size={15} /> Personas & Dossier
        </button>
        <button
          className={`onboarding-tab ${activeTab === 'stages' ? 'onboarding-tab-active' : ''}`}
          onClick={() => setActiveTab('stages')}
        >
          <Layers size={15} /> 5-Stage Roadmap (Day 0–90)
        </button>
        <button
          className={`onboarding-tab ${activeTab === 'schema' ? 'onboarding-tab-active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          <Database size={15} /> Backend Schema & Phases 0–9
        </button>
        <button
          className={`onboarding-tab onboarding-tab-highlight ${
            activeTab === 'plans' ? 'onboarding-tab-active' : ''
          }`}
          onClick={() => setActiveTab('plans')}
        >
          <Sparkles size={15} /> Decision & Building Plans Matrix
          <span className="tab-badge">{buildingPlanItems.length}</span>
        </button>
      </div>

      {/* TAB 1: PERSONAS & EMPLOYEE DOSSIER */}
      {activeTab === 'dossier' && (
        <div className="dossier-layout">
          <div className="dossier-main">
            {/* PRD Personas Summary */}
            <section className="surface-card dossier-section-card">
              <div className="section-card-title">
                <Users size={18} />
                <div>
                  <h3>Target User Personas (From Project PRD)</h3>
                  <p>How ComplyPilot solves pain points for employees, HR generalists, and managers</p>
                </div>
              </div>
              <div className="personas-cards-grid">
                {projectPersonas.map((persona, pIdx) => (
                  <div className="persona-card" key={pIdx}>
                    <div className="persona-header">
                      <Avatar initials={persona.name.slice(0, 2).toUpperCase()} size="sm" color={persona.color} />
                      <div>
                        <strong>{persona.name}</strong>
                        <small>{persona.role}</small>
                      </div>
                    </div>
                    <div className="persona-body">
                      <p><strong>Core Friction:</strong> {persona.pain}</p>
                      <p className="persona-solution"><strong>ComplyPilot Value:</strong> {persona.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Maya Chen Full Dossier */}
            <section className="surface-card dossier-profile-card">
              <div className="dossier-header-top">
                <Avatar initials="MC" size="lg" color="sage" />
                <div className="dossier-title-group">
                  <div className="dossier-title-line">
                    <h2>{employeeData.legalName}</h2>
                    <span className="mono-badge">{employeeData.id}</span>
                    <StatusPill status="On track" />
                  </div>
                  <p className="dossier-subtitle">
                    {employeeData.role} · {employeeData.department} (Level {employeeData.level})
                  </p>
                </div>
              </div>

              <div className="dossier-fields-grid">
                <div className="dossier-field">
                  <span>Work Email</span>
                  <strong>{employeeData.email}</strong>
                </div>
                <div className="dossier-field">
                  <span>Personal Email</span>
                  <strong>{employeeData.personalEmail}</strong>
                </div>
                <div className="dossier-field">
                  <span>Mobile Phone</span>
                  <strong>{employeeData.phone}</strong>
                </div>
                <div className="dossier-field">
                  <span>Work Location</span>
                  <strong>{employeeData.location}</strong>
                </div>
                <div className="dossier-field">
                  <span>Start Date</span>
                  <strong>{employeeData.startDate}</strong>
                </div>
                <div className="dossier-field">
                  <span>Employment Type</span>
                  <strong>Full-time Exempt · {employeeData.workModel}</strong>
                </div>
                <div className="dossier-field">
                  <span>Reporting Manager</span>
                  <strong>{employeeData.manager}</strong>
                </div>
                <div className="dossier-field">
                  <span>Onboarding Buddy</span>
                  <strong>{employeeData.buddy}</strong>
                </div>
                <div className="dossier-field dossier-field-full">
                  <span>Emergency Contact</span>
                  <strong>{employeeData.emergencyContact}</strong>
                </div>
              </div>
            </section>

            {/* Hardware & IT Provisioning */}
            <section className="surface-card dossier-section-card">
              <div className="section-card-title">
                <Laptop size={17} />
                <div>
                  <h3>Hardware & IT Equipment Provisioning</h3>
                  <p>Devices provisioned through corporate MDM and courier tracking</p>
                </div>
              </div>
              <div className="asset-items-list">
                {hardwareAssets.map((asset) => {
                  const Icon = asset.icon;
                  return (
                    <div className="asset-item-row" key={asset.tag}>
                      <span className="asset-icon">
                        <Icon size={16} />
                      </span>
                      <div className="asset-info">
                        <strong>{asset.name}</strong>
                        <small>
                          Asset Tag: <span className="mono">{asset.tag}</span> · Serial:{' '}
                          <span className="mono">{asset.serial}</span>
                        </small>
                      </div>
                      <StatusPill status="approved" label={asset.status} />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SaaS Entitlements */}
            <section className="surface-card dossier-section-card">
              <div className="section-card-title">
                <Lock size={17} />
                <div>
                  <h3>SaaS Accounts & Role-Based Permissions</h3>
                  <p>Single sign-on accounts provisioned via identity provider</p>
                </div>
              </div>
              <div className="saas-accounts-grid">
                {saasAccounts.map((account) => (
                  <div className="saas-account-card" key={account.name}>
                    <div className="saas-top">
                      <strong>{account.name}</strong>
                      <span className="active-dot" />
                    </div>
                    <span className="saas-role">{account.role}</span>
                    <small className="saas-access">{account.access}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="dossier-sidebar">
            <div className="surface-card dossier-quick-stats">
              <h3>Onboarding Health (Sam / Maya)</h3>
              <div className="stat-circle-row">
                <div className="stat-number-box">
                  <strong>50%</strong>
                  <small>Overall progress</small>
                </div>
                <div className="stat-metrics">
                  <div>
                    <span>Completed Steps</span>
                    <strong>4 of 8 tasks</strong>
                  </div>
                  <div>
                    <span>Documents Verified</span>
                    <strong>2 approved</strong>
                  </div>
                  <div>
                    <span>Current Phase</span>
                    <strong>Week 1 Compliance</strong>
                  </div>
                </div>
              </div>
              <ProgressBar value={50} compact />
            </div>

            <div className="surface-card dossier-buddy-card">
              <span className="buddy-eyebrow">YOUR ONBOARDING TEAM</span>
              <div className="buddy-profile-row">
                <Avatar initials="JL" size="md" color="blue" />
                <div>
                  <strong>Jordan Lee (Dana)</strong>
                  <small>Head of People (HR Admin)</small>
                </div>
              </div>
              <p className="buddy-note">
                "Dana manages onboarding across teams. She sets templates, configures deadlines, and exports audit logs."
              </p>
              <div className="buddy-divider" />
              <div className="buddy-profile-row">
                <Avatar initials="TB" size="md" color="gold" />
                <div>
                  <strong>Taylor Brooks (Priya)</strong>
                  <small>Team Manager & Onboarding Buddy</small>
                </div>
              </div>
              <p className="buddy-note">
                Priya checks in on direct reports without needing a complex HR tool. She receives alerts if tasks are overdue.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: 5-STAGE MILESTONE ROADMAP */}
      {activeTab === 'stages' && (
        <div className="stages-layout">
          <div className="stages-stepper-header">
            {stagesData.map((stg) => (
              <button
                key={stg.stageNumber}
                className={`stage-step-btn ${selectedStage === stg.stageNumber ? 'stage-step-active' : ''}`}
                onClick={() => setSelectedStage(stg.stageNumber)}
              >
                <div className="stage-step-top">
                  <span className="stage-num">STAGE {stg.stageNumber}</span>
                  <StatusPill status={stg.status} />
                </div>
                <strong className="stage-title">{stg.title}</strong>
                <span className="stage-time">{stg.timeline}</span>
              </button>
            ))}
          </div>

          {(() => {
            const currentStage = stagesData[selectedStage];
            return (
              <section className="surface-card stage-detail-card">
                <div className="stage-card-header">
                  <div>
                    <span className="eyebrow">STAGE {currentStage.stageNumber} CHECKLIST & VERIFICATIONS</span>
                    <h2>{currentStage.title}</h2>
                    <p>{currentStage.description}</p>
                  </div>
                  <div className="stage-status-wrap">
                    <StatusPill status={currentStage.status} />
                    <span className="stage-time-chip">
                      <Clock3 size={13} /> {currentStage.timeline}
                    </span>
                  </div>
                </div>

                <div className="stage-tasks-table-wrap">
                  <table className="data-table stage-tasks-table">
                    <thead>
                      <tr>
                        <th>MILESTONE TASK</th>
                        <th>OWNER</th>
                        <th>TARGET TIMELINE</th>
                        <th>VERIFICATION CRITERIA / EVIDENCE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStage.tasks.map((task, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{task.title}</strong>
                          </td>
                          <td>
                            <span className="task-owner-pill">
                              <Tag size={11} /> {task.owner}
                            </span>
                          </td>
                          <td>
                            <span className="task-due-chip">
                              <CalendarDays size={12} /> {task.due}
                            </span>
                          </td>
                          <td>
                            <span className="verification-proof">
                              <CheckCircle2 size={13} /> {task.verification}
                            </span>
                          </td>
                          <td>
                            <StatusPill status={task.verified ? 'completed' : 'pending-review'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="stage-card-footer">
                  <div className="stage-footer-note">
                    <HelpCircle size={14} />
                    <span>
                      Milestones are evaluated during formal check-ins with Jordan Lee and require documented proof.
                    </span>
                  </div>
                  <div className="stage-nav-btns">
                    {selectedStage > 0 && (
                      <button
                        className="button button-secondary button-small"
                        onClick={() => setSelectedStage((s) => s - 1)}
                      >
                        ← Stage {selectedStage - 1}
                      </button>
                    )}
                    {selectedStage < stagesData.length - 1 && (
                      <button
                        className="button button-primary button-small"
                        onClick={() => setSelectedStage((s) => s + 1)}
                      >
                        Stage {selectedStage + 1} →
                      </button>
                    )}
                  </div>
                </div>
              </section>
            );
          })()}
        </div>
      )}

      {/* TAB 3: BACKEND SCHEMA & 10-PHASE IMPLEMENTATION ROADMAP */}
      {activeTab === 'schema' && (
        <div className="schema-layout">
          {/* 10 Database Tables from Project Docs */}
          <section className="surface-card schema-section-card">
            <div className="admin-card-header">
              <div>
                <span className="eyebrow">DATABASE & DATA MODEL SPECIFICATION</span>
                <h2>10 Supabase Postgres Tables (From Backend Schema)</h2>
                <p>Complete data architecture with Row-Level Security (RLS) enforcement rules</p>
              </div>
              <span className="badge-shield">
                <Database size={16} /> PostgreSQL + pgvector
              </span>
            </div>

            <div className="table-wrap">
              <table className="data-table schema-table">
                <thead>
                  <tr>
                    <th>TABLE NAME</th>
                    <th>PRIMARY KEY</th>
                    <th>FUNCTIONAL PURPOSE</th>
                    <th>ROW-LEVEL SECURITY (RLS) ACCESS RULE</th>
                  </tr>
                </thead>
                <tbody>
                  {databaseTables.map((tbl) => (
                    <tr key={tbl.name}>
                      <td>
                        <strong className="mono table-name-code">{tbl.name}</strong>
                      </td>
                      <td>
                        <span className="mono">{tbl.pk}</span>
                      </td>
                      <td>{tbl.purpose}</td>
                      <td>
                        <span className="rls-rule-text">{tbl.rls}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sensitive-data-callout">
              <ShieldAlert size={16} />
              <div>
                <strong>Sensitive PII Handling Policy (From Technical Requirements):</strong>
                <p>
                  Government ID numbers, bank details, and signed tax/legal forms are stored strictly as <em>opaque uploaded files</em> in the private <code>documents</code> bucket. They are never parsed into structured database columns and <strong>never sent to the Claude API</strong>. The RAG pipeline only ever touches <code>policy_chunks</code> (HR-authored policy text).
                </p>
              </div>
            </div>
          </section>

          {/* 10-Phase Implementation Roadmap */}
          <section className="surface-card schema-section-card">
            <div className="admin-card-header">
              <div>
                <span className="eyebrow">ENGINEERING DELIVERY ROADMAP</span>
                <h2>10 Implementation Phases (From Section 5)</h2>
                <p>Verified done checks for every delivery milestone of ComplyPilot</p>
              </div>
            </div>

            <div className="phases-grid">
              {implementationPhases.map((phase) => (
                <div className="phase-card" key={phase.phase}>
                  <div className="phase-card-top">
                    <span className="phase-badge">{phase.phase}</span>
                    <StatusPill status="completed" label={phase.status} />
                  </div>
                  <strong>{phase.name}</strong>
                  <p>{phase.goal}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: DECISION & BUILDING PLANS MATRIX */}
      {activeTab === 'plans' && (
        <div className="building-plans-layout">
          {/* Key Open Questions from Project Docs */}
          <section className="surface-card open-questions-card">
            <div className="questions-card-header">
              <HelpCircle size={18} />
              <div>
                <h3>Key Architecture Decisions (From Project Docs "Open Questions")</h3>
                <p>Align on scope and specialization to finalize the technical trajectory</p>
              </div>
            </div>

            <div className="questions-grid">
              <div className="question-box">
                <span className="q-label">QUESTION 1: PLATFORM SCOPE</span>
                <strong>Responsive Web App vs. Native Mobile Apps</strong>
                <p>
                  Assumption 3 recommends one responsive web app to avoid doubling build and maintenance costs for a solo developer.
                </p>
                <div className="q-options">
                  <label className={`q-option ${platformDecision === 'web' ? 'q-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="platform"
                      checked={platformDecision === 'web'}
                      onChange={() => setPlatformDecision('web')}
                    />
                    <span>Responsive Web App (Recommended · Next.js / Vercel)</span>
                  </label>
                  <label className={`q-option ${platformDecision === 'native' ? 'q-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="platform"
                      checked={platformDecision === 'native'}
                      onChange={() => setPlatformDecision('native')}
                    />
                    <span>Native iOS / Android Apps (Requires separate codebases)</span>
                  </label>
                </div>
              </div>

              <div className="question-box">
                <span className="q-label">QUESTION 2: COMPLIANCE FOCUS</span>
                <strong>Industry Compliance Specialization</strong>
                <p>
                  Determines the pre-loaded policy chunks and regulatory audit requirements.
                </p>
                <div className="q-options">
                  <label className={`q-option ${industrySpecialization === 'tech' ? 'q-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="industry"
                      checked={industrySpecialization === 'tech'}
                      onChange={() => setIndustrySpecialization('tech')}
                    />
                    <span>Tech / SaaS (SOC2 Type II, GDPR, CCPA, InfoSec)</span>
                  </label>
                  <label className={`q-option ${industrySpecialization === 'healthcare' ? 'q-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="industry"
                      checked={industrySpecialization === 'healthcare'}
                      onChange={() => setIndustrySpecialization('healthcare')}
                    />
                    <span>Healthcare (HIPAA, HITECH, Bloodborne Pathogens)</span>
                  </label>
                  <label className={`q-option ${industrySpecialization === 'finance' ? 'q-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="industry"
                      checked={industrySpecialization === 'finance'}
                      onChange={() => setIndustrySpecialization('finance')}
                    />
                    <span>Financial Services (FINRA, SEC, PCI-DSS, AML)</span>
                  </label>
                  <label className={`q-option ${industrySpecialization === 'generic' ? 'q-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="industry"
                      checked={industrySpecialization === 'generic'}
                      onChange={() => setIndustrySpecialization('generic')}
                    />
                    <span>Generic HR (FLSA, EEOC, I-9, Core Handbooks)</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <div className="plans-summary-banner surface-card">
            <div className="plans-banner-icon">
              <Sparkles size={20} />
            </div>
            <div className="plans-banner-text">
              <strong>v2+ Feature Decision Matrix (From Project Docs Nice-to-Have List)</strong>
              <p>
                Use this decision tool to prioritize feature specifications, assign engineering effort,
                and export the plan as CSV.
              </p>
            </div>
            <div className="plans-metrics-chips">
              <span className="metric-chip approved">
                <strong>{approvedCount}</strong> Approved
              </span>
              <span className="metric-chip review">
                <strong>{inReviewCount}</strong> In Review
              </span>
              <span className="metric-chip hold">
                <strong>{onHoldCount}</strong> On Hold
              </span>
            </div>
          </div>

          {/* Filter and search toolbar */}
          <div className="plans-toolbar">
            <label className="search-field">
              <Search size={14} />
              <input
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                placeholder="Search architecture plans, APIs, or categories..."
              />
            </label>
            <div className="plans-filter-group">
              <span>Filter by decision:</span>
              {(['All', 'Approved', 'In Review', 'Hold'] as const).map((filterOpt) => (
                <button
                  key={filterOpt}
                  className={`button button-small ${
                    planFilter === filterOpt ? 'button-primary' : 'button-secondary'
                  }`}
                  onClick={() => setPlanFilter(filterOpt)}
                >
                  {filterOpt}
                </button>
              ))}
            </div>
          </div>

          {/* Cards for each building plan item */}
          <div className="building-cards-grid">
            {filteredPlanItems.map((item) => {
              const currentDecision = buildingDecisions[item.id] || {
                priority: item.defaultPriority,
                decision: 'In Review',
                notes: '',
              };

              return (
                <article className="surface-card building-plan-card" key={item.id}>
                  <div className="plan-card-top">
                    <span className="plan-category-pill">{item.category}</span>
                    <span className="plan-effort-pill">
                      <Clock3 size={12} /> {item.effort}
                    </span>
                  </div>

                  <h3 className="plan-card-title">{item.title}</h3>
                  <p className="plan-card-desc">{item.description}</p>

                  <div className="plan-spec-section">
                    <strong>Architectural Considerations:</strong>
                    <ul>
                      {item.architecturalDecisions.map((decision, dIdx) => (
                        <li key={dIdx}>{decision}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-spec-section">
                    <strong>Key Deliverables:</strong>
                    <div className="deliverable-tags">
                      {item.deliverables.map((deliv, dIdx) => (
                        <span className="deliverable-tag" key={dIdx}>
                          <Check size={11} /> {deliv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="plan-decision-box">
                    <div className="decision-field-pair">
                      <label>
                        <span>Priority Level</span>
                        <select
                          className="field-input field-small"
                          value={currentDecision.priority}
                          onChange={(e) =>
                            updateBuildingDecision(item.id, {
                              priority: e.target.value as any,
                            })
                          }
                        >
                          <option value="Must have">Must have (P0)</option>
                          <option value="Should have">Should have (P1)</option>
                          <option value="Nice to have">Nice to have (P2)</option>
                        </select>
                      </label>

                      <label>
                        <span>Sprint Decision</span>
                        <select
                          className={`field-input field-small decision-select ${currentDecision.decision.toLowerCase().replace(/\s+/g, '-')}`}
                          value={currentDecision.decision}
                          onChange={(e) =>
                            updateBuildingDecision(item.id, {
                              decision: e.target.value as any,
                            })
                          }
                        >
                          <option value="Approved">Approved for Build</option>
                          <option value="In Review">Under Review</option>
                          <option value="Hold">On Hold / Backlog</option>
                        </select>
                      </label>
                    </div>

                    <label className="decision-notes-label">
                      <span>Architectural Notes / Stakeholder Feedback</span>
                      <textarea
                        className="field-textarea field-small"
                        placeholder="Add decision comments, technical constraints, or API requirements..."
                        value={currentDecision.notes}
                        onChange={(e) =>
                          updateBuildingDecision(item.id, {
                            notes: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="plans-bottom-banner">
            <div>
              <strong>Ready to export your architecture building roadmap?</strong>
              <p>Download the decision matrix containing priority rankings, sprint allocations, and technical notes.</p>
            </div>
            <button className="button button-primary" onClick={exportDecisionsCSV}>
              <Download size={15} /> Export Building Plan (CSV)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
