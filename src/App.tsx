import { useEffect, useState, type ButtonHTMLAttributes, type FormEvent, type ReactNode } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Download,
  FileCheck2,
  FilePlus2,
  FileText,
  Filter,
  FolderOpen,
  Headphones,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  UploadCloud,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  currentEmployee,
  type Doc,
  type DocumentStatus,
  type EmployeeRecord,
  type Role,
  type Task,
  type TaskStatus,
} from './data/mockData'
import {
  complyStore,
  type AuditLogEntry,
  type ChatMessageItem,
  type ComplianceReqItem,
  type OnboardingTemplate,
} from './data/store'
import {
  BrandMark,
  EmptyState,
  IconLink,
  ProgressBar,
  RolePill,
  SectionHeading,
  SkeletonRows,
  StatCard,
  StatusBadge,
} from './components/ui'
import {
  AddEmployeeModal,
  AddRequirementModal,
  AddTaskModal,
  AuditLogModal,
  CitationDetailModal,
  ContactHRModal,
  CreateTemplateModal,
  SendRemindersModal,
  UploadPolicyModal,
} from './components/modals'

type NavItem = { path: string; label: string; icon: ReactNode }

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
  icon?: ReactNode
}

function ActionButton({ children, variant = 'primary', icon, className = '', ...props }: ButtonProps) {
  return (
    <button className={`action-button action-button--${variant} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  )
}

function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname || '/')
  useEffect(() => {
    const update = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  const navigate = (nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  return [path, navigate] as const
}

function getNavItems(role: Role): NavItem[] {
  if (role === 'admin') {
    return [
      { path: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard size={17} /> },
      { path: '/admin/employees', label: 'Employees', icon: <Users size={17} /> },
      { path: '/admin/templates', label: 'Templates', icon: <ClipboardList size={17} /> },
      { path: '/admin/policies', label: 'Policies', icon: <BookOpen size={17} /> },
      { path: '/admin/compliance', label: 'Compliance', icon: <ShieldCheck size={17} /> },
      { path: '/admin/reports', label: 'Reports', icon: <BarChart3 size={17} /> },
      { path: '/admin/settings', label: 'Settings', icon: <Settings size={17} /> },
    ]
  }
  const items: NavItem[] = [
    { path: '/app/dashboard', label: 'My dashboard', icon: <LayoutDashboard size={17} /> },
    { path: '/app/tasks', label: 'My tasks', icon: <ListChecks size={17} /> },
    { path: '/app/documents', label: 'Documents', icon: <FolderOpen size={17} /> },
    { path: '/app/ask', label: 'Ask policy', icon: <MessageCircle size={17} /> },
    { path: '/app/profile', label: 'My profile', icon: <BriefcaseBusiness size={17} /> },
  ]
  if (role === 'manager') {
    items.splice(4, 0, { path: '/app/team', label: 'My team', icon: <Users size={17} /> })
  }
  return items
}

function pageTitle(path: string) {
  const titles: Record<string, string> = {
    '/app/dashboard': 'My dashboard',
    '/app/tasks': 'My tasks',
    '/app/documents': 'Documents',
    '/app/ask': 'Ask policy',
    '/app/profile': 'My profile',
    '/app/team': 'My team',
    '/admin/dashboard': 'Overview',
    '/admin/employees': 'Employees',
    '/admin/templates': 'Templates',
    '/admin/policies': 'Policies',
    '/admin/compliance': 'Compliance',
    '/admin/reports': 'Reports',
    '/admin/settings': 'Settings',
  }
  return titles[path] ?? (path.startsWith('/admin/employees/') ? 'Employee detail' : 'Workspace')
}

export function App() {
  const [path, navigate] = useRoute()
  const [role, setRole] = useState<Role>(() => (path.startsWith('/admin') ? 'admin' : path === '/app/team' ? 'manager' : 'employee'))
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEmptyPlan, setShowEmptyPlan] = useState(false)
  const [showPolicyEmpty, setShowPolicyEmpty] = useState(false)

  // Modals state
  const [modalOpen, setModalOpen] = useState<'add-employee' | 'create-template' | 'add-requirement' | 'upload-policy' | 'audit-log' | 'contact-hr' | 'send-reminders' | 'add-task' | null>(null)
  const [addTaskOwner, setAddTaskOwner] = useState<string>('Maya Chen')
  const [citationModalData, setCitationModalData] = useState<{ section: string; content: string; source: string } | null>(null)
  const [contactHrQuestion, setContactHrQuestion] = useState('')

  // Subscribe to ComplyStore
  const [, setTick] = useState(0)
  useEffect(() => {
    return complyStore.subscribe(() => setTick(t => t + 1))
  }, [])

  useEffect(() => {
    if (path.startsWith('/admin')) setRole('admin')
  }, [path])

  const activeRole: Role = path.startsWith('/admin') ? 'admin' : path === '/app/team' ? 'manager' : role

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3600)
  }

  const refresh = () => {
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      notify('Workspace data refreshed.')
    }, 600)
  }

  const changeRole = (nextRole: Role) => {
    setRole(nextRole)
    navigate(nextRole === 'admin' ? '/admin/dashboard' : '/app/dashboard')
  }

  const publicPage = path === '/' || path === '/login' || path === '/signup'
  if (publicPage) {
    return (
      <PublicShell onNavigate={navigate}>
        <PublicPage path={path} onNavigate={navigate} />
      </PublicShell>
    )
  }

  const content = (() => {
    if (path === '/app/dashboard') {
      return (
        <DashboardPage
          tasks={complyStore.tasks}
          onStatusChange={(id, status) => {
            complyStore.updateTaskStatus(id, status)
            notify('Task status updated.')
          }}
          onDueDateChange={(id, date) => {
            complyStore.updateTaskDueDate(id, date)
            notify(`Task due date updated to ${date}.`)
          }}
          showEmptyPlan={showEmptyPlan}
          onToggleEmpty={() => setShowEmptyPlan(v => !v)}
          onNavigate={navigate}
          onOpenContactHR={() => {
            setContactHrQuestion('')
            setModalOpen('contact-hr')
          }}
          onOpenAddTask={() => {
            setAddTaskOwner('Maya Chen')
            setModalOpen('add-task')
          }}
        />
      )
    }
    if (path === '/app/tasks') {
      return (
        <TasksPage
          tasks={complyStore.tasks}
          onStatusChange={(id, status) => {
            complyStore.updateTaskStatus(id, status)
            notify('Task status updated.')
          }}
          onDueDateChange={(id, date) => {
            complyStore.updateTaskDueDate(id, date)
            notify(`Task due date updated to ${date}.`)
          }}
          onOpenAddTask={() => {
            setAddTaskOwner('Maya Chen')
            setModalOpen('add-task')
          }}
        />
      )
    }
    if (path === '/app/documents') {
      return (
        <DocumentsPage
          documents={complyStore.documents}
          onUpload={(file) => {
            complyStore.uploadDocument(file)
            notify(`"${file.name}" uploaded and queued for review.`)
          }}
          notify={notify}
        />
      )
    }
    if (path === '/app/ask') {
      return (
        <AskPage
          messages={complyStore.chatMessages}
          setMessages={(msgs) => {
            complyStore.chatMessages = msgs
            complyStore['notify']()
          }}
          onOpenCitation={(citation) => setCitationModalData(citation)}
          onOpenContactHR={(q) => {
            setContactHrQuestion(q)
            setModalOpen('contact-hr')
          }}
        />
      )
    }
    if (path === '/app/profile') return <ProfilePage />
    if (path === '/app/team') {
      return <TeamPage teamMembers={complyStore.teamMembers} notify={notify} />
    }
    if (path === '/admin/dashboard') {
      return (
        <AdminDashboardPage
          loading={loading}
          refresh={refresh}
          onNavigate={navigate}
          onOpenAuditLog={() => setModalOpen('audit-log')}
          onOpenSendReminders={() => setModalOpen('send-reminders')}
        />
      )
    }
    if (path === '/admin/employees') {
      return (
        <EmployeesPage
          employees={complyStore.employees}
          onNavigate={navigate}
          onOpenAddEmployee={() => setModalOpen('add-employee')}
        />
      )
    }
    if (path.startsWith('/admin/employees/')) {
      const empId = path.split('/').pop() ?? 'm1'
      return (
        <EmployeeDetailPage
          employeeId={empId}
          documents={complyStore.documents}
          onApprove={(id) => {
            complyStore.reviewDocument(id, 'approved')
            notify('Document approved and linked task updated.')
          }}
          onReject={(id) => {
            complyStore.reviewDocument(id, 'rejected')
            notify('Document rejected.')
          }}
          onDueDateChange={(id, date) => {
            complyStore.updateTaskDueDate(id, date, 'Grace Kim', 'hr_admin')
            notify(`Task due date updated to ${date}.`)
          }}
          onStatusChange={(id, status) => {
            complyStore.updateTaskStatus(id, status, 'Grace Kim', 'hr_admin')
            notify('Task status updated.')
          }}
          onOpenAddTask={(owner) => {
            setAddTaskOwner(owner)
            setModalOpen('add-task')
          }}
          onNavigate={navigate}
          notify={notify}
          onOpenAuditLog={() => setModalOpen('audit-log')}
        />
      )
    }
    if (path === '/admin/templates') {
      return (
        <TemplatesPage
          templates={complyStore.templates}
          onOpenCreate={() => setModalOpen('create-template')}
          notify={notify}
        />
      )
    }
    if (path === '/admin/policies') {
      return (
        <PoliciesPage
          policies={complyStore.policies}
          showEmpty={showPolicyEmpty}
          onToggleEmpty={() => setShowPolicyEmpty(v => !v)}
          onOpenUpload={() => setModalOpen('upload-policy')}
          notify={notify}
        />
      )
    }
    if (path === '/admin/compliance') {
      return (
        <CompliancePage
          requirements={complyStore.complianceRequirements}
          onOpenAdd={() => setModalOpen('add-requirement')}
          onOpenSendReminders={() => setModalOpen('send-reminders')}
        />
      )
    }
    if (path === '/admin/reports') {
      return (
        <ReportsPage
          employees={complyStore.employees}
          notify={notify}
          onOpenAuditLog={() => setModalOpen('audit-log')}
        />
      )
    }
    if (path === '/admin/settings') {
      return (
        <SettingsPage
          notify={notify}
          onReset={() => {
            complyStore.resetAll()
            notify('Demo data reset to initial baseline.')
          }}
        />
      )
    }
    return (
      <DashboardPage
        tasks={complyStore.tasks}
        onStatusChange={(id, status) => {
          complyStore.updateTaskStatus(id, status)
          notify('Task status updated.')
        }}
        onDueDateChange={(id, date) => {
          complyStore.updateTaskDueDate(id, date)
          notify(`Task due date updated to ${date}.`)
        }}
        showEmptyPlan={false}
        onToggleEmpty={() => undefined}
        onNavigate={navigate}
        onOpenContactHR={() => setModalOpen('contact-hr')}
        onOpenAddTask={() => {
          setAddTaskOwner('Maya Chen')
          setModalOpen('add-task')
        }}
      />
    )
  })()

  return (
    <>
      <AppShell
        role={activeRole}
        path={path}
        onNavigate={navigate}
        onRoleChange={changeRole}
        onRefresh={refresh}
        onOpenContactHR={() => {
          setContactHrQuestion('')
          setModalOpen('contact-hr')
        }}
        toast={toast}
      >
        {content}
      </AppShell>

      {/* Interactive Modals */}
      <AddEmployeeModal
        isOpen={modalOpen === 'add-employee'}
        onClose={() => setModalOpen(null)}
        templates={complyStore.templates}
        notify={notify}
      />

      <CreateTemplateModal
        isOpen={modalOpen === 'create-template'}
        onClose={() => setModalOpen(null)}
        notify={notify}
      />

      <AddRequirementModal
        isOpen={modalOpen === 'add-requirement'}
        onClose={() => setModalOpen(null)}
        notify={notify}
      />

      <UploadPolicyModal
        isOpen={modalOpen === 'upload-policy'}
        onClose={() => setModalOpen(null)}
        notify={notify}
      />

      <AuditLogModal
        isOpen={modalOpen === 'audit-log'}
        onClose={() => setModalOpen(null)}
        auditLog={complyStore.auditLog}
      />

      <ContactHRModal
        isOpen={modalOpen === 'contact-hr'}
        onClose={() => setModalOpen(null)}
        initialQuestion={contactHrQuestion}
        notify={notify}
      />

      <CitationDetailModal
        isOpen={!!citationModalData}
        onClose={() => setCitationModalData(null)}
        citation={citationModalData}
      />

      <SendRemindersModal
        isOpen={modalOpen === 'send-reminders'}
        onClose={() => setModalOpen(null)}
        notify={notify}
      />

      <AddTaskModal
        isOpen={modalOpen === 'add-task'}
        onClose={() => setModalOpen(null)}
        defaultOwner={addTaskOwner}
        employees={complyStore.employees}
        notify={notify}
      />
    </>
  )
}

function PublicShell({ children, onNavigate }: { children: ReactNode; onNavigate: (path: string) => void }) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <button className="brand-button" onClick={() => onNavigate('/')}>
          <BrandMark />
        </button>
        <div className="public-header__right">
          <span className="public-header__note">Internal workspace</span>
          <ActionButton variant="secondary" onClick={() => onNavigate('/login')}>
            Log in <ArrowRight size={15} />
          </ActionButton>
        </div>
      </header>
      {children}
      <footer className="public-footer">
        <span>ComplyPilot</span>
        <span>Internal onboarding & compliance assistant</span>
        <span>v1.0 auditable edition</span>
      </footer>
    </div>
  )
}

function PublicPage({ path, onNavigate }: { path: string; onNavigate: (path: string) => void }) {
  if (path === '/') {
    return (
      <main className="landing-page">
        <div className="landing-page__content">
          <div className="eyebrow eyebrow--teal">Internal onboarding workspace</div>
          <h1>
            Keep onboarding
            <br />
            <em>moving.</em>
          </h1>
          <p className="landing-page__lede">
            ComplyPilot gives every new hire a clear next step, every manager a live view, and HR an audit-ready source of truth.
          </p>
          <div className="landing-page__actions">
            <ActionButton onClick={() => onNavigate('/login')}>
              Open workspace <ArrowRight size={16} />
            </ActionButton>
            <span className="landing-page__hint">Demo access · no account needed</span>
          </div>
          <div className="landing-features">
            <Feature icon={<ListChecks size={18} />} title="Personalized checklists" text="Tasks, documents, and due dates in one calm workspace." />
            <Feature icon={<MessageCircle size={18} />} title="Policy answers with sources" text="Ask questions and see exactly where the answer came from." />
            <Feature icon={<ShieldCheck size={18} />} title="Compliance visibility" text="Spot overdue items before they become audit findings." />
          </div>
        </div>
        <div className="landing-page__aside">
          <div className="landing-note">
            <span className="landing-note__line" />
            <span>
              Designed for the work between
              <br />
              offer accepted and day 30.
            </span>
          </div>
          <div className="landing-stamp">
            <CheckCircle2 size={23} />
            <span>
              Clear next step
              <br />
              <strong>for everyone</strong>
            </span>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <BrandMark />
        </div>
        <div className="eyebrow">{path === '/login' ? 'Access your workspace' : 'Set up your workspace'}</div>
        <h1>{path === '/login' ? 'Good to see you.' : 'Start with clarity.'}</h1>
        <p>
          {path === '/login'
            ? 'Use your work email to continue to ComplyPilot.'
            : 'Create a demo account to explore onboarding and compliance workflows.'}
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onNavigate('/app/dashboard')
          }}
        >
          <label>
            Work email
            <input type="email" defaultValue="maya.chen@northstar.example" required />
          </label>
          {path === '/signup' && (
            <label>
              Full name
              <input type="text" defaultValue="Maya Chen" required />
            </label>
          )}
          <label>
            {path === '/login' ? 'Password' : 'Create password'}
            <input type="password" defaultValue="••••••••" required />
          </label>
          <ActionButton type="submit" className="auth-submit">
            {path === '/login' ? 'Continue to workspace' : 'Create demo account'} <ArrowRight size={16} />
          </ActionButton>
        </form>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <button className="magic-link" onClick={() => onNavigate('/app/dashboard')}>
          <Sparkles size={16} /> Email me a magic link
        </button>
        <p className="auth-switch">
          {path === '/login' ? 'New to ComplyPilot?' : 'Already have access?'}
          <button onClick={() => onNavigate(path === '/login' ? '/signup' : '/login')}>
            {path === '/login' ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </div>
      <div className="auth-aside">
        <div className="auth-aside__mark">
          <BrandMark compact />
        </div>
        <div>
          <div className="eyebrow eyebrow--teal">One place to start</div>
          <h2>Make the first month feel less like a maze.</h2>
          <p>Bring tasks, policies, documents, and people into one shared rhythm.</p>
        </div>
        <div className="auth-aside__footer">
          <LockKeyhole size={14} /> Private internal workspace
        </div>
      </div>
    </main>
  )
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="landing-feature">
      <span className="landing-feature__icon">{icon}</span>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  )
}

function AppShell({
  role,
  path,
  onNavigate,
  onRoleChange,
  onRefresh,
  onOpenContactHR,
  toast,
  children,
}: {
  role: Role
  path: string
  onNavigate: (path: string) => void
  onRoleChange: (role: Role) => void
  onRefresh: () => void
  onOpenContactHR: () => void
  toast: string | null
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = getNavItems(role)

  return (
    <div className={`app-shell app-shell--${role}`}>
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <button
            className="brand-button sidebar__brand"
            onClick={() => onNavigate(role === 'admin' ? '/admin/dashboard' : '/app/dashboard')}
          >
            <BrandMark />
          </button>
          <button className="icon-button sidebar__close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
          <div className="sidebar__context">
            <RolePill role={role} />
            <span className="sidebar__org">
              Northstar Systems <ChevronDown size={14} />
            </span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <span className="sidebar__label">{role === 'admin' ? 'Admin console' : 'Workspace'}</span>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${path === item.path || path.startsWith(`${item.path}/`) ? 'nav-item--active' : ''}`}
              onClick={() => {
                onNavigate(item.path)
                setMobileOpen(false)
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <div className="sidebar__help" onClick={onOpenContactHR} style={{ cursor: 'pointer' }}>
            <span className="sidebar__help-icon">
              <LifeBuoy size={16} />
            </span>
            <div>
              <strong>Need a hand?</strong>
              <span>Contact People Ops</span>
            </div>
            <ArrowUpRight size={14} />
          </div>

          <div className="demo-switcher">
            <span className="sidebar__label">Preview as</span>
            <select
              value={role}
              onChange={(event) => onRoleChange(event.target.value as Role)}
            >
              <option value="employee">Employee · Maya Chen</option>
              <option value="manager">Manager · Jordan Patel</option>
              <option value="admin">HR Admin · Grace Kim</option>
            </select>
          </div>

          <button className="account-row">
            <span className="avatar avatar--nav">{role === 'admin' ? 'GK' : role === 'manager' ? 'JP' : 'MC'}</span>
            <span>
              <strong>{role === 'admin' ? 'Grace Kim' : role === 'manager' ? 'Jordan Patel' : 'Maya Chen'}</strong>
              <small>{role === 'admin' ? 'HR Admin' : role === 'manager' ? 'People Manager' : 'Operations'}</small>
            </span>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}

      <main className="workspace">
        <header className="topbar">
          <div className="topbar__left">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <span className="topbar__kicker">
                {role === 'admin' ? 'Admin console' : 'Workspace'} <span className="topbar__slash">/</span>{' '}
                {role === 'admin' ? 'Northstar Systems' : 'September onboarding'}
              </span>
              <h1>{pageTitle(path)}</h1>
            </div>
          </div>
          <div className="topbar__right">
            <button className="icon-button" title="Refresh" onClick={onRefresh}>
              <RefreshCw size={17} />
            </button>
            <button className="icon-button notification-button" title="Notifications">
              <Bell size={17} />
              <span />
            </button>
            {role === 'admin' && (
              <span className="topbar__admin-flag">
                <ShieldCheck size={14} /> Admin mode
              </span>
            )}
          </div>
        </header>
        <div className="workspace__content">{children}</div>
      </main>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          <span>{toast}</span>
          <button onClick={() => undefined}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

function Avatar({ initials, tone = 'teal' }: { initials: string; tone?: 'teal' | 'violet' | 'amber' | 'navy' }) {
  return <span className={`avatar avatar--${tone}`}>{initials}</span>
}

function parseDisplayDateToISO(displayDate: string): string {
  try {
    const d = new Date(displayDate)
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  } catch {}
  return new Date().toISOString().split('T')[0]
}

function formatISOToDisplayDate(isoDate: string): string {
  try {
    const [year, month, day] = isoDate.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {}
  return isoDate
}

function DashboardPage({
  tasks,
  onStatusChange,
  onDueDateChange,
  showEmptyPlan,
  onToggleEmpty,
  onNavigate,
  onOpenContactHR,
  onOpenAddTask,
}: {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onDueDateChange: (id: string, newDueDate: string) => void
  showEmptyPlan: boolean
  onToggleEmpty: () => void
  onNavigate: (path: string) => void
  onOpenContactHR: () => void
  onOpenAddTask: () => void
}) {
  const completed = tasks.filter((task) => task.status === 'completed').length
  const progress = Math.round((completed / tasks.length) * 100)
  const nextTasks = tasks.filter((task) => task.status !== 'completed').slice(0, 3)

  return (
    <div className="page-stack">
      {progress === 100 && (
        <div className="celebrate-banner">
          <div className="celebrate-banner__text">
            <h4>🎉 Onboarding Completed!</h4>
            <p>All required tasks, documents, and compliance verifications have been signed off.</p>
          </div>
          <StatusBadge status="Complete" kind="generic" />
        </div>
      )}

      <div className="welcome-band">
        <div>
          <div className="eyebrow eyebrow--teal">Monday, September 14, 2026</div>
          <h2>Good morning, Maya.</h2>
          <p>Here’s the next clear step in your onboarding plan.</p>
        </div>
        <div className="welcome-band__meta">
          <span className="welcome-band__meta-label">Plan completion</span>
          <strong>{progress}%</strong>
          <ProgressBar value={progress} />
        </div>
      </div>

      {showEmptyPlan ? (
        <EmptyState
          icon={<ClipboardList size={22} />}
          title="No onboarding plan assigned yet"
          description="Your People Ops partner will assign a plan when your start date is confirmed."
          action={
            <ActionButton variant="secondary" onClick={onToggleEmpty}>
              Return to my plan
            </ActionButton>
          }
        />
      ) : (
        <>
          <div className="dashboard-grid">
            <section className="panel panel--progress">
              <div className="panel__header">
                <div>
                  <div className="eyebrow">Your progress</div>
                  <h3>
                    {completed} of {tasks.length} tasks complete
                  </h3>
                </div>
                <div className="progress-ring">
                  <strong>{progress}</strong>
                  <span>%</span>
                </div>
              </div>
              <ProgressBar value={progress} label="September onboarding" />
              <div className="progress-milestones">
                <span className="progress-milestone progress-milestone--done">
                  <Check size={13} /> Before day 1
                </span>
                <span className={`progress-milestone ${progress > 25 ? 'progress-milestone--done' : ''}`}>
                  <span>2</span> First week
                </span>
                <span className={`progress-milestone ${progress === 100 ? 'progress-milestone--done' : ''}`}>
                  <span>3</span> First 30 days
                </span>
              </div>
            </section>

            <section className="panel panel--attention">
              <div className="panel__header">
                <div>
                  <div className="eyebrow eyebrow--amber">Needs your attention</div>
                  <h3>2 items due this week</h3>
                </div>
                <span className="attention-pulse">
                  <span />
                </span>
              </div>
              <div className="attention-list">
                <div>
                  <span className="attention-date">SEP 16</span>
                  <strong>Read the employee handbook</strong>
                  <span>Policy review · 12 min</span>
                </div>
                <div>
                  <span className="attention-date">SEP 18</span>
                  <strong>Meet with your manager</strong>
                  <span>People · 30 min</span>
                </div>
              </div>
              <ActionButton variant="soft" onClick={() => onNavigate('/app/tasks')}>
                View all tasks <ArrowRight size={15} />
              </ActionButton>
            </section>
          </div>

          <section>
            <SectionHeading
              eyebrow="Up next"
              title="Your checklist"
              description="Keep the momentum going. You can always change due dates or add custom milestones."
              action={
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="text-button" onClick={onOpenAddTask}>
                    <Plus size={14} /> Add task
                  </button>
                  <button className="text-button" onClick={onToggleEmpty}>
                    Preview empty state
                  </button>
                </div>
              }
            />
            <div className="task-list">
              {nextTasks.length > 0 ? (
                nextTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onDueDateChange={onDueDateChange}
                    compact
                  />
                ))
              ) : (
                <div style={{ padding: 20, textAlign: 'center', background: '#fff', borderRadius: 8, border: '1px solid var(--line)' }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--teal)', margin: '0 auto 8px' }} />
                  <strong>All tasks finished! Great job.</strong>
                </div>
              )}
            </div>
          </section>

          <section className="dashboard-lower">
            <div className="panel panel--mini">
              <div className="panel__header">
                <h3>Policy center</h3>
                <button className="icon-button" onClick={() => onNavigate('/app/ask')}>
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="mini-policy" onClick={() => onNavigate('/app/ask')} style={{ cursor: 'pointer' }}>
                <span className="mini-policy__icon">
                  <BookOpen size={17} />
                </span>
                <div>
                  <strong>Employee Handbook</strong>
                  <span>42 pages · updated Sep 7</span>
                </div>
                <IconLink>Open</IconLink>
              </div>
              <div className="mini-policy" onClick={() => onNavigate('/app/ask')} style={{ cursor: 'pointer' }}>
                <span className="mini-policy__icon mini-policy__icon--violet">
                  <LockKeyhole size={17} />
                </span>
                <div>
                  <strong>Information Security Policy</strong>
                  <span>18 pages · updated Aug 30</span>
                </div>
                <IconLink>Open</IconLink>
              </div>
            </div>

            <div className="panel panel--mini panel--person">
              <div className="panel__header">
                <h3>People in your corner</h3>
                <button className="icon-button" onClick={onOpenContactHR}>
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className="person-line">
                <Avatar initials="JP" tone="violet" />
                <div>
                  <strong>Jordan Patel</strong>
                  <span>Your manager</span>
                </div>
                <button className="icon-button" onClick={onOpenContactHR} title="Message manager">
                  <MessageCircle size={16} />
                </button>
              </div>
              <div className="person-line">
                <Avatar initials="GK" tone="amber" />
                <div>
                  <strong>Grace Kim</strong>
                  <span>People partner</span>
                </div>
                <button className="icon-button" onClick={onOpenContactHR} title="Message HR partner">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function TaskCard({
  task,
  onStatusChange,
  onDueDateChange,
  compact = false,
}: {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onDueDateChange?: (id: string, newDueDate: string) => void
  compact?: boolean
}) {
  const [editingDate, setEditingDate] = useState(false)

  return (
    <article className={`task-card ${compact ? 'task-card--compact' : ''} task-card--${task.status}`}>
      <div className="task-card__main">
        <span
          className={`task-card__check task-card__check--${task.status}`}
          onClick={() => onStatusChange(task.id, task.status === 'completed' ? 'in-progress' : 'completed')}
          style={{ cursor: 'pointer' }}
          title="Click to toggle completion"
        >
          {task.status === 'completed' ? <Check size={15} /> : task.status === 'pending-review' ? <Clock3 size={14} /> : <span />}
        </span>
        <div>
          <div className="task-card__meta">
            <span>{task.category}</span>
            <span className={`priority priority--${task.priority}`}>{task.priority} priority</span>
            {task.owner && <span style={{ color: 'var(--muted)', fontSize: 11 }}>· {task.owner}</span>}
          </div>
          <h3>{task.title}</h3>
          {!compact && <p>{task.description}</p>}
        </div>
      </div>
      <div className="task-card__side">
        <div className="task-card__due" title="Click to edit due date">
          <CalendarDays size={14} />
          {editingDate ? (
            <input
              type="date"
              autoFocus
              defaultValue={parseDisplayDateToISO(task.dueDate)}
              onChange={(e) => {
                if (e.target.value) {
                  onDueDateChange?.(task.id, formatISOToDisplayDate(e.target.value))
                  setEditingDate(false)
                }
              }}
              onBlur={() => setEditingDate(false)}
              style={{
                fontSize: 12,
                padding: '2px 5px',
                border: '1px solid var(--teal)',
                borderRadius: 4,
                background: '#fff',
                color: 'var(--ink)',
              }}
            />
          ) : (
            <span
              onClick={() => setEditingDate(true)}
              style={{
                cursor: 'pointer',
                borderBottom: '1px dashed var(--muted-soft)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Click to edit due date"
            >
              {task.dueDate}
              <Pencil size={11} style={{ opacity: 0.6 }} />
            </span>
          )}
        </div>
        <select
          value={task.status}
          aria-label={`Status for ${task.title}`}
          onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
        >
          <option value="not-started">Not started</option>
          <option value="in-progress">In progress</option>
          <option value="pending-review">Pending review</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </article>
  )
}

function TasksPage({
  tasks,
  onStatusChange,
  onDueDateChange,
  onOpenAddTask,
}: {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onDueDateChange: (id: string, newDueDate: string) => void
  onOpenAddTask: () => void
}) {
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const filtered = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="September onboarding · 30 days"
        title="Everything on your plate"
        description="A full view of your checklist, with status and due dates in one place. Click any date to update it."
        action={
          <ActionButton icon={<Plus size={15} />} onClick={onOpenAddTask}>
            Add task
          </ActionButton>
        }
      />
      <div className="filter-tabs">
        {[
          ['all', 'All tasks'],
          ['not-started', 'Not started'],
          ['in-progress', 'In progress'],
          ['pending-review', 'Pending review'],
          ['completed', 'Completed'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={filter === value ? 'filter-tab filter-tab--active' : 'filter-tab'}
            onClick={() => setFilter(value as typeof filter)}
          >
            {label}
            <span>{value === 'all' ? tasks.length : tasks.filter((task) => task.status === value).length}</span>
          </button>
        ))}
      </div>
      <div className="task-list">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onDueDateChange={onDueDateChange}
          />
        ))}
      </div>
      <div className="task-page-footer">
        <span>
          <ClipboardCheck size={16} /> Your plan is managed by People Ops
        </span>
        <button className="text-button">
          <CircleHelp size={15} /> How statuses work
        </button>
      </div>
    </div>
  )
}

function DocumentsPage({
  documents,
  onUpload,
  notify,
}: {
  documents: Doc[]
  onUpload: (file: File) => void
  notify: (message: string) => void
}) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const simulateFailure = () => {
    if (documents.some((doc) => doc.status === 'failed')) return
    complyStore.documents = [
      ...documents,
      {
        id: 'failed-demo',
        name: 'Emergency contact form.pdf',
        type: 'PDF',
        size: '1.2 MB',
        updated: 'Just now',
        status: 'failed',
        required: true,
      },
    ]
    complyStore['notify']()
    notify('A simulated failed upload state was added for preview.')
  }

  const retry = (id: string) => {
    complyStore.documents = documents.map((doc) =>
      doc.id === id ? { ...doc, status: 'pending-review', updated: 'Just now' } : doc
    )
    complyStore['notify']()
    notify('Upload retried. Document queued for review.')
  }

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Your onboarding documents"
        title="Keep your file trail tidy"
        description="Upload the documents your plan requires. People Ops will review them here."
        action={
          <ActionButton variant="secondary" onClick={simulateFailure} icon={<CircleHelp size={15} />}>
            Preview retry state
          </ActionButton>
        }
      />
      <label
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          const file = event.dataTransfer.files?.[0]
          if (file) onUpload(file)
        }}
      >
        <input type="file" onChange={handleFileChange} />
        <span className="upload-zone__icon">
          <UploadCloud size={25} />
        </span>
        <strong>Drop a file here or browse</strong>
        <span>PDF, DOCX, JPG or PNG · Up to 10 MB</span>
        <span className="upload-zone__hint">Your files are only visible to authorized People Ops reviewers.</span>
      </label>
      <section className="panel">
        <div className="panel__header">
          <div>
            <div className="eyebrow">Document checklist</div>
            <h3>
              {documents.filter((doc) => doc.status === 'approved').length} of {documents.length} documents approved
            </h3>
          </div>
          <span className="panel__count">{documents.length} files</span>
        </div>
        <div className="document-list">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onRetry={retry} />
          ))}
        </div>
      </section>
      <div className="privacy-note">
        <LockKeyhole size={17} />
        <div>
          <strong>Why we ask for these</strong>
          <span>
            These documents support identity, payroll, and access setup. ComplyPilot keeps a record of review status, not a copy of sensitive content beyond what your organization requires.
          </span>
        </div>
      </div>
    </div>
  )
}

