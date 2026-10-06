import {
  initialTasks,
  initialDocuments,
  teamMembers,
  employees as initialEmployees,
  policies as initialPolicies,
  complianceRequirements as initialRequirements,
  activity as initialActivity,
  chatSeed,
  type Task,
  type Doc,
  type TeamMember,
  type EmployeeRecord,
  type Role,
  type TaskStatus,
  type DocumentStatus,
} from './mockData'
import { policyKnowledgeBase, type PolicyChunk } from './policyChunks'

export interface AuditLogEntry {
  id: string
  actorName: string
  actorRole: string
  action: 'task_completed' | 'task_updated' | 'task_created' | 'task_date_updated' | 'document_uploaded' | 'document_approved' | 'document_rejected' | 'policy_uploaded' | 'reminder_sent' | 'template_created' | 'template_assigned' | 'employee_created' | 'report_exported' | 'settings_updated'
  targetTable: string
  targetId: string
  targetLabel: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface TemplateTaskItem {
  id: string
  title: string
  description: string
  category: string
  dueOffsetDays: number
  required: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface OnboardingTemplate {
  id: string
  name: string
  roleTarget: string
  department: string
  owner: string
  tasks: TemplateTaskItem[]
  assignedCount: number
  status: 'Published' | 'Draft'
  createdAt: string
}

export interface ComplianceReqItem {
  id: string
  title: string
  audience: string
  cadence: string
  deadline: string
  deadlineDays: number
  completion: number
  status: 'Healthy' | 'Needs attention' | string
  linkedPolicyId?: string
}

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant'
  text: string
  citation?: string
  citationSection?: string
  citationContent?: string
  fallback?: boolean
  timestamp?: string
}

const INITIAL_TEMPLATES: OnboardingTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Operations Onboarding (30 Days)',
    roleTarget: 'Product Operations Associate',
    department: 'Operations',
    owner: 'People Ops',
    assignedCount: 38,
    status: 'Published',
    createdAt: 'Aug 15, 2026',
    tasks: [
      { id: 'tt1', title: 'Complete security awareness training', description: 'Review the annual security module and acknowledge the acceptable use policy.', category: 'Required training', dueOffsetOffset: 3, dueOffsetDays: 3, required: true, priority: 'high' } as any,
      { id: 'tt2', title: 'Upload proof of identity', description: 'Add a clear scan of your passport or government-issued ID for verification.', category: 'Documents', dueOffsetOffset: 4, dueOffsetDays: 4, required: true, priority: 'high' } as any,
      { id: 'tt3', title: 'Read the employee handbook', description: 'Review workplace expectations, benefits, leave and reporting channels.', category: 'Policy review', dueOffsetOffset: 7, dueOffsetDays: 7, required: true, priority: 'medium' } as any,
      { id: 'tt4', title: 'Meet with your manager', description: 'Schedule your 30-minute kickoff with Jordan to align on your first month.', category: 'People', dueOffsetOffset: 9, dueOffsetDays: 9, required: false, priority: 'medium' } as any,
      { id: 'tt5', title: 'Complete data privacy acknowledgement', description: 'Confirm that you understand how company and customer data should be handled.', category: 'Compliance', dueOffsetOffset: 11, dueOffsetDays: 11, required: true, priority: 'high' } as any,
      { id: 'tt6', title: 'Set up payroll and benefits', description: 'Confirm your payroll details and select benefits before the first cutoff.', category: 'People', dueOffsetOffset: 14, dueOffsetDays: 14, required: true, priority: 'medium' } as any,
    ]
  },
  {
    id: 'tmpl-2',
    name: 'Engineering Onboarding',
    roleTarget: 'Software Engineer',
    department: 'Engineering',
    owner: 'People Ops & Tech Leads',
    assignedCount: 24,
    status: 'Published',
    createdAt: 'Aug 18, 2026',
    tasks: [
      { id: 'te1', title: 'Complete code security & secret management training', description: 'Learn safe git practices and credentials scanning standards.', category: 'Security', dueOffsetDays: 2, required: true, priority: 'high' },
      { id: 'te2', title: 'Upload signed I-9 & identity proof', description: 'Upload official identification for verification.', category: 'Documents', dueOffsetDays: 3, required: true, priority: 'high' },
      { id: 'te3', title: 'Local development environment setup', description: 'Follow the repository onboarding guide and run test suite.', category: 'Engineering', dueOffsetDays: 5, required: true, priority: 'medium' },
      { id: 'te4', title: 'Deploy first pull request to staging', description: 'Pair with your mentor to ship a starter improvement.', category: 'Engineering', dueOffsetDays: 10, required: false, priority: 'medium' }
    ]
  },
  {
    id: 'tmpl-3',
    name: 'Manager Essentials',
    roleTarget: 'People Manager',
    department: 'Leadership',
    owner: 'Leadership & People Ops',
    assignedCount: 17,
    status: 'Draft',
    createdAt: 'Sep 01, 2026',
    tasks: [
      { id: 'tm1', title: 'Complete Manager Conduct & Fair Employment Training', description: 'Mandatory annual module on compliant feedback and evaluation.', category: 'Compliance', dueOffsetDays: 14, required: true, priority: 'high' },
      { id: 'tm2', title: 'Review 1:1 onboarding cadence guide', description: 'Understand weekly check-in expectations for first 90 days.', category: 'Management', dueOffsetDays: 7, required: true, priority: 'medium' }
    ]
  }
]

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'aud-1',
    actorName: 'Grace Kim',
    actorRole: 'hr_admin',
    action: 'document_approved',
    targetTable: 'documents',
    targetId: 'd2',
    targetLabel: 'Signed offer letter.pdf (Maya Chen)',
    metadata: { previousStatus: 'pending-review', newStatus: 'approved' },
    createdAt: 'Sep 8, 2026 · 14:05'
  },
  {
    id: 'aud-2',
    actorName: 'System',
    actorRole: 'system',
    action: 'template_assigned',
    targetTable: 'employee_tasks',
    targetId: 'm1',
    targetLabel: 'Operations Onboarding (30 Days) -> Maya Chen',
    metadata: { tasksGenerated: 6 },
    createdAt: 'Sep 8, 2026 · 13:58'
  },
  {
    id: 'aud-3',
    actorName: 'Maya Chen',
    actorRole: 'employee',
    action: 'document_uploaded',
    targetTable: 'documents',
    targetId: 'd1',
    targetLabel: 'Government ID.pdf',
    metadata: { fileSize: '2.4 MB' },
    createdAt: 'Sep 9, 2026 · 09:42'
  },
  {
    id: 'aud-4',
    actorName: 'Maya Chen',
    actorRole: 'employee',
    action: 'task_completed',
    targetTable: 'employee_tasks',
    targetId: 't1',
    targetLabel: 'Complete security awareness training',
    metadata: { score: 100 },
    createdAt: 'Sep 12, 2026 · 16:30'
  }
]

