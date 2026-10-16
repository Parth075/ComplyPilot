export type Role = 'employee' | 'manager' | 'admin';
export type TaskStatus = 'not-started' | 'in-progress' | 'pending-review' | 'completed';
export type DocumentStatus = 'uploaded' | 'pending-review' | 'approved' | 'rejected';

export interface Task {
  id: string;
  title: string;
  category: string;
  due: string;
  status: TaskStatus;
  description: string;
  owner?: string;
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  email: string;
  department: string;
  role: string;
  manager: string;
  startDate: string;
  progress: number;
  status: 'On track' | 'Needs attention' | 'Complete';
}

export interface DemoDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  status: DocumentStatus;
}

export interface PolicySource {
  id: string;
  title: string;
  section: string;
  updated: string;
  body: string;
  status: 'Published' | 'Draft';
}

export interface TemplateTask {
  id: string;
  title: string;
  category: string;
  dueWindow: string; // e.g. 'Day 1', 'Within 3 days', 'Within 5 days', 'Day 14', 'Day 30'
  description: string;
  owner?: 'Employee' | 'Manager' | 'HR Admin' | 'IT';
  required?: boolean;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  group: string;
  status: 'Active' | 'Draft';
  updated: string;
  tasks: TemplateTask[];
}

export interface BuildingPlanItem {
  id: string;
  title: string;
  category: 'Integration' | 'Automation' | 'AI & Compliance' | 'Workflows' | 'Experience';
  effort: string;
  targetRole: string;
  defaultPriority: 'Must have' | 'Should have' | 'Nice to have';
  description: string;
  architecturalDecisions: string[];
  deliverables: string[];
}

export const navEmployee = [
  { label: 'Overview', to: '/app/dashboard', icon: 'overview' },
  { label: 'My tasks', to: '/app/tasks', icon: 'tasks' },
  { label: 'Onboarding Hub', to: '/app/onboarding', icon: 'onboarding' },
  { label: 'Documents', to: '/app/documents', icon: 'documents' },
  { label: 'Ask a question', to: '/app/ask', icon: 'ask' },
  { label: 'My profile', to: '/app/profile', icon: 'profile' },
] as const;

export const navManager = [
  ...navEmployee.slice(0, 4),
  { label: 'My team', to: '/app/team', icon: 'team' },
  navEmployee[4],
  navEmployee[5],
] as const;

export const navAdmin = [
  { label: 'Overview', to: '/admin/dashboard', icon: 'overview' },
  { label: 'Employees', to: '/admin/employees', icon: 'team' },
  { label: 'Onboarding Plan', to: '/admin/onboarding', icon: 'onboarding' },
  { label: 'Templates', to: '/admin/templates', icon: 'templates' },
  { label: 'Policies', to: '/admin/policies', icon: 'documents' },
  { label: 'Compliance', to: '/admin/compliance', icon: 'compliance' },
  { label: 'Reports', to: '/admin/reports', icon: 'reports' },
  { label: 'Settings', to: '/admin/settings', icon: 'settings' },
] as const;

export const initialTasks: Task[] = [
  { id: 't1', title: 'Complete your personal profile', category: 'Getting started', due: 'Completed Oct 5', status: 'completed', description: 'Add your contact details, emergency contacts, and preferred name so your team can get to know you.' },
  { id: 't2', title: 'Read the employee handbook', category: 'Policies', due: 'Completed Oct 6', status: 'completed', description: 'Review the handbook and acknowledge that you have read key workplace policies.' },
  { id: 't3', title: 'Set up payroll details', category: 'Payroll', due: 'Due today', status: 'in-progress', description: 'Add your payment preference, routing number, and tax withholding preferences.' },
  { id: 't4', title: 'Upload your identity document', category: 'Documents', due: 'Submitted Oct 6', status: 'pending-review', description: 'Your passport or government ID is with HR for Form I-9 verification.' },
  { id: 't5', title: 'Choose your benefits', category: 'Benefits', due: 'Due Fri, Oct 9', status: 'not-started', description: 'Compare available health, dental, vision plans and submit your 30-day enrollment.' },
  { id: 't6', title: 'Acknowledge the code of conduct', category: 'Policies', due: 'Due Fri, Oct 9', status: 'not-started', description: 'Read the code of conduct, whistleblower policy, and record your annual acknowledgement.' },
  { id: 't7', title: 'Complete security awareness', category: 'Learning', due: 'Due Mon, Oct 12', status: 'not-started', description: 'A short interactive module on phishing prevention, MFA, and data handling.' },
  { id: 't8', title: 'Meet with your manager', category: 'People', due: 'Completed Oct 6', status: 'completed', description: 'Schedule your first-week alignment and 30-day goals conversation with Jordan Lee.' },
];