function DocumentRow({
  doc,
  onRetry,
  review = false,
  onApprove,
  onReject,
}: {
  doc: Doc
  onRetry?: (id: string) => void
  review?: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}) {
  return (
    <div className={`document-row ${doc.status === 'failed' ? 'document-row--failed' : ''}`}>
      <span className="document-row__icon">
        <FileText size={19} />
      </span>
      <div className="document-row__name">
        <strong>{doc.name}</strong>
        <span>
          {doc.type} · {doc.size} {doc.required && <em>Required</em>}
        </span>
      </div>
      <span className="document-row__updated">{doc.updated}</span>
      <StatusBadge status={doc.status} kind="document" />
      {review ? (
        <div className="document-row__actions">
          {doc.status !== 'approved' && (
            <button className="table-action table-action--approve" onClick={() => onApprove?.(doc.id)}>
              <Check size={14} /> Approve
            </button>
          )}
          {doc.status !== 'rejected' && (
            <button className="table-action table-action--reject" onClick={() => onReject?.(doc.id)}>
              Reject
            </button>
          )}
        </div>
      ) : doc.status === 'failed' ? (
        <button className="text-button text-button--danger" onClick={() => onRetry?.(doc.id)}>
          <RefreshCw size={14} /> Retry upload
        </button>
      ) : (
        <button className="icon-button">
          <MoreHorizontal size={16} />
        </button>
      )}
    </div>
  )
}