export class ComplyStore {
  private static STORAGE_KEY = 'complypilot_v1_store'

  tasks: Task[] = initialTasks
  documents: Doc[] = initialDocuments
  employees: EmployeeRecord[] = initialEmployees
  teamMembers: TeamMember[] = teamMembers
  policies = initialPolicies
  complianceRequirements: ComplianceReqItem[] = initialRequirements.map(r => ({ ...r, deadlineDays: 30 }))
  templates: OnboardingTemplate[] = INITIAL_TEMPLATES
  auditLog: AuditLogEntry[] = INITIAL_AUDIT_LOG
  chatMessages: ChatMessageItem[] = chatSeed

  private listeners: (() => void)[] = []

  constructor() {
    this.load()
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.save()
    this.listeners.forEach(fn => fn())
  }

  private save() {
    try {
      const data = {
        tasks: this.tasks,
        documents: this.documents,
        employees: this.employees,
        teamMembers: this.teamMembers,
        policies: this.policies,
        complianceRequirements: this.complianceRequirements,
        templates: this.templates,
        auditLog: this.auditLog,
        chatMessages: this.chatMessages,
      }
      localStorage.setItem(ComplyStore.STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Storage save error:', e)
    }
  }

  private load() {
    try {
      const saved = localStorage.getItem(ComplyStore.STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.tasks) this.tasks = parsed.tasks
        if (parsed.documents) this.documents = parsed.documents
        if (parsed.employees) this.employees = parsed.employees
        if (parsed.teamMembers) this.teamMembers = parsed.teamMembers
        if (parsed.policies) this.policies = parsed.policies
        if (parsed.complianceRequirements) this.complianceRequirements = parsed.complianceRequirements
        if (parsed.templates) this.templates = parsed.templates
        if (parsed.auditLog) this.auditLog = parsed.auditLog
        if (parsed.chatMessages) this.chatMessages = parsed.chatMessages
      }
    } catch (e) {
      console.warn('Storage load error:', e)
    }
  }

