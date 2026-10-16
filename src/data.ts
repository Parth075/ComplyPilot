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

export const navEmployee = [
  { label: 'Overview', to: '/app/dashboard', icon: 'overview' },
  { label: 'My tasks', to: '/app/tasks', icon: 'tasks' },
  { label: 'Documents', to: '/app/documents', icon: 'documents' },
  { label: 'Ask a question', to: '/app/ask', icon: 'ask' },
  { label: 'My profile', to: '/app/profile', icon: 'profile' },
] as const;

export const navManager = [...navEmployee.slice(0, 4), { label: 'My team', to: '/app/team', icon: 'team' }, navEmployee[4]] as const;

export const navAdmin = [
  { label: 'Overview', to: '/admin/dashboard', icon: 'overview' },
  { label: 'Employees', to: '/admin/employees', icon: 'team' },
  { label: 'Templates', to: '/admin/templates', icon: 'templates' },
  { label: 'Policies', to: '/admin/policies', icon: 'documents' },
  { label: 'Compliance', to: '/admin/compliance', icon: 'compliance' },
  { label: 'Reports', to: '/admin/reports', icon: 'reports' },
  { label: 'Settings', to: '/admin/settings', icon: 'settings' },
] as const;

export const initialTasks: Task[] = [
  { id: 't1', title: 'Complete your personal profile', category: 'Getting started', due: 'Completed Oct 5', status: 'completed', description: 'Add your contact details and preferred name so your team can get to know you.' },
  { id: 't2', title: 'Read the employee handbook', category: 'Policies', due: 'Completed Oct 6', status: 'completed', description: 'Review the handbook and acknowledge that you have read the key workplace policies.' },
  { id: 't3', title: 'Set up payroll details', category: 'Payroll', due: 'Due today', status: 'in-progress', description: 'Add your payment preference in the payroll setup form.' },
  { id: 't4', title: 'Upload your identity document', category: 'Documents', due: 'Submitted Oct 6', status: 'pending-review', description: 'Your document is with HR for review. You will see an update here.' },
  { id: 't5', title: 'Choose your benefits', category: 'Benefits', due: 'Due Fri, Oct 9', status: 'not-started', description: 'Compare the available plans and submit your benefits selection.' },
  { id: 't6', title: 'Acknowledge the code of conduct', category: 'Policies', due: 'Due Fri, Oct 9', status: 'not-started', description: 'Read the code of conduct and record your acknowledgement.' },
  { id: 't7', title: 'Complete security awareness', category: 'Learning', due: 'Due Mon, Oct 12', status: 'not-started', description: 'A short introduction to keeping company information secure.' },
  { id: 't8', title: 'Meet with your manager', category: 'People', due: 'Completed Oct 6', status: 'completed', description: 'Schedule a first-week conversation with your manager.' },
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

export const onboardingTemplates = [
  { id: 'tpl1', name: 'New employee · Core plan', group: 'All teams', tasks: 8, status: 'Active', updated: 'Sep 18, 2026' },
  { id: 'tpl2', name: 'People manager · First 30 days', group: 'Managers', tasks: 12, status: 'Active', updated: 'Sep 12, 2026' },
  { id: 'tpl3', name: 'Remote team · Core plan', group: 'Remote employees', tasks: 9, status: 'Draft', updated: 'Oct 2, 2026' },
];

export const complianceItems = [
  { id: 'c1', title: 'Handbook acknowledgement', group: 'Policy acknowledgement', cadence: 'At start of employment', due: 'Within 5 days', enabled: true },
  { id: 'c2', title: 'Workplace safety introduction', group: 'Required learning', cadence: 'At start of employment', due: 'Within 10 days', enabled: true },
  { id: 'c3', title: 'Information care guidelines', group: 'Policy acknowledgement', cadence: 'Annual', due: 'Every 12 months', enabled: true },
  { id: 'c4', title: 'Manager check-in', group: 'People process', cadence: 'At start of employment', due: 'Within 7 days', enabled: false },
];
