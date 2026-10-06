import { useState, type ReactNode } from 'react'
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Mail,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  X
} from 'lucide-react'
import { complyStore, type AuditLogEntry, type OnboardingTemplate, type TemplateTaskItem } from '../data/store'

interface ModalBaseProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'default' | 'large'
}

export function ModalBase({ isOpen, onClose, title, subtitle, children, footer, size = 'default' }: ModalBaseProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal-dialog ${size === 'large' ? 'modal-dialog--lg' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="eyebrow" style={{ marginTop: 2 }}>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// 1. Add Employee Modal
export function AddEmployeeModal({
  isOpen,
  onClose,
  templates,
  notify
}: {
  isOpen: boolean
  onClose: () => void
  templates: OnboardingTemplate[]
  notify: (msg: string) => void
}) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('Operations')
  const [manager, setManager] = useState('Jordan Patel')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [templateId, setTemplateId] = useState(templates[0]?.id || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim()) return

    complyStore.addEmployee({
      name,
      role,
      department,
      manager,
      startDate,
      templateId
    })

    notify(`Employee ${name} added with assigned onboarding checklist.`)
    onClose()
    setName('')
    setRole('')
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      subtitle="Phase 1 · Profile & Onboarding Plan Assignment"
      footer={
        <>
          <button className="action-button action-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="action-button action-button--primary" onClick={handleSubmit}>
            <UserPlus size={15} /> Create & Assign Plan
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-grid-2">
          <div className="form-row">
            <label>Full Name</label>
            <input
              required
              placeholder="e.g. Devon Vance"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Job Title</label>
            <input
              required
              placeholder="e.g. Solutions Architect"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="Operations">Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Customer Success">Customer Success</option>
              <option value="People">People</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>
          <div className="form-row">
            <label>Direct Manager</label>
            <select value={manager} onChange={e => setManager(e.target.value)}>
              <option value="Jordan Patel">Jordan Patel</option>
              <option value="Samir Mehta">Samir Mehta</option>
              <option value="Alicia Flores">Alicia Flores</option>
              <option value="Grace Kim">Grace Kim</option>
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Assign Onboarding Template</label>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.tasks.length} tasks)
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </ModalBase>
  )
}