  resetAll() {
    this.tasks = [...initialTasks]
    this.documents = [...initialDocuments]
    this.employees = [...initialEmployees]
    this.teamMembers = [...teamMembers]
    this.policies = [...initialPolicies]
    this.complianceRequirements = initialRequirements.map(r => ({ ...r, deadlineDays: 30 }))
    this.templates = [...INITIAL_TEMPLATES]
    this.auditLog = [...INITIAL_AUDIT_LOG]
    this.chatMessages = [...chatSeed]
    this.notify()
  }

  // --- Actions ---

  logAudit(actorName: string, actorRole: string, action: AuditLogEntry['action'], targetTable: string, targetId: string, targetLabel: string, metadata?: Record<string, any>) {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorName,
      actorRole,
      action,
      targetTable,
      targetId,
      targetLabel,
      metadata,
      createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
    this.auditLog = [entry, ...this.auditLog]
    this.notify()
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus, actor: string = 'Maya Chen', role: string = 'employee') {
    this.tasks = this.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus }
      }
      return t
    })

    // Recalculate employee completion
    const completedCount = this.tasks.filter(t => t.status === 'completed').length
    const progress = Math.round((completedCount / this.tasks.length) * 100)
    this.employees = this.employees.map(e => {
      if (e.id === 'm1') {
        return {
          ...e,
          progress,
          status: progress === 100 ? 'Complete' : progress > 50 ? 'On track' : 'Needs attention'
        }
      }
      return e
    })
    this.teamMembers = this.teamMembers.map(m => {
      if (m.id === 'm1') {
        return {
          ...m,
          progress,
          status: progress === 100 ? 'Complete' : progress > 50 ? 'On track' : 'Needs attention'
        }
      }
      return m
    })

    const target = this.tasks.find(t => t.id === taskId)
    this.logAudit(
      actor,
      role,
      newStatus === 'completed' ? 'task_completed' : 'task_updated',
      'employee_tasks',
      taskId,
      target?.title || taskId,
      { newStatus }
    )
  }

  updateTaskDueDate(taskId: string, newDueDate: string, actor: string = 'Maya Chen', role: string = 'employee') {
    this.tasks = this.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, dueDate: newDueDate }
      }
      return t
    })

    const target = this.tasks.find(t => t.id === taskId)
    this.logAudit(
      actor,
      role,
      'task_date_updated',
      'employee_tasks',
      taskId,
      target?.title || taskId,
      { newDueDate }
    )
    this.notify()
  }

  addTask(task: Omit<Task, 'id'>, actor: string = 'Maya Chen', role: string = 'employee') {
    const newTask: Task = {
      ...task,
      id: `t-${Date.now()}`
    }
    this.tasks = [newTask, ...this.tasks]

    // Recalculate employee completion
    const completedCount = this.tasks.filter(t => t.status === 'completed').length
    const progress = Math.round((completedCount / this.tasks.length) * 100)
    this.employees = this.employees.map(e => {
      if (e.id === 'm1') {
        return {
          ...e,
          progress,
          status: progress === 100 ? 'Complete' : progress > 50 ? 'On track' : 'Needs attention'
        }
      }
      return e
    })
    this.teamMembers = this.teamMembers.map(m => {
      if (m.id === 'm1') {
        return {
          ...m,
          progress,
          status: progress === 100 ? 'Complete' : progress > 50 ? 'On track' : 'Needs attention'
        }
      }
      return m
    })

    this.logAudit(
      actor,
      role,
      'task_created',
      'employee_tasks',
      newTask.id,
      newTask.title,
      { category: newTask.category, dueDate: newTask.dueDate, priority: newTask.priority, owner: newTask.owner }
    )
    this.notify()
    return newTask
  }

  uploadDocument(file: File, linkedTaskId?: string, actor: string = 'Maya Chen') {
    const newDoc: Doc = {
      id: `d-${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      updated: 'Just now',
      status: 'pending-review',
      required: true
    }

    this.documents = [newDoc, ...this.documents]

    // If linked to a task, update task status to pending-review
    if (linkedTaskId) {
      this.updateTaskStatus(linkedTaskId, 'pending-review', actor, 'employee')
    } else {
      // Find matching task if any
      const matchingTask = this.tasks.find(t =>
        t.category === 'Documents' && t.status !== 'completed'
      )
      if (matchingTask) {
        this.updateTaskStatus(matchingTask.id, 'pending-review', actor, 'employee')
      }
    }

    this.logAudit(
      actor,
      'employee',
      'document_uploaded',
      'documents',
      newDoc.id,
      newDoc.name,
      { size: newDoc.size, type: newDoc.type }
    )

    return newDoc
  }

  reviewDocument(docId: string, status: 'approved' | 'rejected', reviewer: string = 'Grace Kim') {
    const doc = this.documents.find(d => d.id === docId)
    if (!doc) return

    this.documents = this.documents.map(d => d.id === docId ? { ...d, status, updated: 'Just now' } : d)

    // If approved, check if there is an uncompleted document task for Maya
    if (status === 'approved') {
      const docTask = this.tasks.find(t => t.category === 'Documents' && (t.status === 'pending-review' || t.status === 'in-progress' || t.status === 'not-started'))
      if (docTask) {
        this.updateTaskStatus(docTask.id, 'completed', reviewer, 'hr_admin')
      }
    }

    this.logAudit(
      reviewer,
      'hr_admin',
      status === 'approved' ? 'document_approved' : 'document_rejected',
      'documents',
      docId,
      doc.name,
      { previousStatus: doc.status, newStatus: status }
    )
  }

  addEmployee(employee: { name: string; role: string; department: string; manager: string; startDate: string; templateId: string }) {
    const initials = employee.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'CP'

    const newEmp: EmployeeRecord = {
      id: `emp-${Date.now()}`,
      name: employee.name,
      initials,
      role: employee.role,
      department: employee.department,
      startDate: employee.startDate || 'Oct 1, 2026',
      progress: 0,
      status: 'Needs attention',
      overdue: 0,
      manager: employee.manager || 'Jordan Patel'
    }

    this.employees = [newEmp, ...this.employees]

    // Increment template assigned count
    if (employee.templateId) {
      this.templates = this.templates.map(t => t.id === employee.templateId ? { ...t, assignedCount: t.assignedCount + 1 } : t)
    }

    this.logAudit(
      'Grace Kim',
      'hr_admin',
      'employee_created',
      'profiles',
      newEmp.id,
      `${newEmp.name} (${newEmp.role})`,
      { department: newEmp.department, templateId: employee.templateId }
    )

    return newEmp
  }

  createTemplate(template: Omit<OnboardingTemplate, 'id' | 'createdAt' | 'assignedCount'>) {
    const newTmpl: OnboardingTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedCount: 0
    }
    this.templates = [newTmpl, ...this.templates]

    this.logAudit(
      'Grace Kim',
      'hr_admin',
      'template_created',
      'onboarding_templates',
      newTmpl.id,
      newTmpl.name,
      { taskCount: newTmpl.tasks.length }
    )

    return newTmpl
  }

  addComplianceRequirement(req: { title: string; audience: string; cadence: ComplianceReqItem['cadence']; deadlineDays: number; linkedPolicyId?: string }) {
    const newReq: ComplianceReqItem = {
      id: `c-${Date.now()}`,
      title: req.title,
      audience: req.audience,
      cadence: req.cadence,
      deadline: `${req.deadlineDays} days after start`,
      deadlineDays: req.deadlineDays,
      completion: 0,
      status: 'Needs attention',
      linkedPolicyId: req.linkedPolicyId
    }

    this.complianceRequirements = [newReq, ...this.complianceRequirements]

    this.logAudit(
      'Grace Kim',
      'hr_admin',
      'settings_updated',
      'compliance_requirements',
      newReq.id,
      newReq.title,
      { audience: req.audience, cadence: req.cadence }
    )

    return newReq
  }

  sendComplianceReminders(audience: string = 'All overdue employees'): { sentCount: number; recipients: string[] } {
    const recipients = ['Noah Williams', 'Liam Osei', 'Evan Brooks']
    const sentCount = recipients.length

    this.logAudit(
      'Grace Kim',
      'hr_admin',
      'reminder_sent',
      'compliance_records',
      'bulk-reminders',
      `Sent ${sentCount} automated reminder emails`,
      { recipients, audience }
    )

    return { sentCount, recipients }
  }

  uploadPolicy(policy: { title: string; category: string; version: string; pages: number; content?: string }) {
    const newPolicy = {
      id: `p-${Date.now()}`,
      title: policy.title,
      version: policy.version || 'v1.0',
      pages: policy.pages || 12,
      updated: 'Just now',
      owner: 'Grace Kim',
      status: 'Published',
      category: policy.category || 'Compliance'
    }

    this.policies = [newPolicy, ...this.policies]

    this.logAudit(
      'Grace Kim',
      'hr_admin',
      'policy_uploaded',
      'policies',
      newPolicy.id,
      `${newPolicy.title} (${newPolicy.version})`,
      { pages: newPolicy.pages, category: newPolicy.category }
    )

    return newPolicy
  }

  // --- RAG Policy Assistant Engine ---
  askPolicyQuestion(question: string): Promise<ChatMessageItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const q = question.toLowerCase().trim()

        // Test for ungrounded queries
        const isUngrounded = /salary|bonus|negotiat|stock option|raise|medical claim|health insurance cost|loan|personal loan|allowance exception|unapproved|unlisted/.test(q)

        if (isUngrounded) {
          resolve({
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: 'I’m not certain this question is covered by the policies I can access. People Ops can give you the right answer — send them a note and mention what decision you’re trying to make.',
            fallback: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          return
        }

        // Rank chunks by keyword overlap & score
        let bestChunk: PolicyChunk | null = null
        let bestScore = 0

        for (const chunk of policyKnowledgeBase) {
          let score = 0
          for (const kw of chunk.keywords) {
            if (q.includes(kw)) score += 3
          }
          const words = q.split(/\s+/)
          for (const w of words) {
            if (w.length > 3 && chunk.content.toLowerCase().includes(w)) {
              score += 1
            }
          }
          if (score > bestScore) {
            bestScore = score
            bestChunk = chunk
          }
        }

        if (!bestChunk || bestScore < 2) {
          resolve({
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: 'I could not find an exact policy match in our indexed knowledge base. For questions regarding unique policies or individual arrangements, please connect directly with People Operations.',
            fallback: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          return
        }

        // Synthesize grounded response
        resolve({
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: bestChunk.content,
          citation: `${bestChunk.policyTitle} · ${bestChunk.sectionRef}`,
          citationSection: bestChunk.sectionRef,
          citationContent: bestChunk.content,
          fallback: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }, 750)
    })
  }
}

export const complyStore = new ComplyStore()
