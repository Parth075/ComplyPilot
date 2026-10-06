export interface PolicyChunk {
  id: string
  policyId: string
  policyTitle: string
  sectionRef: string
  content: string
  keywords: string[]
}

export const policyKnowledgeBase: PolicyChunk[] = [
  {
    id: 'pc1',
    policyId: 'p1',
    policyTitle: 'Employee Handbook',
    sectionRef: '§2.6 Where to get help & reporting channels',
    content: 'For onboarding, benefits, or general workplace inquiries, reach out to People Operations via Slack #people-ops or email peopleops@northstar.example. If an inquiry involves confidential personnel issues, contact your HR Business Partner directly.',
    keywords: ['help', 'contact', 'people ops', 'support', 'channel', 'reach', 'who to ask', 'questions']
  },
  {
    id: 'pc2',
    policyId: 'p1',
    policyTitle: 'Employee Handbook',
    sectionRef: '§3.1 Working hours & flexible arrangements',
    content: 'Northstar operates on core collaboration hours between 10:00 AM and 3:00 PM in your local timezone. Flexible schedules can be coordinated with your direct manager provided team deliverables and customer coverage are maintained.',
    keywords: ['hours', 'working hours', 'schedule', 'flexible', 'core hours', 'time']
  },
  {
    id: 'pc3',
    policyId: 'p1',
    policyTitle: 'Employee Handbook',
    sectionRef: '§3.4 Paid time off (PTO) & leave policy',
    content: 'Full-time employees receive 20 days of paid vacation per calendar year, accrued monthly, plus 10 paid public holidays and 5 dedicated wellness/sick days. Sick leave does not require advance notice but must be logged in the HR portal by 10:00 AM on the day of absence.',
    keywords: ['pto', 'vacation', 'sick', 'leave', 'holiday', 'holidays', 'days off', 'wellness', 'time off']
  },
  {
    id: 'pc4',
    policyId: 'p2',
    policyTitle: 'Information Security Policy',
    sectionRef: '§4.2 Incident reporting & suspicious activity',
    content: 'Report any suspected security incident immediately through the Security Help Desk portal or by emailing security@northstar.example. Include what occurred, when it was noticed, and any devices or accounts affected. Do not attempt to investigate, alter, or delete logs or files yourself.',
    keywords: ['security', 'incident', 'breach', 'phishing', 'compromise', 'hack', 'suspicious', 'report', 'lost device', 'laptop']
  },
  {
    id: 'pc5',
    policyId: 'p2',
    policyTitle: 'Information Security Policy',
    sectionRef: '§5.1 Password hygiene & multi-factor authentication (MFA)',
    content: 'All corporate accounts require Multi-Factor Authentication (MFA) via an approved authenticator app (e.g. 1Password or Google Authenticator). SMS-based 2FA is prohibited. Master passwords must be at least 16 characters and never reused across personal and corporate platforms.',
    keywords: ['password', 'mfa', '2fa', 'authentication', 'login', 'credentials', '1password']
  },
  {
    id: 'pc6',
    policyId: 'p3',
    policyTitle: 'Data Privacy Standard',
    sectionRef: '§2.3 Customer & employee data classification',
    content: 'Data is classified into Public, Internal, Confidential, and Restricted. Personally Identifiable Information (PII) such as government IDs, payroll accounts, and health notes are strictly Restricted. Employee onboarding files are stored in encrypted object buckets accessible solely by credentialed People Ops reviewers.',
    keywords: ['privacy', 'data', 'pii', 'documents', 'access', 'confidential', 'gdpr', 'who can see', 'storage', 'retention']
  },
  {
    id: 'pc7',
    policyId: 'p3',
    policyTitle: 'Data Privacy Standard',
    sectionRef: '§6.1 Device security & local data storage',
    content: 'Customer and employee data must never be downloaded to unmanaged personal devices or external USB flash drives. All laptops must enforce FileVault / BitLocker disk encryption and automatic screen lock after 5 minutes of inactivity.',
    keywords: ['device', 'usb', 'download', 'encryption', 'bitlocker', 'filevault', 'screen lock']
  },
  {
    id: 'pc8',
    policyId: 'p4',
    policyTitle: 'Remote Work Guidelines',
    sectionRef: '§2.1 Home office stipend & equipment',
    content: 'New hires are eligible for a one-time $750 home office equipment reimbursement during their first 60 days to cover monitors, ergonomic chairs, or peripherals. Submit receipts through the expense management portal under "Home Office Setup".',
    keywords: ['remote', 'home office', 'stipend', 'equipment', 'reimbursement', 'monitor', 'chair', 'expenses', 'wfh']
  },
  {
    id: 'pc9',
    policyId: 'p4',
    policyTitle: 'Remote Work Guidelines',
    sectionRef: '§4.5 Expense reimbursement cadence',
    content: 'Routine monthly internet allowances ($60/month) must be submitted by the 25th of each month for inclusion in that month’s payroll cycle. Late submissions are processed with the subsequent month’s pay run.',
    keywords: ['internet', 'allowance', 'expenses', 'reimbursement', 'stipend', 'monthly']
  }
]