// 2. Create Template Modal
export function CreateTemplateModal({
  isOpen,
  onClose,
  notify
}: {
  isOpen: boolean
  onClose: () => void
  notify: (msg: string) => void
}) {
  const [name, setName] = useState('')
  const [roleTarget, setRoleTarget] = useState('')
  const [department, setDepartment] = useState('Operations')
  const [owner, setOwner] = useState('People Ops')
  const [tasks, setTasks] = useState<TemplateTaskItem[]>([
    { id: '1', title: 'Complete compliance acknowledgement', description: 'Review policy', category: 'Compliance', dueOffsetDays: 3, required: true, priority: 'high' },
    { id: '2', title: 'Upload identity verification document', description: 'Gov ID scan', category: 'Documents', dueOffsetDays: 5, required: true, priority: 'high' }
  ])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('Required training')
  const [newTaskDays, setNewTaskDays] = useState(7)

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    setTasks(prev => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        description: 'Standard onboarding milestone item',
        category: newTaskCategory,
        dueOffsetDays: newTaskDays,
        required: true,
        priority: 'medium'
      }
    ])
    setNewTaskTitle('')
  }

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleSubmit = () => {
    if (!name.trim() || tasks.length === 0) return
    complyStore.createTemplate({
      name,
      roleTarget: roleTarget || 'General',
      department,
      owner,
      status: 'Published',
      tasks
    })
    notify(`Checklist template "${name}" created with ${tasks.length} milestones.`)
    onClose()
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Create Onboarding Template"
      subtitle="Phase 2 · Reusable Role Checklist Engine"
      size="large"
      footer={
        <>
          <button className="action-button action-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="action-button action-button--primary" onClick={handleSubmit} disabled={!name.trim() || tasks.length === 0}>
            <Check size={15} /> Save & Publish Template
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-grid-2">
          <div className="form-row">
            <label>Template Title</label>
            <input
              placeholder="e.g. Customer Success Specialist Onboarding"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Target Role</label>
            <input
              placeholder="e.g. Customer Success Manager"
              value={roleTarget}
              onChange={e => setRoleTarget(e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="Operations">Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Customer Success">Customer Success</option>
              <option value="People">People</option>
            </select>
          </div>
          <div className="form-row">
            <label>Template Owner</label>
            <input value={owner} onChange={e => setOwner(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
            Template Tasks ({tasks.length})
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {tasks.map(t => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  fontSize: 13
                }}
              >
                <div>
                  <strong>{t.title}</strong>
                  <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 11 }}>
                    ({t.category} · Due Day +{t.dueOffsetDays})
                  </span>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => removeTask(t.id)}
                  title="Remove"
                  style={{ color: 'var(--red)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 10,
              padding: 10,
              background: '#f1f5f9',
              borderRadius: 8
            }}
          >
            <input
              placeholder="Add task title..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)' }}
            />
            <select
              value={newTaskCategory}
              onChange={e => setNewTaskCategory(e.target.value)}
              style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)' }}
            >
              <option value="Required training">Required training</option>
              <option value="Documents">Documents</option>
              <option value="Policy review">Policy review</option>
              <option value="Compliance">Compliance</option>
              <option value="People">People</option>
            </select>
            <input
              type="number"
              title="Due offset in days"
              value={newTaskDays}
              onChange={e => setNewTaskDays(Number(e.target.value))}
              style={{ width: 60, fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)' }}
            />
            <button
              type="button"
              className="action-button action-button--primary"
              onClick={addTask}
              style={{ minHeight: 30, padding: '0 10px', fontSize: 12 }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  )
}

// 3. Add Compliance Requirement Modal
export function AddRequirementModal({
  isOpen,
  onClose,
  notify
}: {
  isOpen: boolean
  onClose: () => void
  notify: (msg: string) => void
}) {
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('All employees')
  const [cadence, setCadence] = useState<'Annual' | 'One-time' | 'Bi-annual'>('Annual')
  const [deadlineDays, setDeadlineDays] = useState(30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    complyStore.addComplianceRequirement({
      title,
      audience,
      cadence,
      deadlineDays
    })

    notify(`Compliance requirement "${title}" created.`)
    onClose()
    setTitle('')
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Add Compliance Requirement"
      subtitle="Phase 5 · Compliance Deadline & Audit Config"
      footer={
        <>
          <button className="action-button action-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="action-button action-button--primary" onClick={handleSubmit}>
            <ShieldCheck size={15} /> Save Requirement
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <label>Requirement Title</label>
          <input
            required
            placeholder="e.g. Annual Anti-Harassment & Ethics Training"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label>Target Audience</label>
            <select value={audience} onChange={e => setAudience(e.target.value)}>
              <option value="All employees">All employees</option>
              <option value="People managers">People managers</option>
              <option value="Engineering & Product">Engineering & Product</option>
              <option value="Sales & Customer Success">Sales & Customer Success</option>
            </select>
          </div>
          <div className="form-row">
            <label>Recurrence Cadence</label>
            <select value={cadence} onChange={e => setCadence(e.target.value as any)}>
              <option value="Annual">Annual</option>
              <option value="One-time">One-time</option>
              <option value="Bi-annual">Bi-annual</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <label>Deadline (days after start date or period)</label>
          <input
            type="number"
            value={deadlineDays}
            onChange={e => setDeadlineDays(Number(e.target.value))}
          />
        </div>
      </form>
    </ModalBase>
  )
}

// 4. Upload Policy Modal
export function UploadPolicyModal({
  isOpen,
  onClose,
  notify
}: {
  isOpen: boolean
  onClose: () => void
  notify: (msg: string) => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Security')
  const [version, setVersion] = useState('v1.0')
  const [pages, setPages] = useState(14)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    complyStore.uploadPolicy({
      title,
      category,
      version,
      pages
    })

    notify(`Policy document "${title}" uploaded and indexed for RAG assistant.`)
    onClose()
    setTitle('')
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Policy Document"
      subtitle="Phase 4 · Grounded RAG Knowledge Ingestion"
      footer={
        <>
          <button className="action-button action-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="action-button action-button--primary" onClick={handleSubmit}>
            <BookOpen size={15} /> Upload & Index
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <label>Policy Title</label>
          <input
            required
            placeholder="e.g. AI & Automated Tools Acceptable Use Policy"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Security">Security</option>
              <option value="People">People</option>
              <option value="Privacy">Privacy</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div className="form-row">
            <label>Version</label>
            <input value={version} onChange={e => setVersion(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <label>Page Count</label>
          <input
            type="number"
            value={pages}
            onChange={e => setPages(Number(e.target.value))}
          />
        </div>
      </form>
    </ModalBase>
  )
}

// 5. Audit Log Modal / Drawer
export function AuditLogModal({
  isOpen,
  onClose,
  auditLog
}: {
  isOpen: boolean
  onClose: () => void
  auditLog: AuditLogEntry[]
}) {
  const [filterAction, setFilterAction] = useState('all')

  const filtered = filterAction === 'all'
    ? auditLog
    : auditLog.filter(item => item.action === filterAction)

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Compliance Audit Log"
      subtitle="Section 4 · Immutable Record of All Verifiable Actions"
      size="large"
      footer={
        <button className="action-button action-button--secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          Showing <strong>{filtered.length}</strong> recorded audit events
        </span>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--line)' }}
        >
          <option value="all">All Actions</option>
          <option value="task_completed">Task Completed</option>
          <option value="document_approved">Document Approved</option>
          <option value="document_uploaded">Document Uploaded</option>
          <option value="reminder_sent">Reminder Sent</option>
          <option value="employee_created">Employee Created</option>
          <option value="template_assigned">Template Assigned</option>
        </select>
      </div>

      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entry => (
              <tr key={entry.id}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>{entry.createdAt}</td>
                <td>
                  <strong>{entry.actorName}</strong>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)' }}>
                    {entry.actorRole}
                  </span>
                </td>
                <td>
                  <span
                    className={`audit-action-tag ${
                      entry.action.includes('approved') || entry.action.includes('completed')
                        ? 'audit-action-tag--success'
                        : entry.action.includes('reminder')
                        ? 'audit-action-tag--warning'
                        : 'audit-action-tag--purple'
                    }`}
                  >
                    {entry.action}
                  </span>
                </td>
                <td style={{ maxWidth: 220 }}>{entry.targetLabel}</td>
                <td style={{ fontSize: 11, color: 'var(--muted-soft)' }}>
                  {entry.metadata ? JSON.stringify(entry.metadata) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModalBase>
  )
}

// 6. Contact HR Fallback Modal
export function ContactHRModal({
  isOpen,
  onClose,
  initialQuestion = '',
  notify
}: {
  isOpen: boolean
  onClose: () => void
  initialQuestion?: string
  notify: (msg: string) => void
}) {
  const [topic, setTopic] = useState('Benefits & Payroll Inquiry')
  const [message, setMessage] = useState(initialQuestion)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    complyStore.logAudit(
      'Maya Chen',
      'employee',
      'settings_updated',
      'hr_inquiries',
      `inq-${Date.now()}`,
      `Direct HR question: ${topic}`,
      { topic, preview: message.substring(0, 60) }
    )
    notify('Your question was sent to People Operations. Check #people-ops or email.')
    onClose()
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Contact People Operations"
      subtitle="Grounded Fallback · Connect with HR Team"
      footer={
        <>
          <button className="action-button action-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="action-button action-button--primary" onClick={handleSubmit}>
            <Send size={15} /> Send to People Ops
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <label>Inquiry Topic</label>
          <select value={topic} onChange={e => setTopic(e.target.value)}>
            <option value="Benefits & Payroll Inquiry">Benefits & Payroll</option>
            <option value="PTO / Leave Exception">PTO / Leave Exception</option>
            <option value="Equipment & Stipend Question">Equipment & Stipend</option>
            <option value="Confidential People Partner Question">Confidential Partner Inquiry</option>
          </select>
        </div>

        <div className="form-row">
          <label>Your Message</label>
          <textarea
            rows={4}
            required
            placeholder="Describe what decision you are trying to make..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
      </form>
    </ModalBase>
  )
}

// 7. Citation Detail Modal
export function CitationDetailModal({
  isOpen,
  onClose,
  citation
}: {
  isOpen: boolean
  onClose: () => void
  citation: { section: string; content: string; source: string } | null
}) {
  if (!citation) return null

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Policy Source Citation"
      subtitle="Auditable Source Verification"
      footer={
        <button className="action-button action-button--primary" onClick={onClose}>
          Understood
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: 'var(--teal-tint)',
            borderRadius: 8,
            color: 'var(--teal)',
            fontWeight: 600,
            fontSize: 13
          }}
        >
          <CheckCircle2 size={18} /> Grounded in Verified Policy Library
        </div>

        <div>
          <span className="eyebrow eyebrow--teal">{citation.source}</span>
          <h4 style={{ margin: '4px 0 8px', color: 'var(--ink)' }}>{citation.section}</h4>
          <p
            style={{
              padding: 14,
              background: '#f8fafc',
              border: '1px solid var(--line)',
              borderRadius: 8,
              lineHeight: 1.6,
              color: 'var(--ink-soft)'
            }}
          >
            “{citation.content}”
          </p>
        </div>
      </div>
    </ModalBase>
  )
}

// 8. Send Automated Reminders Modal
export function SendRemindersModal({
  isOpen,
  onClose,
  notify
}: {
  isOpen: boolean
  onClose: () => void
  notify: (msg: string) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSend = () => {
    setLoading(true)
    setTimeout(() => {
      const res = complyStore.sendComplianceReminders()
      setLoading(false)
      notify(`Sent automated reminder emails to ${res.sentCount} overdue employees.`)
      onClose()
    }, 600)
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Compliance Email Reminders"
      subtitle="Phase 5 · Resend / Email Dispatch Engine"
      footer={
        <>
          <button className="action-button action-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="action-button action-button--primary"
            onClick={handleSend}
            disabled={loading}
          >
            <Mail size={15} /> {loading ? 'Sending Reminders...' : 'Send Reminder Emails'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13, lineHeight: 1.5 }}>
          This triggers automated notification emails to all employees who have compliance tasks or onboarding items due within 5 days or already overdue.
        </p>

        <div style={{ padding: 12, background: 'var(--amber-tint)', borderRadius: 8, border: '1px solid #fed7aa' }}>
          <strong style={{ display: 'block', color: 'var(--amber)', fontSize: 13, marginBottom: 4 }}>
            3 recipients currently flagged:
          </strong>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--ink)' }}>
            <li>Noah Williams (Business Operations) · 3 overdue items</li>
            <li>Liam Osei (Engineering) · 1 overdue security item</li>
            <li>Evan Brooks (Operations) · Review due in 4 days</li>
          </ul>
        </div>
      </div>
    </ModalBase>
  )
}