function AskPage({
  messages,
  setMessages,
  onOpenCitation,
  onOpenContactHR,
}: {
  messages: ChatMessageItem[]
  setMessages: (messages: ChatMessageItem[]) => void
  onOpenCitation: (citation: { section: string; content: string; source: string }) => void
  onOpenContactHR: (question: string) => void
}) {
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState(false)

  const send = async (event?: FormEvent) => {
    event?.preventDefault()
    const text = input.trim()
    if (!text) return

    const userMsg: ChatMessageItem = {
      id: `q-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, userMsg])
    setInput('')
    setTyping(true)

    try {
      const response = await complyStore.askPolicyQuestion(text)
      setMessages([...messages, userMsg, response])
    } catch {
      setError(true)
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="ask-layout">
      <section className="chat-panel">
        <div className="chat-panel__header">
          <div>
            <div className="eyebrow eyebrow--teal">Policy assistant</div>
            <h2>Ask ComplyPilot</h2>
            <p>Grounded in the employee handbook, data privacy standard, and security policies.</p>
          </div>
          <span className="assistant-status">
            <span /> Online
          </span>
        </div>

        <div className="chat-thread">
          {messages.map((message) => (
            <div className={`chat-message chat-message--${message.role}`} key={message.id}>
              <Avatar initials={message.role === 'user' ? 'MC' : 'CP'} tone={message.role === 'user' ? 'teal' : 'navy'} />
              <div className={`chat-bubble ${message.fallback ? 'chat-bubble--fallback' : ''}`}>
                {message.fallback && (
                  <div className="fallback-label">
                    <CircleHelp size={15} /> Best next step: talk to People Ops
                  </div>
                )}
                <p>{message.text}</p>
                {message.citation && (
                  <button
                    className="citation"
                    onClick={() =>
                      onOpenCitation({
                        section: message.citationSection || message.citation || '',
                        content: message.citationContent || message.text,
                        source: message.citation?.split('·')[0]?.trim() || 'Active Policy Library',
                      })
                    }
                  >
                    <BookOpen size={14} />
                    <span>{message.citation}</span>
                    <ArrowUpRight size={13} />
                  </button>
                )}
                {message.fallback && (
                  <button className="fallback-cta" onClick={() => onOpenContactHR(message.text)}>
                    <Headphones size={14} /> Contact People Ops
                  </button>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="chat-message chat-message--assistant">
              <Avatar initials="CP" tone="navy" />
              <div className="chat-bubble chat-bubble--typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error">
              <CircleHelp size={16} />
              <span>We couldn’t reach the policy library. Try again or contact People Ops directly.</span>
              <button onClick={() => setError(false)}>Retry</button>
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={send}>
          <button type="button" className="icon-button" onClick={() => onOpenContactHR('')}>
            <Paperclip size={17} />
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about PTO, security, remote stipend, or hours..."
          />
          <button type="submit" className="send-button" disabled={!input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </section>

      <aside className="ask-sidebar">
        <div className="panel">
          <div className="panel__header">
            <div>
              <div className="eyebrow">Suggested questions</div>
              <h3>Start here</h3>
            </div>
            <Sparkles size={17} className="muted-icon" />
          </div>
          <div className="suggestion-list">
            {[
              'What should I do if I spot a security issue?',
              'How many days of paid time off (PTO) do I get?',
              'Is there a home office stipend for remote work?',
              'Can I negotiate an exception to my starting bonus?',
            ].map((question) => (
              <button
                key={question}
                onClick={() => {
                  setInput(question)
                  setError(false)
                }}
              >
                {question}
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>

        <div className="grounding-card" id="policy-source">
          <div className="grounding-card__icon">
            <ShieldCheck size={20} />
          </div>
          <strong>Answers show their work</strong>
          <p>Every response is retrieved from verified policies and provides section citations.</p>
        </div>

        <button className="error-demo" onClick={() => setError(true)}>
          <CircleHelp size={15} /> Preview chat error state
        </button>
      </aside>
    </div>
  )
}

function ProfilePage() {
  return (
    <div className="page-stack profile-page">
      <SectionHeading
        eyebrow="Your workspace identity"
        title="My profile"
        description="The details People Ops uses to route onboarding and compliance work."
      />
      <section className="profile-hero panel">
        <Avatar initials="MC" tone="teal" />
        <div>
          <div className="eyebrow">Employee</div>
          <h2>{currentEmployee.name}</h2>
          <p>
            {currentEmployee.title} · {currentEmployee.department}
          </p>
        </div>
        <span className="profile-hero__status">
          <CheckCircle2 size={16} /> Active employee
        </span>
      </section>
      <div className="profile-grid">
        <InfoCard
          title="Work details"
          rows={[
            ['Role', currentEmployee.title],
            ['Department', currentEmployee.department],
            ['Manager', currentEmployee.manager],
            ['Start date', currentEmployee.startDate],
          ]}
        />
        <InfoCard
          title="Onboarding plan"
          rows={[
            ['Assigned plan', currentEmployee.plan],
            ['Plan owner', 'People Operations'],
            ['Review cadence', 'Weekly check-in'],
            ['Next checkpoint', 'September 18, 2026'],
          ]}
        />
        <div className="panel profile-access">
          <div className="eyebrow">Access & privacy</div>
          <h3>Your data, clearly scoped.</h3>
          <p>You can ask People Ops to review, correct, or explain the data used in your onboarding record.</p>
          <button className="text-button">
            Review privacy details <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="panel info-card">
      <div className="panel__header">
        <h3>{title}</h3>
        <button className="icon-button">
          <MoreHorizontal size={16} />
        </button>
      </div>
      {rows.map(([label, value]) => (
        <div className="info-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  )
}

function TeamPage({ teamMembers, notify }: { teamMembers: typeof complyStore.teamMembers; notify: (msg: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'Needs attention' | 'On track' | 'Complete'>('all')
  const filtered = filter === 'all' ? teamMembers : teamMembers.filter((m) => m.status === filter)

  const exportTeam = () => {
    const csv = [
      'Name,Role,Department,Progress,Status,Notes',
      ...filtered.map((m) => `"${m.name}","${m.role}","${m.department}","${m.progress}%","${m.status}","${m.due}"`),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'team-onboarding-progress.csv'
    link.click()
    URL.revokeObjectURL(url)
    notify('Team progress snapshot downloaded.')
  }

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Manager view"
        title="How your team is tracking"
        description="See where direct reports need a nudge, a review, or a little more context."
        action={
          <ActionButton variant="secondary" icon={<Download size={15} />} onClick={exportTeam}>
            Export snapshot
          </ActionButton>
        }
      />
      <div className="stat-grid stat-grid--three">
        <StatCard label="Team completion" value="69%" note="+8% from last week" tone="teal" icon={<BarChart3 size={17} />} />
        <StatCard
          label="Needs attention"
          value={teamMembers.filter((m) => m.status === 'Needs attention').length}
          note="Direct reports"
          tone="amber"
          icon={<CircleHelp size={17} />}
        />
        <StatCard label="Pending reviews" value="4" note="Across your team" tone="violet" icon={<FileCheck2 size={17} />} />
      </div>
      <div className="team-toolbar">
        <div className="filter-tabs filter-tabs--small">
          {[['all', 'Everyone'], ['Needs attention', 'Needs attention'], ['On track', 'On track'], ['Complete', 'Complete']].map(
            ([value, label]) => (
              <button
                className={filter === value ? 'filter-tab filter-tab--active' : 'filter-tab'}
                key={value}
                onClick={() => setFilter(value as typeof filter)}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>
      <section className="team-list">
        {filtered.map((member) => (
          <div className="team-card" key={member.id}>
            <Avatar
              initials={member.initials}
              tone={member.status === 'Needs attention' ? 'amber' : member.status === 'Complete' ? 'violet' : 'teal'}
            />
            <div className="team-card__identity">
              <strong>{member.name}</strong>
              <span>{member.role}</span>
              <span>{member.due}</span>
            </div>
            <div className="team-card__progress">
              <ProgressBar
                value={member.progress}
                label="Plan completion"
                tone={member.status === 'Complete' ? 'violet' : 'teal'}
              />
            </div>
            <StatusBadge status={member.status} kind="generic" />
          </div>
        ))}
      </section>
    </div>
  )
}

function AdminDashboardPage({
  loading,
  refresh,
  onNavigate,
  onOpenAuditLog,
  onOpenSendReminders,
}: {
  loading: boolean
  refresh: () => void
  onNavigate: (path: string) => void
  onOpenAuditLog: () => void
  onOpenSendReminders: () => void
}) {
  const attentionCount = complyStore.employees.filter((e) => e.status === 'Needs attention').length
  const pendingDocsCount = complyStore.documents.filter((d) => d.status === 'pending-review').length

  return (
    <div className="page-stack">
      <div className="admin-hero">
        <div>
          <div className="eyebrow eyebrow--violet">Monday, September 14, 2026 · live overview</div>
          <h2>Review what needs attention.</h2>
          <p>Northstar Systems onboarding and compliance across {complyStore.employees.length} employees.</p>
        </div>
        <div className="admin-hero__actions">
          <ActionButton variant="secondary" icon={<RefreshCw size={15} />} onClick={refresh}>
            Refresh data
          </ActionButton>
          <ActionButton icon={<Download size={15} />} onClick={() => onNavigate('/admin/reports')}>
            Generate report
          </ActionButton>
        </div>
      </div>

      {loading ? (
        <SkeletonRows count={5} />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Active employees" value={complyStore.employees.length} note="Across 4 departments" tone="default" icon={<Users size={17} />} />
            <StatCard
              label="On track"
              value={complyStore.employees.filter((e) => e.status !== 'Needs attention').length}
              note="Compliant or progressing"
              tone="teal"
              icon={<CheckCircle2 size={17} />}
            />
            <StatCard
              label="Needs attention"
              value={attentionCount}
              note="Flagged for overdue items"
              tone="amber"
              icon={<CircleHelp size={17} />}
            />
            <StatCard
              label="Pending review"
              value={pendingDocsCount}
              note="Documents waiting for HR"
              tone="violet"
              icon={<FileCheck2 size={17} />}
            />
          </div>

          <div className="admin-dashboard-grid">
            <section className="panel">
              <div className="panel__header">
                <div>
                  <div className="eyebrow">Compliance pulse</div>
                  <h3>Where the organization stands</h3>
                </div>
                <button className="text-button" onClick={() => onNavigate('/admin/compliance')}>
                  View all requirements <ArrowRight size={14} />
                </button>
              </div>
              <div className="compliance-bars">
                {complyStore.complianceRequirements.slice(0, 3).map((item) => (
                  <div className="compliance-bar" key={item.id}>
                    <div className="compliance-bar__label">
                      <span>{item.title}</span>
                      <strong>{item.completion}%</strong>
                    </div>
                    <ProgressBar value={item.completion} tone={item.status === 'Healthy' ? 'teal' : 'amber'} />
                  </div>
                ))}
              </div>
              <div className="panel-callout panel-callout--amber">
                <CircleHelp size={17} />
                <div>
                  <strong>{attentionCount} employees need attention</strong>
                  <span>Send reminders or review pending documents to maintain audit compliance.</span>
                </div>
                <button className="text-button" onClick={onOpenSendReminders}>
                  <Mail size={13} /> Send reminders <ArrowRight size={14} />
                </button>
              </div>
            </section>

            <section className="panel activity-panel">
              <div className="panel__header">
                <div>
                  <div className="eyebrow">Live activity & audit log</div>
                  <h3>Recent movement</h3>
                </div>
                <span className="live-dot">
                  <span /> Live
                </span>
              </div>
              <div className="activity-list">
                {complyStore.auditLog.slice(0, 4).map((item) => (
                  <div className="activity-item" key={item.id}>
                    <span
                      className={`activity-item__dot activity-item__dot--${
                        item.action.includes('approved') ? 'success' : item.action.includes('reminder') ? 'warning' : 'info'
                      }`}
                    />
                    <div>
                      <span>
                        <strong>{item.actorName}:</strong> {item.targetLabel}
                      </span>
                      <small>{item.createdAt}</small>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-button" onClick={onOpenAuditLog}>
                <History size={14} /> Open full audit log <ArrowRight size={14} />
              </button>
            </section>
          </div>

          <section className="panel admin-table-panel">
            <div className="panel__header">
              <div>
                <div className="eyebrow">Attention queue</div>
                <h3>Employees who need a review</h3>
              </div>
              <button className="text-button" onClick={() => onNavigate('/admin/employees')}>
                All employees <ArrowRight size={14} />
              </button>
            </div>
            <EmployeeTable
              rows={complyStore.employees.filter((e) => e.status === 'Needs attention').slice(0, 4)}
              onNavigate={onNavigate}
            />
          </section>
        </>
      )}
    </div>
  )
}

function EmployeesPage({
  employees,
  onNavigate,
  onOpenAddEmployee,
}: {
  employees: EmployeeRecord[]
  onNavigate: (path: string) => void
  onOpenAddEmployee: () => void
}) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All departments')

  const filtered = employees.filter(
    (employee) =>
      `${employee.name} ${employee.role}`.toLowerCase().includes(query.toLowerCase()) &&
      (department === 'All departments' || employee.department === department)
  )

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Organization directory"
        title="Employees"
        description="Filter the people record and jump into a full onboarding history."
        action={
          <ActionButton icon={<UserPlus size={16} />} onClick={onOpenAddEmployee}>
            Add employee
          </ActionButton>
        }
      />
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or role"
          />
        </label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)}>
          <option>All departments</option>
          <option>Operations</option>
          <option>Customer Success</option>
          <option>Engineering</option>
          <option>People</option>
        </select>
      </div>
      <section className="panel admin-table-panel">
        <div className="table-summary">
          <span>
            Showing <strong>{filtered.length}</strong> of {employees.length} employees
          </span>
          <span className="table-summary__right">
            <span className="status-badge status-badge--success">
              <span className="status-badge__dot" />{' '}
              {employees.filter((e) => e.status !== 'Needs attention').length} on track
            </span>
            <span className="status-badge status-badge--warning">
              <span className="status-badge__dot" />{' '}
              {employees.filter((e) => e.status === 'Needs attention').length} need attention
            </span>
          </span>
        </div>
        <EmployeeTable rows={filtered} onNavigate={onNavigate} />
      </section>
    </div>
  )
}

function EmployeeTable({ rows, onNavigate }: { rows: EmployeeRecord[]; onNavigate: (path: string) => void }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Start date</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Overdue</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((employee) => (
            <tr key={employee.id}>
              <td>
                <button className="table-person" onClick={() => onNavigate(`/admin/employees/${employee.id}`)}>
                  <Avatar initials={employee.initials} tone={employee.status === 'Needs attention' ? 'amber' : 'teal'} />
                  <span>
                    <strong>{employee.name}</strong>
                    <small>{employee.role}</small>
                  </span>
                </button>
              </td>
              <td>{employee.department}</td>
              <td>{employee.startDate}</td>
              <td>
                <div className="table-progress">
                  <ProgressBar value={employee.progress} />
                  <span>{employee.progress}%</span>
                </div>
              </td>
              <td>
                <StatusBadge status={employee.status} kind="generic" />
              </td>
              <td>
                {employee.overdue > 0 ? (
                  <span className="overdue-count">
                    {employee.overdue} item{employee.overdue > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
              <td>
                <button className="icon-button" onClick={() => onNavigate(`/admin/employees/${employee.id}`)}>
                  <ChevronRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmployeeDetailPage({
  employeeId,
  documents,
  onApprove,
  onReject,
  notify,
  onNavigate,
  onOpenAuditLog,
  onOpenAddTask,
  onDueDateChange,
  onStatusChange,
}: {
  employeeId: string
  documents: Doc[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  notify: (msg: string) => void
  onNavigate: (path: string) => void
  onOpenAuditLog: () => void
  onOpenAddTask: (ownerName: string) => void
  onDueDateChange: (id: string, newDueDate: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const employee = complyStore.employees.find((item) => item.id === employeeId) ?? complyStore.employees[0]
  const [tab, setTab] = useState('overview')
  const [note, setNote] = useState('New hire is progressing well. Follow up on the data privacy acknowledgement.')

  // Filter tasks belonging to this employee or general demo tasks
  const employeeTasks = complyStore.tasks.filter(
    (t) => t.owner === employee.name || (employee.id === 'm1' && t.owner === 'Maya Chen')
  ).concat(
    complyStore.tasks.filter((t) => t.owner !== employee.name && t.owner !== 'Maya Chen').slice(0, 2)
  )

  return (
    <div className="page-stack">
      <button className="back-link" onClick={() => onNavigate('/admin/employees')}>
        <ArrowLeft size={15} /> Back to employees
      </button>

      <div className="detail-header">
        <div className="detail-header__identity">
          <Avatar initials={employee.initials} tone="violet" />
          <div>
            <div className="eyebrow">Employee record · {employee.id.toUpperCase()}</div>
            <h2>{employee.name}</h2>
            <p>
              {employee.role} · {employee.department}
            </p>
          </div>
        </div>
        <div className="detail-header__actions">
          <StatusBadge status={employee.status} kind="generic" />
        </div>
      </div>

      <div className="detail-tabs">
        {['overview', 'documents', 'history'].map((item) => (
          <button
            className={tab === item ? 'detail-tab detail-tab--active' : 'detail-tab'}
            key={item}
            onClick={() => setTab(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'documents' ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <div className="eyebrow">Review queue</div>
              <h3>Employee documents</h3>
            </div>
            <span className="panel__count">{documents.length} files</span>
          </div>
          <div className="document-list">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} review onApprove={onApprove} onReject={onReject} />
            ))}
          </div>
        </section>
      ) : tab === 'history' ? (
        <section className="panel history-panel">
          <div className="panel__header">
            <div>
              <div className="eyebrow">Audit trail</div>
              <h3>Employee timeline</h3>
            </div>
            <button className="text-button" onClick={onOpenAuditLog}>
              <History size={14} /> Full org audit log <ArrowRight size={14} />
            </button>
          </div>
          <div className="activity-list" style={{ padding: '16px 20px' }}>
            {complyStore.auditLog
              .filter((a) => a.targetLabel.includes(employee.name) || a.actorName === employee.name || a.targetId === employee.id)
              .concat(complyStore.auditLog.slice(0, 3))
              .slice(0, 5)
              .map((a) => (
                <div className="activity-item" key={a.id}>
                  <span className="activity-item__dot activity-item__dot--info" />
                  <div>
                    <strong>{a.action}</strong>
                    <span>{a.targetLabel}</span>
                    <small>{a.createdAt} · {a.actorName}</small>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ) : (
        <div className="detail-grid">
          <section className="panel">
            <div className="panel__header">
              <div>
                <div className="eyebrow">Onboarding plan</div>
                <h3>{employee.progress}% complete</h3>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  className="text-button"
                  onClick={() => onOpenAddTask(employee.name)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={14} /> Add task
                </button>
                <StatusBadge status={employee.status} kind="generic" />
              </div>
            </div>
            <ProgressBar value={employee.progress} label="Overall plan progress" tone="violet" />
            <div className="detail-stats">
              <div>
                <span>Start date</span>
                <strong>{employee.startDate}</strong>
              </div>
              <div>
                <span>Manager</span>
                <strong>{employee.manager}</strong>
              </div>
              <div>
                <span>Overdue items</span>
                <strong className={employee.overdue ? 'text-danger' : ''}>{employee.overdue || 'None'}</strong>
              </div>
            </div>
            <div className="detail-task-list">
              {employeeTasks.map((task) => (
                <div
                  className="detail-task"
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '8px 4px',
                    borderBottom: '1px solid #f1f4f6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <span
                      className={`detail-task__dot detail-task__dot--${task.status}`}
                      onClick={() => onStatusChange(task.id, task.status === 'completed' ? 'in-progress' : 'completed')}
                      style={{ cursor: 'pointer', flexShrink: 0 }}
                      title="Click to toggle completion"
                    />
                    <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <input
                      type="date"
                      defaultValue={parseDisplayDateToISO(task.dueDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          onDueDateChange(task.id, formatISOToDisplayDate(e.target.value))
                        }
                      }}
                      title="Edit due date"
                      style={{
                        fontSize: 11,
                        padding: '2px 4px',
                        border: '1px solid var(--line)',
                        borderRadius: 4,
                        background: '#fff',
                        color: 'var(--muted)',
                      }}
                    />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <div className="eyebrow">Record summary</div>
                <h3>People Ops notes</h3>
              </div>
            </div>
            <div className="note-block">
              <span className="note-block__quote">“</span>
              <p>{note}</p>
              <span className="note-block__byline">Grace Kim · Verified</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <input
                placeholder="Add internal note..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setNote(e.currentTarget.value)
                    e.currentTarget.value = ''
                    notify('Note added to employee record.')
                  }
                }}
                style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)' }}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function TemplatesPage({
  templates,
  onOpenCreate,
  notify,
}: {
  templates: OnboardingTemplate[]
  onOpenCreate: () => void
  notify: (msg: string) => void
}) {
  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Onboarding configuration"
        title="Checklist templates"
        description="Build the repeatable plan behind each new hire experience."
        action={
          <ActionButton icon={<Plus size={16} />} onClick={onOpenCreate}>
            New template
          </ActionButton>
        }
      />
      <div className="template-grid">
        {templates.map((template) => (
          <div className="template-card panel" key={template.id}>
            <div className="template-card__top">
              <span className="template-icon">
                <ClipboardList size={19} />
              </span>
              <button className="icon-button">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="eyebrow">{template.status}</div>
            <h3>{template.name}</h3>
            <p>Target: {template.roleTarget}</p>
            <div className="template-card__stats">
              <span>
                <strong>{template.tasks.length}</strong> tasks
              </span>
              <span>
                <strong>{template.assignedCount}</strong> assigned
              </span>
            </div>
            <div className="template-card__footer">
              <StatusBadge status={template.status} kind="generic" />
              <button className="text-button" onClick={() => notify(`Template "${template.name}" has ${template.tasks.length} defined milestones.`)}>
                <Pencil size={14} /> Review tasks
              </button>
            </div>
          </div>
        ))}
      </div>
      <section className="panel builder-preview">
        <div>
          <div className="eyebrow eyebrow--violet">Checklist Engine Workflow</div>
          <h3>Templates auto-generate tasks on employee profile creation.</h3>
          <p>Each milestone has a target offset, priority, and required document attachment where applicable.</p>
        </div>
        <div className="builder-preview__trail">
          <span className="builder-node builder-node--done">
            <Check size={14} />
          </span>
          <span className="builder-connector builder-connector--done" />
          <span className="builder-node builder-node--active">2</span>
          <span className="builder-connector" />
          <span className="builder-node">3</span>
        </div>
      </section>
    </div>
  )
}

function PoliciesPage({
  policies,
  showEmpty,
  onToggleEmpty,
  onOpenUpload,
  notify,
}: {
  policies: typeof complyStore.policies
  showEmpty: boolean
  onToggleEmpty: () => void
  onOpenUpload: () => void
  notify: (msg: string) => void
}) {
  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Policy library"
        title="Policies"
        description="The source material behind every grounded answer and audit requirement."
        action={
          <ActionButton icon={<UploadCloud size={16} />} onClick={onOpenUpload}>
            Upload policy
          </ActionButton>
        }
      />
      {showEmpty ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title="No policies uploaded yet"
          description="Upload your first policy document to make it available for review and policy Q&A."
          action={
            <ActionButton variant="secondary" onClick={onToggleEmpty}>
              Show sample library
            </ActionButton>
          }
        />
      ) : (
        <>
          <div className="policy-library-toolbar">
            <div className="filter-tabs filter-tabs--small">
              <button className="filter-tab filter-tab--active">
                All policies <span>{policies.length}</span>
              </button>
            </div>
            <button className="text-button" onClick={onToggleEmpty}>
              Preview empty state
            </button>
          </div>
          <section className="panel admin-table-panel">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Policy</th>
                    <th>Category</th>
                    <th>Version</th>
                    <th>Owner</th>
                    <th>Updated</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy.id}>
                      <td>
                        <div className="table-person">
                          <span className="table-doc-icon">
                            <FileText size={16} />
                          </span>
                          <span>
                            <strong>{policy.title}</strong>
                            <small>{policy.pages ? `${policy.pages} pages` : 'Indexed'}</small>
                          </span>
                        </div>
                      </td>
                      <td>{policy.category}</td>
                      <td className="mono">{policy.version}</td>
                      <td>{policy.owner}</td>
                      <td>{policy.updated}</td>
                      <td>
                        <StatusBadge status={policy.status} kind="generic" />
                      </td>
                      <td>
                        <button className="icon-button" onClick={() => notify(`Viewing "${policy.title}".`)}>
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function CompliancePage({
  requirements,
  onOpenAdd,
  onOpenSendReminders,
}: {
  requirements: ComplianceReqItem[]
  onOpenAdd: () => void
  onOpenSendReminders: () => void
}) {
  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Rules & deadlines"
        title="Compliance"
        description="Set the requirement, audience, and deadline that powers your review queue."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <ActionButton variant="secondary" icon={<Mail size={15} />} onClick={onOpenSendReminders}>
              Send Reminders
            </ActionButton>
            <ActionButton icon={<Plus size={16} />} onClick={onOpenAdd}>
              Add requirement
            </ActionButton>
          </div>
        }
      />
      <div className="stat-grid stat-grid--three">
        <StatCard label="Requirements" value={requirements.length} note="Active in org" tone="violet" icon={<ShieldCheck size={17} />} />
        <StatCard
          label="Healthy"
          value={requirements.filter((r) => r.status === 'Healthy').length}
          note="On target this month"
          tone="teal"
          icon={<CheckCircle2 size={17} />}
        />
        <StatCard
          label="Needs attention"
          value={requirements.filter((r) => r.status === 'Needs attention').length}
          note="Review due dates"
          tone="amber"
          icon={<CircleHelp size={17} />}
        />
      </div>
      <section className="panel admin-table-panel">
        <div className="panel__header">
          <div>
            <div className="eyebrow">Active requirements</div>
            <h3>What the organization expects</h3>
          </div>
        </div>
        <div className="requirement-list">
          {requirements.map((item) => (
            <div className="requirement-row" key={item.id}>
              <span
                className={`requirement-icon requirement-icon--${
                  item.status === 'Healthy' ? 'healthy' : 'attention'
                }`}
              >
                {item.status === 'Healthy' ? <Check size={16} /> : <CircleHelp size={16} />}
              </span>
              <div className="requirement-row__name">
                <strong>{item.title}</strong>
                <span>
                  {item.audience} · {item.cadence}
                </span>
              </div>
              <div>
                <span className="eyebrow">Deadline</span>
                <strong>{item.deadline}</strong>
              </div>
              <div className="requirement-row__progress">
                <ProgressBar value={item.completion} />
                <span>{item.completion}%</span>
              </div>
              <StatusBadge status={item.status} kind="generic" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ReportsPage({
  employees,
  notify,
  onOpenAuditLog,
}: {
  employees: EmployeeRecord[]
  notify: (msg: string) => void
  onOpenAuditLog: () => void
}) {
  const exportReport = () => {
    const headers = 'Employee,Role,Department,Manager,Start Date,Progress,Status,Overdue Items\n'
    const rows = employees
      .map(
        (e) =>
          `"${e.name}","${e.role}","${e.department}","${e.manager}","${e.startDate}","${e.progress}%","${e.status}","${e.overdue}"`
      )
      .join('\n')
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `complypilot-audit-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    complyStore.logAudit(
      'Grace Kim',
      'hr_admin',
      'report_exported',
      'audit_log',
      `export-${Date.now()}`,
      'Full compliance CSV audit report export',
      { employeeCount: employees.length }
    )

    notify('Audit CSV report downloaded and logged to audit trail.')
  }

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Audit-ready exports"
        title="Reports"
        description="Generate a clean snapshot for audits, leadership reviews, or a compliance handoff."
        action={
          <ActionButton icon={<Download size={16} />} onClick={exportReport}>
            Export CSV
          </ActionButton>
        }
      />
      <div className="report-builder panel">
        <div className="report-builder__intro">
          <span className="report-builder__icon">
            <Table2 size={21} />
          </span>
          <div>
            <div className="eyebrow eyebrow--violet">Report builder</div>
            <h3>Organization compliance snapshot</h3>
            <p>Export live compliance, onboarding progress, and overdue counts.</p>
          </div>
        </div>
        <div className="report-fields">
          <label>
            Population
            <select>
              <option>All active employees ({employees.length})</option>
              <option>Needs attention only</option>
              <option>New hires in last 30 days</option>
            </select>
          </label>
          <label>
            As of date
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </label>
          <label>
            Format
            <select>
              <option>CSV · audit-friendly</option>
            </select>
          </label>
        </div>
        <div className="report-builder__footer">
          <span>
            <CheckCircle2 size={16} /> Includes employee identity, manager, status, due dates, and review timestamps
          </span>
          <ActionButton variant="soft" onClick={exportReport}>
            Download CSV Report <ArrowRight size={15} />
          </ActionButton>
        </div>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <div className="eyebrow">Recent exports & audit log</div>
            <h3>Report history</h3>
          </div>
          <button className="text-button" onClick={onOpenAuditLog}>
            <History size={14} /> View full audit log <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="export-list">
          <div>
            <span className="export-icon">
              <FileText size={16} />
            </span>
            <div>
              <strong>September compliance snapshot.csv</strong>
              <span>Generated by Grace Kim · Sep 8, 2026</span>
            </div>
            <button className="text-button" onClick={exportReport}>
              Download <Download size={14} />
            </button>
          </div>
          <div>
            <span className="export-icon">
              <FileText size={16} />
            </span>
            <div>
              <strong>Manager conduct training report.csv</strong>
              <span>Generated by Grace Kim · Aug 31, 2026</span>
            </div>
            <button className="text-button" onClick={exportReport}>
              Download <Download size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function SettingsPage({ notify, onReset }: { notify: (message: string) => void; onReset: () => void }) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Organization controls"
        title="Settings"
        description="Keep the organization context behind your onboarding workspace current."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <ActionButton variant="secondary" icon={<RotateCcw size={15} />} onClick={onReset}>
              Reset Demo Data
            </ActionButton>
            <ActionButton
              onClick={() => {
                setSaved(true)
                notify('Organization settings saved.')
              }}
            >
              Save changes
            </ActionButton>
          </div>
        }
      />
      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="panel__header">
            <div>
              <div className="eyebrow">Organization profile</div>
              <h3>Northstar Systems</h3>
            </div>
            <Settings size={18} className="muted-icon" />
          </div>
          <label>
            Organization name
            <input defaultValue="Northstar Systems" />
          </label>
          <label>
            Default timezone
            <select defaultValue="America/Los_Angeles">
              <option value="America/Los_Angeles">Pacific Time · UTC−08:00</option>
              <option value="America/New_York">Eastern Time · UTC−05:00</option>
            </select>
          </label>
          <label>
            Support channel
            <input defaultValue="peopleops@northstar.example" />
          </label>
          {saved && (
            <span className="saved-note">
              <CheckCircle2 size={14} /> Saved just now
            </span>
          )}
        </section>

        <section className="panel settings-card">
          <div className="panel__header">
            <div>
              <div className="eyebrow">Departments</div>
              <h3>Workspace structure</h3>
            </div>
            <ActionButton variant="soft" icon={<Plus size={14} />}>
              Add
            </ActionButton>
          </div>
          {['Operations', 'Engineering', 'Customer Success', 'People'].map((department, index) => (
            <div className="settings-row" key={department}>
              <span className="settings-row__handle">⠿</span>
              <strong>{department}</strong>
              <span>{[18, 42, 31, 7][index]} employees</span>
              <button className="icon-button">
                <MoreHorizontal size={16} />
              </button>
            </div>
          ))}
        </section>

        <section className="panel settings-card">
          <div className="panel__header">
            <div>
              <div className="eyebrow">Roles & access</div>
              <h3>Who sees what</h3>
            </div>
            <Users size={18} className="muted-icon" />
          </div>
          {[
            ['Employee', 'Own checklist, documents, policy chat'],
            ['Manager', 'Employee view plus direct reports'],
            ['HR Admin', 'Organization-wide compliance console'],
          ].map(([name, detail]) => (
            <div className="role-row" key={name}>
              <span className="role-row__mark">
                {name === 'HR Admin' ? <ShieldCheck size={15} /> : name === 'Manager' ? <Users size={15} /> : <BriefcaseBusiness size={15} />}
              </span>
              <div>
                <strong>{name}</strong>
                <span>{detail}</span>
              </div>
              <button className="icon-button">
                <ChevronRight size={15} />
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