export const employees: Employee[] = [
  { id: 'CP-1048', name: 'Maya Chen', initials: 'MC', email: 'maya.chen@example.test', department: 'People & Culture', role: 'People Operations Associate', manager: 'Jordan Lee', startDate: 'Oct 1, 2026', progress: 50, status: 'On track' },
  { id: 'CP-1049', name: 'Niko Patel', initials: 'NP', email: 'niko.patel@example.test', department: 'Product', role: 'Product Designer', manager: 'Jordan Lee', startDate: 'Oct 5, 2026', progress: 63, status: 'On track' },
  { id: 'CP-1050', name: 'Amara Johnson', initials: 'AJ', email: 'amara.johnson@example.test', department: 'Customer Experience', role: 'Customer Success Lead', manager: 'Taylor Brooks', startDate: 'Sep 28, 2026', progress: 38, status: 'Needs attention' },
  { id: 'CP-1051', name: 'Leo Martinez', initials: 'LM', email: 'leo.martinez@example.test', department: 'Engineering', role: 'Software Engineer', manager: 'Morgan Reed', startDate: 'Sep 21, 2026', progress: 100, status: 'Complete' },
  { id: 'CP-1052', name: 'Priya Singh', initials: 'PS', email: 'priya.singh@example.test', department: 'Operations', role: 'Operations Coordinator', manager: 'Jordan Lee', startDate: 'Oct 6, 2026', progress: 25, status: 'On track' },
  { id: 'CP-1053', name: 'Elliot Park', initials: 'EP', email: 'elliot.park@example.test', department: 'Finance', role: 'Finance Analyst', manager: 'Casey Morgan', startDate: 'Sep 29, 2026', progress: 75, status: 'On track' },
];

export const initialDocuments: DemoDocument[] = [
  { id: 'd1', name: 'Identity document', type: 'PDF · 1.2 MB', date: 'Uploaded Oct 6', status: 'pending-review' },
  { id: 'd2', name: 'Signed offer letter', type: 'PDF · 842 KB', date: 'Uploaded Oct 1', status: 'approved' },
  { id: 'd3', name: 'Direct deposit form', type: 'PDF · 236 KB', date: 'Uploaded Oct 2', status: 'approved' },
];

export const policySources: Omit<PolicySource, 'status'>[] = [
  { id: 'remote-work', title: 'Flexible work policy', section: 'Section 3.2 · Working arrangements', updated: 'Updated Sep 18, 2026', body: 'Teams agree on a working rhythm with their manager. Employees should keep their calendar current, join scheduled team meetings, and ask their manager about location-specific arrangements.' },
  { id: 'time-off', title: 'Time away from work', section: 'Section 4.2 · Requesting time away', updated: 'Updated Aug 30, 2026', body: 'Submit a time-away request through the team process and discuss timing with your manager. The manager confirms coverage and follows up if more information is needed.' },
  { id: 'security', title: 'Information care guidelines', section: 'Section 2.1 · Protecting information', updated: 'Updated Sep 10, 2026', body: 'Use approved tools for work information, keep sign-in details private, and report a concern to the People Operations team promptly.' },
];

