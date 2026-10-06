export type Role = 'employee' | 'manager' | 'admin'
export type TaskStatus = 'not-started' | 'in-progress' | 'pending-review' | 'completed'
export type DocumentStatus = 'uploaded' | 'pending-review' | 'approved' | 'rejected' | 'failed'

export type Task = {
  id: string
  title: string
  description: string
  category: string
  status: TaskStatus
  dueDate: string
  owner: string
  priority: 'low' | 'medium' | 'high'
}

export type TeamMember = {
  id: string
  name: string
  initials: string
  role: string
  department: string
  progress: number
  status: 'On track' | 'Needs attention' | 'Not started' | 'Complete'
  due: string
}

export type EmployeeRecord = {
  id: string
  name: string
  initials: string
  role: string
  department: string
  startDate: string
  progress: number
  status: 'On track' | 'Needs attention' | 'Complete'
  overdue: number
  manager: string
}

export type Doc = {
  id: string
  name: string
  type: string
  size: string
  updated: string
  status: DocumentStatus
  required: boolean
}

export const currentEmployee = {
  name: 'Maya Chen',
  initials: 'MC',
  title: 'Product Operations Associate',
  department: 'Operations',
  manager: 'Jordan Patel',
  startDate: 'September 9, 2026',
  plan: 'Operations onboarding · 30 days',
}

export const initialTasks: Task[] = [
  { id: 't1', title: 'Complete security awareness training', description: 'Review the annual security module and acknowledge the acceptable use policy.', category: 'Required training', status: 'completed', dueDate: 'Sep 12, 2026', owner: 'Maya Chen', priority: 'high' },
  { id: 't2', title: 'Upload proof of identity', description: 'Add a clear scan of your passport or government-issued ID for verification.', category: 'Documents', status: 'pending-review', dueDate: 'Sep 13, 2026', owner: 'Maya Chen', priority: 'high' },
  { id: 't3', title: 'Read the employee handbook', description: 'Review workplace expectations, benefits, leave and reporting channels.', category: 'Policy review', status: 'in-progress', dueDate: 'Sep 16, 2026', owner: 'Maya Chen', priority: 'medium' },
  { id: 't4', title: 'Meet with your manager', description: 'Schedule your 30-minute kickoff with Jordan to align on your first month.', category: 'People', status: 'not-started', dueDate: 'Sep 18, 2026', owner: 'Maya Chen', priority: 'medium' },
  { id: 't5', title: 'Complete data privacy acknowledgement', description: 'Confirm that you understand how company and customer data should be handled.', category: 'Compliance', status: 'not-started', dueDate: 'Sep 20, 2026', owner: 'Maya Chen', priority: 'high' },
  { id: 't6', title: 'Set up payroll and benefits', description: 'Confirm your payroll details and select benefits before the first cutoff.', category: 'People', status: 'not-started', dueDate: 'Sep 22, 2026', owner: 'Maya Chen', priority: 'medium' },
]

export const initialDocuments: Doc[] = [
  { id: 'd1', name: 'Government ID.pdf', type: 'PDF', size: '2.4 MB', updated: 'Sep 9, 2026', status: 'pending-review', required: true },
  { id: 'd2', name: 'Signed offer letter.pdf', type: 'PDF', size: '486 KB', updated: 'Sep 8, 2026', status: 'approved', required: true },
  { id: 'd3', name: 'Tax withholding form.pdf', type: 'PDF', size: '728 KB', updated: 'Sep 8, 2026', status: 'approved', required: true },
  { id: 'd4', name: 'Emergency contact form', type: 'DOCX', size: '—', updated: 'Not uploaded', status: 'uploaded', required: true },
]

export const teamMembers: TeamMember[] = [
  { id: 'm1', name: 'Maya Chen', initials: 'MC', role: 'Product Operations Associate', department: 'Operations', progress: 62, status: 'Needs attention', due: '2 items due this week' },
  { id: 'm2', name: 'Evan Brooks', initials: 'EB', role: 'Operations Coordinator', department: 'Operations', progress: 88, status: 'On track', due: 'Next review Sep 25' },
  { id: 'm3', name: 'Priya Shah', initials: 'PS', role: 'Program Manager', department: 'Operations', progress: 100, status: 'Complete', due: 'Completed Sep 11' },
  { id: 'm4', name: 'Noah Williams', initials: 'NW', role: 'Business Operations Analyst', department: 'Operations', progress: 24, status: 'Needs attention', due: '3 overdue items' },
]