export const initialTemplates: OnboardingTemplate[] = [
  {
    id: 'tpl1',
    name: 'New employee · Core plan',
    group: 'All teams',
    status: 'Active',
    updated: 'Sep 18, 2026',
    tasks: [
      { id: 'st1', title: 'Complete personal & contact profile', category: 'Getting started', dueWindow: 'Day 1', description: 'Fill in emergency contacts, preferred name, and personal communications preference.', owner: 'Employee', required: true },
      { id: 'st2', title: 'Upload government photo identity', category: 'Documents', dueWindow: 'Day 1', description: 'Upload valid passport or state ID for HR Form I-9 verification.', owner: 'Employee', required: true },
      { id: 'st3', title: 'Submit payroll & tax withholding details', category: 'Payroll', dueWindow: 'Day 1', description: 'Provide direct deposit routing number and complete W-4 tax withholding form.', owner: 'Employee', required: true },
      { id: 'st4', title: 'Acknowledge workplace employee handbook', category: 'Policies', dueWindow: 'Within 5 days', description: 'Review the comprehensive company handbook and acknowledge understanding.', owner: 'Employee', required: true },
      { id: 'st5', title: 'Review & sign code of conduct & ethics', category: 'Policies', dueWindow: 'Within 5 days', description: 'Annual commitment to anti-harassment, ethics, and workplace standards.', owner: 'Employee', required: true },
      { id: 'st6', title: 'Complete mandatory security awareness', category: 'Learning', dueWindow: 'Within 10 days', description: 'SOC2 compliant training covering phishing, credential care, and device security.', owner: 'Employee', required: true },
      { id: 'st7', title: 'Select health & wellness benefits plan', category: 'Benefits', dueWindow: 'Within 14 days', description: 'Review medical, vision, 401(k) matching, and submit your elections before the 30-day window.', owner: 'Employee', required: false },
      { id: 'st8', title: 'Conduct first 1:1 check-in with manager', category: 'People', dueWindow: 'Within 7 days', description: 'Discuss role expectations, 30-60-90 day milestone alignment, and ask questions.', owner: 'Manager', required: true },
    ],
  },
  {
    id: 'tpl2',
    name: 'People manager · First 30 days',
    group: 'Managers',
    status: 'Active',
    updated: 'Sep 12, 2026',
    tasks: [
      { id: 'mt1', title: 'Complete manager leadership handbook', category: 'Policies', dueWindow: 'Day 3', description: 'Review performance management cycles, leave approval workflows, and HR escalation processes.', owner: 'Manager', required: true },
      { id: 'mt2', title: 'Set up weekly 1:1 recurring syncs', category: 'People', dueWindow: 'Within 5 days', description: 'Schedule dedicated recurring touchpoints with all direct reports in calendar.', owner: 'Manager', required: true },
      { id: 'mt3', title: 'Review team budget & spending limits', category: 'Operations', dueWindow: 'Within 10 days', description: 'Confirm team software subscription approvals and travel stipend guidelines.', owner: 'Manager', required: true },
      { id: 'mt4', title: 'Publish team 90-day objectives & key results', category: 'Planning', dueWindow: 'Within 30 days', description: 'Draft and review quarterly team deliverables with department leadership.', owner: 'Manager', required: true },
    ],
  },
  {
    id: 'tpl3',
    name: 'Remote team · Core plan',
    group: 'Remote employees',
    status: 'Draft',
    updated: 'Oct 2, 2026',
    tasks: [
      { id: 'rt1', title: 'Confirm home office equipment delivery', category: 'IT', dueWindow: 'Day 1', description: 'Verify receipt of laptop, monitor, and configure corporate VPN & 1Password.', owner: 'Employee', required: true },
      { id: 'rt2', title: 'Submit home workspace stipend receipt', category: 'Payroll', dueWindow: 'Within 14 days', description: 'Claim the $500 one-time ergonomic desk & chair setup reimbursement.', owner: 'Employee', required: false },
      { id: 'rt3', title: 'Agree on remote working rhythm with team', category: 'People', dueWindow: 'Within 7 days', description: 'Align on core communication hours, Slack etiquette, and timezone availability.', owner: 'Employee', required: true },
    ],
  },
];

export const buildingPlanItems: BuildingPlanItem[] = [
  {
    id: 'bp1',
    title: 'Automated HRIS Bi-Directional Sync',
    category: 'Integration',
    effort: '2 Sprints (4 weeks)',
    targetRole: 'HR Admin & IT',
    defaultPriority: 'Must have',
    description: 'Direct bi-directional sync with Workday, BambooHR, and Rippling to eliminate manual employee row entry and automatically ingest new hire start dates.',
    architecturalDecisions: [
      'Webhook listener for employee creation events',
      'Field mapping schema between ComplyPilot & external HRIS',
      'Automatic provisioning trigger for IT laptop shipments',
    ],
    deliverables: [
      'HRIS OAuth2 connector settings page',
      'Sync status monitor & audit logging in Reports',
      'Automatic employee creation pipeline',
    ],
  },
  {
    id: 'bp2',
    title: 'Dynamic Template Engine with Conditional Logic',
    category: 'Workflows',
    effort: '2 Sprints (3 weeks)',
    targetRole: 'HR Admin',
    defaultPriority: 'Must have',
    description: 'Allow HR admins to create branching checklist templates that automatically adapt tasks based on country, state laws, remote/onsite status, and department.',
    architecturalDecisions: [
      'JSON-based rule evaluation engine for task conditional criteria',
      'Role & location tag matching on employee assignment',
      'Support for due-date relative offset math (e.g. StartDate + 5 business days)',
    ],
    deliverables: [
      'Visual condition builder in Template Editor (if State == CA add CA-specific wage notice)',
      'Template simulation test runner before publishing',
    ],
  },
  {
    id: 'bp3',
    title: 'AI Document OCR & Automated Identity Verification',
    category: 'AI & Compliance',
    effort: '3 Sprints (6 weeks)',
    targetRole: 'HR Admin',
    defaultPriority: 'Should have',
    description: 'Automatic verification of government IDs, tax withholding forms, and direct deposit voided checks using OCR and secure document validation.',
    architecturalDecisions: [
      'Client-side PII redaction before transmission',
      'Automated expiry date & MRZ checksum validation on passports',
      'Pre-filling of I-9 review checklist with human-in-the-loop review',
    ],
    deliverables: [
      'Document scanner preview with auto-detected fields',
      'Confidence score badge on HR Review screen',
      'Instant feedback to employees if an image is blurry or expired',
    ],
  },
  {
    id: 'bp4',
    title: 'In-App & Slack Policy RAG Assistant',
    category: 'AI & Compliance',
    effort: '2 Sprints (4 weeks)',
    targetRole: 'Employee & Manager',
    defaultPriority: 'Should have',
    description: 'Embed the conversational policy assistant into Slack and Microsoft Teams so new hires can ask questions directly without switching tabs.',
    architecturalDecisions: [
      'Vector embeddings database for granular policy section chunks',
      'Strict temperature 0.0 with mandatory source-citation grounding',
      'Slack slash command /askpolicy and DM bot bot-user',
    ],
    deliverables: [
      'Slack Bot App with interactive source link buttons',
      'Admin analytics dashboard on most-asked policy queries',
      'Escalate-to-HR action button for unresolved queries',
    ],
  },
  {
    id: 'bp5',
    title: 'Legally-Binding E-Signatures (DocuSign / Dropbox Sign)',
    category: 'Integration',
    effort: '1 Sprint (2 weeks)',
    targetRole: 'Employee & HR Admin',
    defaultPriority: 'Must have',
    description: 'Integrated digital signing ceremony for offer letters, NDAs, and handbook acknowledgements with ESIGN and UETA compliance.',
    architecturalDecisions: [
      'Embedded iframe signing ceremony with cryptographic audit trail',
      'Webhook callback on document completion to update task status automatically',
    ],
    deliverables: [
      'In-browser signing canvas with audit hash',
      'Exportable Certificate of Completion PDF',
    ],
  },
  {
    id: 'bp6',
    title: 'Automated Manager SLA & Milestone Escalation Engine',
    category: 'Automation',
    effort: '1 Sprint (2 weeks)',
    targetRole: 'Manager & HR Admin',
    defaultPriority: 'Nice to have',
    description: 'Automated notification engine sending gentle reminders to managers 48 hours before 30-day reviews, with automated escalation to HR if tasks become overdue.',
    architecturalDecisions: [
      'Cron-based deadline scheduler with customizable notification preferences',
      'Configurable escalation tiers: Day -2 reminder, Day 0 due notice, Day +3 HR escalation',
    ],
    deliverables: [
      'Notification preference matrix in Admin Settings',
      'Digest email and in-app bell notification triggers',
    ],
  },
];

export const complianceItems = [
  { id: 'c1', title: 'Handbook acknowledgement', group: 'Policy acknowledgement', cadence: 'At start of employment', due: 'Within 5 days', enabled: true },
  { id: 'c2', title: 'Workplace safety introduction', group: 'Required learning', cadence: 'At start of employment', due: 'Within 10 days', enabled: true },
  { id: 'c3', title: 'Information care guidelines', group: 'Policy acknowledgement', cadence: 'Annual', due: 'Every 12 months', enabled: true },
  { id: 'c4', title: 'Manager check-in', group: 'People process', cadence: 'At start of employment', due: 'Within 7 days', enabled: false },
];