export const employees: EmployeeRecord[] = [
  { id: 'm1', name: 'Maya Chen', initials: 'MC', role: 'Product Operations Associate', department: 'Operations', startDate: 'Sep 9, 2026', progress: 62, status: 'Needs attention', overdue: 0, manager: 'Jordan Patel' },
  { id: 'm2', name: 'Evan Brooks', initials: 'EB', role: 'Operations Coordinator', department: 'Operations', startDate: 'Sep 1, 2026', progress: 88, status: 'On track', overdue: 0, manager: 'Jordan Patel' },
  { id: 'm3', name: 'Priya Shah', initials: 'PS', role: 'Program Manager', department: 'Operations', startDate: 'Aug 19, 2026', progress: 100, status: 'Complete', overdue: 0, manager: 'Jordan Patel' },
  { id: 'm4', name: 'Noah Williams', initials: 'NW', role: 'Business Operations Analyst', department: 'Operations', startDate: 'Aug 26, 2026', progress: 24, status: 'Needs attention', overdue: 3, manager: 'Jordan Patel' },
  { id: 'm5', name: 'Sofia Martinez', initials: 'SM', role: 'Customer Success Manager', department: 'Customer Success', startDate: 'Sep 5, 2026', progress: 74, status: 'On track', overdue: 0, manager: 'Alicia Flores' },
  { id: 'm6', name: 'Liam Osei', initials: 'LO', role: 'Software Engineer', department: 'Engineering', startDate: 'Aug 29, 2026', progress: 48, status: 'Needs attention', overdue: 1, manager: 'Samir Mehta' },
  { id: 'm7', name: 'Grace Kim', initials: 'GK', role: 'People Partner', department: 'People', startDate: 'Aug 12, 2026', progress: 100, status: 'Complete', overdue: 0, manager: 'Alicia Flores' },
]

export const policies = [
  { id: 'p1', title: 'Employee Handbook', version: 'v4.2', pages: 42, updated: 'Sep 7, 2026', owner: 'People Ops', status: 'Published', category: 'People' },
  { id: 'p2', title: 'Information Security Policy', version: 'v3.8', pages: 18, updated: 'Aug 30, 2026', owner: 'Security', status: 'Published', category: 'Security' },
  { id: 'p3', title: 'Data Privacy Standard', version: 'v2.1', pages: 26, updated: 'Aug 22, 2026', owner: 'Legal', status: 'Published', category: 'Privacy' },
  { id: 'p4', title: 'Remote Work Guidelines', version: 'v1.5', pages: 9, updated: 'Jul 18, 2026', owner: 'People Ops', status: 'Draft', category: 'People' },
]

export const complianceRequirements = [
  { id: 'c1', title: 'Security awareness', audience: 'All employees', cadence: 'Annual', deadline: '30 days after start', completion: 94, status: 'Healthy' },
  { id: 'c2', title: 'Data privacy acknowledgement', audience: 'All employees', cadence: 'Annual', deadline: '30 days after start', completion: 88, status: 'Healthy' },
  { id: 'c3', title: 'Manager conduct training', audience: 'People managers', cadence: 'Annual', deadline: '60 days after start', completion: 72, status: 'Needs attention' },
  { id: 'c4', title: 'Emergency contact form', audience: 'All employees', cadence: 'One-time', deadline: '14 days after start', completion: 79, status: 'Needs attention' },
]

export const activity = [
  { id: 'a1', text: 'Sofia Martinez completed her onboarding plan', time: '12 min ago', tone: 'success' },
  { id: 'a2', text: 'Noah Williams has 3 overdue compliance items', time: '38 min ago', tone: 'warning' },
  { id: 'a3', text: 'Information Security Policy v3.8 published', time: '2 hrs ago', tone: 'neutral' },
  { id: 'a4', text: 'Maya Chen uploaded Government ID.pdf', time: 'Yesterday', tone: 'info' },
]

export const chatSeed = [
  { id: 'q1', role: 'user' as const, text: 'How do I report a suspected security incident?' },
  { id: 'a1', role: 'assistant' as const, text: 'Report it immediately through the Security Help Desk form or email security@northstar.example. Include what happened, when you noticed it, and any affected systems. Do not investigate or delete evidence yourself.', citation: 'Information Security Policy · §4.2 Incident reporting' },
]
