import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Edit2,
  FileCheck2,
  FileText,
  Filter,
  FolderOpen,
  Info,
  ListChecks,
  Mail,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, EmptyState, PageHeading, ProgressBar, SkeletonRows, StatCard, StatusPill } from '../components';
import {
  complianceItems,
  type Employee,
  type OnboardingTemplate,
  type Task,
  type TemplateTask,
} from '../data';
import { useDemo } from '../state';


export function AdminDashboard() {
  const { employees: employeeRows } = useDemo();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 360); return () => window.clearTimeout(timer); }, []);
  const filtered = employeeRows.filter((employee) => (employee.name.toLowerCase().includes(query.toLowerCase()) || employee.department.toLowerCase().includes(query.toLowerCase())) && (status === 'All statuses' || employee.status === status));
  return <>
    <PageHeading eyebrow="PEOPLE OPERATIONS · WEDNESDAY, OCTOBER 7" title="Organization overview" description="A live view of onboarding progress and compliance follow-through." action={<span className="button button-secondary"><CalendarDays size={15} /> Last 30 days</span>} />
    <div className="admin-alert"><span className="admin-alert-icon"><CircleAlert size={16} /></span><div><strong>12 compliance items are overdue</strong><span>Review deadlines and follow up with owners to keep the record complete.</span></div><Link to="/admin/compliance" className="admin-alert-link">Review items <ArrowRight size={14} /></Link></div>
    <div className="stat-grid admin-stat-grid">
      <StatCard label="Active employees" value="124" note="Across 6 departments" icon={Users} tone="green" />
      <StatCard label="Onboarding complete" value="96%" note="+4.2% from last month" icon={CheckCircle2} tone="blue" />
      <StatCard label="Items in review" value="18" note="12 documents · 6 acknowledgements" icon={Clock3} tone="amber" />
      <StatCard label="Overdue items" value="12" note="8 employees need a follow-up" icon={CircleAlert} tone="slate" />
    </div>
    <div className="admin-overview-grid">
      <section className="surface-card admin-activity-card"><div className="admin-card-header"><div><h2>Onboarding completion</h2><p>Assigned tasks completed across new hires</p></div><button className="icon-button" aria-label="Clear employee filters" title="Clear employee filters" onClick={() => { setQuery(''); setStatus('All statuses'); }}><SlidersHorizontal size={15} /></button></div><div className="chart-header-row"><div><strong>84%</strong><span className="chart-change"><ArrowUpRight size={13} /> 8% <small>vs. previous period</small></span></div><span className="chart-period">LAST 6 WEEKS</span></div><div className="bar-chart" role="img" aria-label="Onboarding completion trend: 62, 69, 71, 76, 78, 84 percent over six weeks.">{[62, 69, 71, 76, 78, 84].map((height, index) => <div className="chart-bar-group" key={index}><div className="chart-bar-bg"><span className={index === 5 ? 'chart-bar chart-bar-current' : 'chart-bar'} style={{ height: `${height}%` }} /></div><small>{['Aug 31', 'Sep 7', 'Sep 14', 'Sep 21', 'Sep 28', 'Oct 5'][index]}</small></div>)}</div><div className="chart-legend"><span><i className="legend-dot legend-done" />Completion rate</span><span><i className="legend-dot legend-open" />Goal · 90%</span></div></section>
      <section className="surface-card attention-card"><div className="admin-card-header"><div><h2>Needs attention</h2><p>Items to look at this week</p></div><span className="attention-total">3</span></div><div className="attention-list"><Link to="/admin/employees/CP-1050" className="attention-row"><span className="attention-symbol attention-amber"><Clock3 size={15} /></span><span><strong>Amara Johnson</strong><small>2 overdue onboarding items</small></span><ChevronRight size={15} /></Link><Link to="/admin/compliance" className="attention-row"><span className="attention-symbol attention-rose"><CircleAlert size={15} /></span><span><strong>Handbook acknowledgement</strong><small>6 employees past due</small></span><ChevronRight size={15} /></Link><Link to="/admin/policies" className="attention-row"><span className="attention-symbol attention-blue"><FileText size={15} /></span><span><strong>3 documents awaiting review</strong><small>Oldest submitted 2 days ago</small></span><ChevronRight size={15} /></Link></div><Link to="/admin/reports" className="attention-footer">Open compliance reports <ArrowRight size={14} /></Link></section>
    </div>
    <section className="surface-card admin-employee-card"><div className="admin-card-header admin-table-heading"><div><h2>Recent onboarding</h2><p>Progress and status for your newest employees</p></div><Link className="text-link" to="/admin/employees">View all employees <ArrowRight size={14} /></Link></div><div className="table-toolbar"><label className="search-field"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employees or departments" /></label><div className="table-toolbar-actions"><button className="button button-secondary button-small" onClick={() => { setQuery(''); setStatus('All statuses'); }}><Filter size={14} /> Reset</button><select className="table-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option><option>On track</option><option>Needs attention</option><option>Complete</option></select></div></div><div className="table-wrap">{loading ? <SkeletonRows count={5} /> : <EmployeeTable rows={filtered.slice(0, 5)} />}</div><div className="table-bottom-row"><span>Showing {filtered.slice(0, 5).length} of {employeeRows.length} employees</span><Link to="/admin/employees" className="table-bottom-link">Open directory <ArrowRight size={13} /></Link></div></section>
  </>;
}

function EmployeeTable({ rows }: { rows: Employee[] }) {
  return <table className="data-table employee-table"><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>START DATE</th><th>ONBOARDING</th><th>STATUS</th><th></th></tr></thead><tbody>{rows.map((employee, index) => <tr key={employee.id}><td><Link className="table-person" to={`/admin/employees/${employee.id}`}><Avatar initials={employee.initials} size="sm" color={['sage', 'blue', 'rose', 'gold', 'violet'][index % 5]} /><span><strong>{employee.name}</strong><small>{employee.email}</small></span></Link></td><td>{employee.department}</td><td>{employee.startDate}</td><td><div className="table-progress-cell"><ProgressBar value={employee.progress} compact /><small>{employee.progress}%</small></div></td><td><StatusPill status={employee.status} /></td><td><Link to={`/admin/employees/${employee.id}`} className="icon-button" aria-label={`Open ${employee.name}`}><ChevronRight size={16} /></Link></td></tr>)}</tbody></table>;
}

export function EmployeeDirectoryPage() {
  const { employees: employeeRows, addEmployee } = useDemo();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [department, setDepartment] = useState('Product');
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 360); return () => window.clearTimeout(timer); }, []);
  const filtered = employeeRows.filter((employee) => {
    const matchQuery = `${employee.name} ${employee.email} ${employee.department} ${employee.role}`.toLowerCase().includes(query.toLowerCase());
    return matchQuery && (status === 'All statuses' || employee.status === status);
  });
  function submitEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullName = newName.trim();
    addEmployee({ name: fullName, email: newEmail.trim(), department, role: 'New team member', manager: 'Jordan Lee', startDate: 'Oct 12, 2026', progress: 0, status: 'On track' });
    setNewName(''); setNewEmail(''); setShowAdd(false); setQuery(''); setStatus('All statuses');
  }
  return <>
    <PageHeading eyebrow="PEOPLE DIRECTORY" title="Employees" description="View onboarding progress, find a teammate, or open an employee record." action={<button className="button button-primary" onClick={() => setShowAdd((value) => !value)}><Plus size={15} /> {showAdd ? 'Close form' : 'Add employee'}</button>} />
    {showAdd && <form className="surface-card inline-create-form employee-create-form" onSubmit={submitEmployee}><div><strong>Add a demo employee</strong><p>Creates a local sample row only; no invitation is sent.</p></div><input className="field-input" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Full name" required /><input className="field-input" type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="Work email" required /><select className="field-input" value={department} onChange={(event) => setDepartment(event.target.value)}><option>Product</option><option>Engineering</option><option>People &amp; Culture</option><option>Operations</option><option>Customer Experience</option></select><button className="button button-primary button-small" type="submit">Add to demo</button></form>}
    <section className="surface-card employee-directory-card"><div className="table-toolbar"><label className="search-field"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, role, or department" /></label><div className="table-toolbar-actions"><select className="table-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by onboarding status"><option>All statuses</option><option>On track</option><option>Needs attention</option><option>Complete</option></select><button className="button button-secondary button-small" onClick={() => { setQuery(''); setStatus('All statuses'); }}><Filter size={14} /> Reset</button></div></div><div className="table-wrap">{loading ? <SkeletonRows count={6} /> : filtered.length ? <EmployeeTable rows={filtered} /> : <EmptyState icon={Search} title="No employees match that search" body="Try another name, role, or status filter." />}</div><div className="table-bottom-row"><span>{filtered.length} employees</span><span className="pagination-demo">Page 1 of 1 <button className="icon-button" aria-label="Previous page" disabled><ArrowLeft size={14} /></button><button className="icon-button" aria-label="Next page" disabled><ArrowRight size={14} /></button></span></div></section>
  </>;
}

export function EmployeeDetailPage() {
  const { id } = useParams();
  const {
    documents,
    setDocumentStatus,
    employees: employeeRows,
    getEmployeeTasks,
    updateEmployeeTaskDate,
    addAdHocTask,
    taskAuditLogs,
  } = useDemo();
  const employee = employeeRows.find((item) => item.id.toLowerCase() === id?.toLowerCase());
  const [saved, setSaved] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDateValue, setEditDateValue] = useState('');
  const [editReasonValue, setEditReasonValue] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [showAdHocForm, setShowAdHocForm] = useState(false);
  const [adHocTitle, setAdHocTitle] = useState('');
  const [adHocCategory, setAdHocCategory] = useState('Compliance');
  const [adHocDue, setAdHocDue] = useState('Due in 7 days');
  const [adHocDesc, setAdHocDesc] = useState('');

  if (!employee) {
    return (
      <>
        <PageHeading
          eyebrow="EMPLOYEE RECORD"
          title="Employee not found"
          description="Choose an employee from the directory to open a record."
        />
        <Link to="/admin/employees" className="button button-secondary">
          <ArrowLeft size={15} /> Back to employees
        </Link>
      </>
    );
  }

  const currentEmployee = employee;
  const currentEmployeeId = employee.id;
  const employeeTasks = getEmployeeTasks(currentEmployee);
  const reviewable =
    currentEmployeeId === 'CP-1048'
      ? documents.filter((document) => document.status === 'uploaded' || document.status === 'pending-review')
      : [];

  const employeeAuditLogs = taskAuditLogs.filter((log) => log.employeeId === currentEmployeeId);

  function startEditTask(task: Task) {
    setEditingTaskId(task.id);
    setEditDateValue(task.due);
    setEditReasonValue('');
  }

  function saveTaskDate(taskId: string) {
    if (!editDateValue.trim()) return;
    updateEmployeeTaskDate(currentEmployeeId, taskId, editDateValue.trim(), editReasonValue.trim());
    setEditingTaskId(null);
    setSaveNotice('Due date updated and logged to audit trail');
    window.setTimeout(() => setSaveNotice(''), 3000);
  }

  function handleAddAdHoc(e: FormEvent) {
    e.preventDefault();
    if (!adHocTitle.trim()) return;
    addAdHocTask(currentEmployeeId, adHocTitle.trim(), adHocCategory, adHocDue.trim(), adHocDesc.trim());
    setAdHocTitle('');
    setAdHocDesc('');
    setShowAdHocForm(false);
    setSaveNotice('Ad-hoc task created and logged to audit trail');
    window.setTimeout(() => setSaveNotice(''), 3000);
  }

  function applyPreset(presetText: string) {
    setEditDateValue(presetText);
  }

  return (
    <>
      <div className="detail-back">
        <Link to="/admin/employees">
          <ArrowLeft size={14} /> All employees
        </Link>
        <span>/</span>
        <span>{employee.name}</span>
      </div>
      <PageHeading
        eyebrow={`EMPLOYEE RECORD · ${employee.id}`}
        title={employee.name}
        description={`${employee.role} · ${employee.department}`}
        action={
          <button
            className="button button-secondary"
            onClick={() => {
              setSaved(true);
              window.setTimeout(() => setSaved(false), 1800);
            }}
          >
            {saved ? <Check size={15} /> : <Mail size={15} />}
            {saved ? 'Note saved' : 'Add a note'}
          </button>
        }
      />
      <div className="employee-detail-grid">
        <section className="surface-card employee-profile-summary">
          <div className="detail-profile-top">
            <Avatar initials={employee.initials} size="lg" color="blue" />
            <div>
              <h2>{employee.name}</h2>
              <p>{employee.role}</p>
              <StatusPill status={employee.status} />
            </div>
          </div>
          <div className="detail-meta-grid">
            <div>
              <span>Department</span>
              <strong>{employee.department}</strong>
            </div>
            <div>
              <span>Manager</span>
              <strong>{employee.manager}</strong>
            </div>
            <div>
              <span>Start date</span>
              <strong>{employee.startDate}</strong>
            </div>
            <div>
              <span>Work email</span>
              <strong>{employee.email}</strong>
            </div>
          </div>
          <div className="employee-detail-progress">
            <div className="progress-label">
              <span>Onboarding progress</span>
              <strong>{employee.progress}%</strong>
            </div>
            <ProgressBar value={employee.progress} compact />
          </div>
        </section>
        <section className="surface-card review-card">
          <div className="admin-card-header">
            <div>
              <h2>Documents to review</h2>
              <p>Review and update the status below</p>
            </div>
            <span className="attention-total">{reviewable.length}</span>
          </div>
          {reviewable.length ? (
            <div className="review-doc-list">
              {reviewable.map((document) => (
                <div className="review-doc-row" key={document.id}>
                  <span className="document-icon">
                    <FileText size={16} />
                  </span>
                  <div>
                    <strong>{document.name}</strong>
                    <small>
                      {document.type} · {document.date}
                    </small>
                  </div>
                  <div className="review-actions">
                    <button
                      className="review-approve"
                      onClick={() => setDocumentStatus(document.id, 'approved')}
                      aria-label={`Approve ${document.name}`}
                    >
                      <Check size={15} />
                    </button>
                    <button
                      className="review-reject"
                      onClick={() => setDocumentStatus(document.id, 'rejected')}
                      aria-label={`Reject ${document.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BadgeCheck}
              title="No items waiting for review"
              body="New submissions will appear here when they need your attention."
            />
          )}
        </section>
      </div>

      {saveNotice && (
        <div className="inline-success date-update-banner">
          <CheckCircle2 size={15} /> {saveNotice}
        </div>
      )}

      <div className="employee-history-grid">
        <section className="surface-card detail-tasks">
          <div className="admin-card-header">
            <div>
              <h2>Onboarding checklist & deadlines</h2>
              <p>HR Admin can adjust task deadlines or add ad-hoc tasks with full audit logging</p>
            </div>
            <div className="header-action-group">
              <button
                className="button button-secondary button-small"
                onClick={() => setShowAdHocForm((v) => !v)}
              >
                <Plus size={13} /> {showAdHocForm ? 'Cancel' : 'Add ad-hoc task'}
              </button>
              <Link className="text-link" to="/admin/templates">
                Templates <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {showAdHocForm && (
            <form className="surface-card inline-create-form" onSubmit={handleAddAdHoc}>
              <div>
                <strong>Add an ad-hoc task for this employee</strong>
                <p>Creates a task instance and appends a record to the audit trail.</p>
              </div>
              <input
                className="field-input"
                placeholder="Task title (e.g. Complete state tax withholding form)"
                value={adHocTitle}
                onChange={(e) => setAdHocTitle(e.target.value)}
                required
              />
              <div className="grid-two-col">
                <select
                  className="field-input"
                  value={adHocCategory}
                  onChange={(e) => setAdHocCategory(e.target.value)}
                >
                  <option>Compliance</option>
                  <option>Documents</option>
                  <option>IT & Equipment</option>
                  <option>Getting started</option>
                  <option>Payroll</option>
                </select>
                <input
                  className="field-input"
                  placeholder="Due date (e.g. Due Oct 24, 2026)"
                  value={adHocDue}
                  onChange={(e) => setAdHocDue(e.target.value)}
                  required
                />
              </div>
              <textarea
                className="field-textarea"
                placeholder="Instructions or notes for the employee..."
                value={adHocDesc}
                onChange={(e) => setAdHocDesc(e.target.value)}
                rows={2}
              />
              <div className="form-action-row">
                <button className="button button-primary button-small" type="submit">
                  <Plus size={13} /> Add to checklist
                </button>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => setShowAdHocForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {employeeTasks.length ? (
            <div className="task-deadline-list">
              {employeeTasks.map((task) => (
                <div className="detail-task-block" key={task.id}>
                  <div className="detail-task-row">
                    <span className={`task-state-mark state-${task.status}`} />
                    <div className="detail-task-content">
                      <div className="detail-task-header-line">
                        <strong>{task.title}</strong>
                        <span className="task-category-pill">{task.category}</span>
                      </div>
                      <span className="task-due-chip">
                        <CalendarDays size={12} /> {task.due}
                      </span>
                    </div>
                    <StatusPill status={task.status} />
                    <button
                      className="button button-quiet button-small edit-date-trigger"
                      onClick={() => (editingTaskId === task.id ? setEditingTaskId(null) : startEditTask(task))}
                      aria-label={`Edit due date for ${task.title}`}
                      title="Adjust task deadline"
                    >
                      <Calendar size={13} /> Edit date
                    </button>
                  </div>

                  {editingTaskId === task.id && (
                    <div className="task-date-editor-card">
                      <div className="date-editor-header">
                        <Calendar size={14} />
                        <span>Adjust deadline for: <strong>{task.title}</strong></span>
                      </div>
                      <div className="date-preset-row">
                        <span className="preset-label">Quick presets:</span>
                        <button type="button" className="preset-btn" onClick={() => applyPreset('Due today')}>Today</button>
                        <button type="button" className="preset-btn" onClick={() => applyPreset('Due in 3 days')}>+3 days</button>
                        <button type="button" className="preset-btn" onClick={() => applyPreset('Due in 7 days')}>+1 week</button>
                        <button type="button" className="preset-btn" onClick={() => applyPreset('Due in 14 days')}>+2 weeks</button>
                        <button type="button" className="preset-btn" onClick={() => applyPreset('Due Oct 20, 2026')}>Oct 20</button>
                        <button type="button" className="preset-btn" onClick={() => applyPreset('Due Oct 31, 2026')}>End of month</button>
                      </div>
                      <div className="date-editor-fields">
                        <div className="field-group">
                          <label htmlFor={`due-input-${task.id}`}>New deadline / due date</label>
                          <input
                            id={`due-input-${task.id}`}
                            className="field-input"
                            value={editDateValue}
                            onChange={(e) => setEditDateValue(e.target.value)}
                            placeholder="e.g. Due Fri, Oct 16 or 2026-10-20"
                            required
                          />
                        </div>
                        <div className="field-group">
                          <label htmlFor={`reason-input-${task.id}`}>Reason for change (audit trail)</label>
                          <input
                            id={`reason-input-${task.id}`}
                            className="field-input"
                            value={editReasonValue}
                            onChange={(e) => setEditReasonValue(e.target.value)}
                            placeholder="e.g. Employee requested extension / Start date shifted"
                          />
                        </div>
                      </div>
                      <div className="date-editor-actions">
                        <button
                          type="button"
                          className="button button-primary button-small"
                          onClick={() => saveTaskDate(task.id)}
                        >
                          <Check size={13} /> Save deadline
                        </button>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => setEditingTaskId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No checklist history yet"
              body="A plan will appear here once one is assigned to this employee."
            />
          )}
        </section>

        <section className="surface-card history-card">
          <div className="admin-card-header">
            <div>
              <h2>Audit trail & activity</h2>
              <p>Live record of deadline edits and compliance steps</p>
            </div>
          </div>
          <div className="history-timeline">
            {employeeAuditLogs.map((log) => (
              <div className="history-item audit-log-item" key={log.id}>
                <span className="history-dot done">
                  <Calendar size={11} />
                </span>
                <div>
                  <strong>Deadline updated: {log.taskTitle}</strong>
                  <small>
                    Changed from <em>{log.oldDue}</em> to <strong>{log.newDue}</strong>
                  </small>
                  <small className="audit-subtext">
                    {log.reason ? `${log.reason} · ` : ''}By {log.actor} · {log.timestamp}
                  </small>
                </div>
              </div>
            ))}
            <div className="history-item">
              <span className="history-dot done">
                <Check size={11} />
              </span>
              <div>
                <strong>Onboarding plan assigned</strong>
                <small>{employee.startDate} · System default template</small>
              </div>
            </div>
            <div className="history-item">
              <span className="history-dot done">
                <Check size={11} />
              </span>
              <div>
                <strong>Welcome message sent</strong>
                <small>{employee.startDate} · People Operations</small>
              </div>
            </div>
            <div className="history-item">
              <span className="history-dot pending">
                <Clock3 size={11} />
              </span>
              <div>
                <strong>Document review pending</strong>
                <small>Oct 6, 2026 · Awaiting HR review</small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export function TemplatesPage() {
  const {
    templates,
    updateTemplate,
    updateTemplateTask,
    addTemplateTask,
    deleteTemplateTask,
    addTemplate,
  } = useDemo();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateGroup, setNewTemplateGroup] = useState('All teams');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Task editing state inside template
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskCategory, setEditTaskCategory] = useState('Getting started');
  const [editTaskDue, setEditTaskDue] = useState('Day 1');
  const [editTaskOwner, setEditTaskOwner] = useState<'Employee' | 'Manager' | 'HR Admin' | 'IT'>('Employee');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskRequired, setEditTaskRequired] = useState(true);

  // New task addition state
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Getting started');
  const [newTaskDue, setNewTaskDue] = useState('Within 5 days');
  const [newTaskOwner, setNewTaskOwner] = useState<'Employee' | 'Manager' | 'HR Admin' | 'IT'>('Employee');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  const activeTemplate = templates.find((item) => item.id === editingTemplateId);

  function notify(msg: string) {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 3000);
  }

  function handleCreateTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTemplateName.trim()) return;
    addTemplate({
      name: newTemplateName.trim(),
      group: newTemplateGroup,
      status: 'Draft',
      tasks: [
        {
          id: `st-${Date.now()}`,
          title: 'Complete initial profile',
          category: 'Getting started',
          dueWindow: 'Day 1',
          description: 'Basic onboarding step for new hires.',
          owner: 'Employee',
          required: true,
        },
      ],
    });
    setNewTemplateName('');
    setShowCreateForm(false);
    notify('New draft template created');
  }

  function startEditTemplate(template: OnboardingTemplate) {
    setEditingTemplateId(template.id);
    setEditingTaskId(null);
    setShowAddTaskForm(false);
  }

  function startEditTask(task: TemplateTask) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskCategory(task.category);
    setEditTaskDue(task.dueWindow);
    setEditTaskOwner(task.owner || 'Employee');
    setEditTaskDesc(task.description);
    setEditTaskRequired(task.required ?? true);
  }

  function saveEditedTask(templateId: string, taskId: string) {
    if (!editTaskTitle.trim()) return;
    updateTemplateTask(templateId, taskId, {
      title: editTaskTitle.trim(),
      category: editTaskCategory,
      dueWindow: editTaskDue.trim(),
      owner: editTaskOwner,
      description: editTaskDesc.trim(),
      required: editTaskRequired,
    });
    setEditingTaskId(null);
    notify('Task updated in template');
  }

  function handleAddNewTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeTemplate || !newTaskTitle.trim()) return;
    addTemplateTask(activeTemplate.id, {
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      dueWindow: newTaskDue.trim(),
      owner: newTaskOwner,
      description: newTaskDesc.trim() || 'Complete this task per company guidelines.',
      required: true,
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskForm(false);
    notify('New task added to template');
  }

  function handleDeleteTask(templateId: string, taskId: string, taskTitle: string) {
    deleteTemplateTask(templateId, taskId);
    notify(`"${taskTitle}" removed from template`);
  }

  return (
    <>
      <PageHeading
        eyebrow="ONBOARDING DESIGN & TEMPLATES"
        title="Templates"
        description="Configure reusable onboarding checklists and edit steps within existing templates."
        action={
          <button className="button button-primary" onClick={() => setShowCreateForm((v) => !v)}>
            <Plus size={15} /> {showCreateForm ? 'Close form' : 'New template'}
          </button>
        }
      />

      {toastMessage && (
        <div className="inline-success date-update-banner">
          <CheckCircle2 size={15} /> {toastMessage}
        </div>
      )}

      {showCreateForm && (
        <form className="surface-card inline-create-form" onSubmit={handleCreateTemplate}>
          <div>
            <strong>Create a checklist template</strong>
            <p>Start with a name and target team. You can edit all tasks in the builder below.</p>
          </div>
          <input
            className="field-input"
            value={newTemplateName}
            onChange={(event) => setNewTemplateName(event.target.value)}
            placeholder="e.g. Engineering Onboarding · US Core"
            required
          />
          <select
            className="field-input"
            value={newTemplateGroup}
            onChange={(e) => setNewTemplateGroup(e.target.value)}
          >
            <option>All teams</option>
            <option>Managers</option>
            <option>Remote employees</option>
            <option>Engineering</option>
            <option>Product</option>
            <option>People & Culture</option>
          </select>
          <button className="button button-primary" type="submit">
            Create template <ArrowRight size={14} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Close"
            onClick={() => setShowCreateForm(false)}
          >
            <X size={16} />
          </button>
        </form>
      )}

      <div className="template-intro">
        <div className="template-intro-icon">
          <ListChecks size={18} />
        </div>
        <div>
          <strong>Customizable checklist templates</strong>
          <p>
            Templates define the standard tasks assigned to new hires. Select <em>Edit template</em> below to edit,
            add, or remove individual checklist steps.
          </p>
        </div>
        <Link className="button button-secondary button-small" to="/admin/onboarding">
          Open Onboarding Blueprint <ArrowUpRight size={13} />
        </Link>
      </div>

      <section className="template-grid">
        {templates.map((template) => (
          <article
            className={`surface-card template-card ${
              editingTemplateId === template.id ? 'template-card-active' : ''
            }`}
            key={template.id}
          >
            <div className="template-card-top">
              <span className="template-icon">
                <FolderOpen size={17} />
              </span>
              <StatusPill status={template.status} />
            </div>
            <div className="template-card-copy">
              <h2>{template.name}</h2>
              <p>{template.group}</p>
            </div>
            <div className="template-card-meta">
              <span>
                <ListChecks size={14} /> {template.tasks.length} tasks
              </span>
              <span>Edited {template.updated}</span>
            </div>
            <div className="template-card-footer">
              <button
                className={`button button-small ${
                  editingTemplateId === template.id ? 'button-primary' : 'button-secondary'
                }`}
                onClick={() =>
                  editingTemplateId === template.id
                    ? setEditingTemplateId(null)
                    : startEditTemplate(template)
                }
              >
                {editingTemplateId === template.id ? (
                  <>
                    <Check size={13} /> Editing tasks
                  </>
                ) : (
                  <>
                    <Edit2 size={13} /> Edit tasks ({template.tasks.length})
                  </>
                )}
              </button>
              <span className="template-usage">
                {template.status === 'Active' ? 'Active in onboarding' : 'Draft only'}
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* Comprehensive Template Tasks Editor */}
      {activeTemplate && (
        <section className="surface-card template-editor-full">
          <div className="template-editor-heading">
            <div>
              <span className="eyebrow">TEMPLATE TASK MANAGER</span>
              <h2>Editing: {activeTemplate.name}</h2>
              <p>
                Configure, rename, and edit every individual task in this template. Changes take effect
                for newly assigned plans.
              </p>
            </div>
            <div className="template-header-actions">
              <button
                className="button button-secondary button-small"
                onClick={() => {
                  updateTemplate(activeTemplate.id, {
                    status: activeTemplate.status === 'Active' ? 'Draft' : 'Active',
                  });
                  notify(`Template status changed to ${activeTemplate.status === 'Active' ? 'Draft' : 'Active'}`);
                }}
              >
                Toggle {activeTemplate.status === 'Active' ? 'Draft' : 'Active'}
              </button>
              <button
                className="icon-button"
                aria-label="Close template builder"
                onClick={() => setEditingTemplateId(null)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="template-stats-bar">
            <div className="template-stat-item">
              <span>Template Target</span>
              <strong>{activeTemplate.group}</strong>
            </div>
            <div className="template-stat-item">
              <span>Total Steps</span>
              <strong>{activeTemplate.tasks.length} tasks</strong>
            </div>
            <div className="template-stat-item">
              <span>Status</span>
              <StatusPill status={activeTemplate.status} />
            </div>
            <button
              className="button button-primary button-small add-step-toggle-btn"
              onClick={() => setShowAddTaskForm((v) => !v)}
            >
              <Plus size={14} /> {showAddTaskForm ? 'Cancel add' : 'Add task to template'}
            </button>
          </div>

          {/* Form to add a new task to template */}
          {showAddTaskForm && (
            <form className="surface-card template-add-task-form" onSubmit={handleAddNewTask}>
              <div className="form-title-row">
                <Sparkles size={16} />
                <strong>Add a new task to {activeTemplate.name}</strong>
              </div>
              <div className="form-grid-row">
                <label>
                  <span>Task title *</span>
                  <input
                    className="field-input"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Schedule team intro & coffee chat"
                    required
                  />
                </label>
                <label>
                  <span>Category</span>
                  <select
                    className="field-input"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                  >
                    <option>Getting started</option>
                    <option>Policies</option>
                    <option>Payroll</option>
                    <option>Documents</option>
                    <option>Benefits</option>
                    <option>Learning</option>
                    <option>People</option>
                    <option>IT</option>
                    <option>Planning</option>
                  </select>
                </label>
                <label>
                  <span>Due timeline</span>
                  <select
                    className="field-input"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                  >
                    <option>Day 1</option>
                    <option>Day 3</option>
                    <option>Within 5 days</option>
                    <option>Within 7 days</option>
                    <option>Within 10 days</option>
                    <option>Within 14 days</option>
                    <option>Within 30 days</option>
                    <option>Within 60 days</option>
                    <option>Within 90 days</option>
                  </select>
                </label>
                <label>
                  <span>Assigned owner</span>
                  <select
                    className="field-input"
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value as any)}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="HR Admin">HR Admin</option>
                    <option value="IT">IT</option>
                  </select>
                </label>
              </div>
              <label className="form-full-row">
                <span>Description & employee instructions</span>
                <textarea
                  className="field-textarea"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Explain what the new hire needs to do and where to find relevant links..."
                  rows={2}
                />
              </label>
              <div className="form-action-row">
                <button className="button button-primary button-small" type="submit">
                  <Plus size={14} /> Add task
                </button>
                <button
                  className="button button-secondary button-small"
                  type="button"
                  onClick={() => setShowAddTaskForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of Tasks with Edit Options */}
          <div className="template-task-cards-list">
            <div className="template-task-list-header">
              <span>EXISTING CHECKLIST TASKS IN THIS TEMPLATE</span>
              <small>Click "Edit task" to modify title, timeline, owner, or description</small>
            </div>

            {activeTemplate.tasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No tasks in this template yet"
                body="Use the button above to add your first checklist step."
              />
            ) : (
              activeTemplate.tasks.map((task, index) => (
                <div
                  className={`template-task-item ${
                    editingTaskId === task.id ? 'template-task-item-editing' : ''
                  }`}
                  key={task.id}
                >
                  <div className="template-task-main-row">
                    <span className="task-step-number">{String(index + 1).padStart(2, '0')}</span>
                    <div className="template-task-title-block">
                      <div className="template-task-topline">
                        <strong>{task.title}</strong>
                        <span className="task-category-pill">{task.category}</span>
                        <span className="task-owner-pill">
                          <Tag size={11} /> {task.owner || 'Employee'}
                        </span>
                        {task.required && <span className="task-required-tag">Required</span>}
                      </div>
                      <p className="template-task-desc">{task.description}</p>
                    </div>
                    <div className="template-task-due-block">
                      <Clock3 size={13} />
                      <span>{task.dueWindow}</span>
                    </div>
                    <div className="template-task-actions">
                      <button
                        className="button button-secondary button-small edit-task-btn"
                        onClick={() =>
                          editingTaskId === task.id ? setEditingTaskId(null) : startEditTask(task)
                        }
                        aria-label={`Edit task ${task.title}`}
                        title="Edit this task"
                      >
                        <Edit2 size={13} /> {editingTaskId === task.id ? 'Cancel' : 'Edit task'}
                      </button>
                      <button
                        className="icon-button delete-task-btn"
                        onClick={() => handleDeleteTask(activeTemplate.id, task.id, task.title)}
                        aria-label={`Delete ${task.title}`}
                        title="Remove task from template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Task Editor */}
                  {editingTaskId === task.id && (
                    <div className="inline-task-editor-card">
                      <div className="editor-card-heading">
                        <Edit2 size={14} />
                        <span>Editing step: <strong>{task.title}</strong></span>
                      </div>
                      <div className="editor-inputs-grid">
                        <label>
                          <span>Task title</span>
                          <input
                            className="field-input"
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            required
                          />
                        </label>
                        <label>
                          <span>Category</span>
                          <select
                            className="field-input"
                            value={editTaskCategory}
                            onChange={(e) => setEditTaskCategory(e.target.value)}
                          >
                            <option>Getting started</option>
                            <option>Policies</option>
                            <option>Payroll</option>
                            <option>Documents</option>
                            <option>Benefits</option>
                            <option>Learning</option>
                            <option>People</option>
                            <option>IT</option>
                            <option>Planning</option>
                          </select>
                        </label>
                        <label>
                          <span>Due timeline / window</span>
                          <input
                            className="field-input"
                            value={editTaskDue}
                            onChange={(e) => setEditTaskDue(e.target.value)}
                            placeholder="e.g. Day 1, Within 5 days"
                            required
                          />
                        </label>
                        <label>
                          <span>Assigned owner</span>
                          <select
                            className="field-input"
                            value={editTaskOwner}
                            onChange={(e) => setEditTaskOwner(e.target.value as any)}
                          >
                            <option value="Employee">Employee</option>
                            <option value="Manager">Manager</option>
                            <option value="HR Admin">HR Admin</option>
                            <option value="IT">IT</option>
                          </select>
                        </label>
                      </div>
                      <label className="editor-textarea-label">
                        <span>Instructions / Description</span>
                        <textarea
                          className="field-textarea"
                          value={editTaskDesc}
                          onChange={(e) => setEditTaskDesc(e.target.value)}
                          rows={2}
                        />
                      </label>
                      <div className="editor-controls-row">
                        <label className="checkbox-control">
                          <input
                            type="checkbox"
                            checked={editTaskRequired}
                            onChange={(e) => setEditTaskRequired(e.target.checked)}
                          />
                          <span>Mandatory compliance / onboarding step</span>
                        </label>
                        <div className="editor-save-actions">
                          <button
                            type="button"
                            className="button button-primary button-small"
                            onClick={() => saveEditedTask(activeTemplate.id, task.id)}
                          >
                            <Check size={13} /> Save task changes
                          </button>
                          <button
                            type="button"
                            className="button button-secondary button-small"
                            onClick={() => setEditingTaskId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="template-editor-footer">
            <span className="save-hint">
              <CheckCircle2 size={14} /> Changes are automatically saved to the active template.
            </span>
            <button
              className="button button-primary button-small"
              onClick={() => {
                setEditingTemplateId(null);
                notify(`Template "${activeTemplate.name}" published with ${activeTemplate.tasks.length} tasks`);
              }}
            >
              Done editing template
            </button>
          </div>
        </section>
      )}

      <div className="template-note">
        <Info size={14} />
        Templates keep employee onboarding consistent while allowing role-based and department customizations.
      </div>
    </>
  );
}


export function PoliciesPage() {
  const { policies: localPolicies, addPolicy, togglePolicy, removePolicy } = useDemo();
  const [query, setQuery] = useState('');
  const [policyStatus, setPolicyStatus] = useState('All statuses');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 360); return () => window.clearTimeout(timer); }, []);
  function addPolicyFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; addPolicy({ title: file.name.replace(/\.[^.]+$/, ''), section: 'New sample policy', body: 'This is a local placeholder for the selected file. No document was transmitted.' }); event.target.value = ''; }
  const shown = localPolicies.filter((policy) => `${policy.title} ${policy.section}`.toLowerCase().includes(query.toLowerCase()) && (policyStatus === 'All statuses' || policy.status === policyStatus));
  return <>
    <PageHeading eyebrow="POLICY LIBRARY" title="Policies" description="Manage the policy sources used in the sample Q&A experience." action={<><input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.doc,.docx" onChange={addPolicyFile} /><button className="button button-primary" onClick={() => inputRef.current?.click()}><Upload size={15} /> Add policy</button></>} />
    <div className="policy-banner"><div className="policy-banner-icon"><ShieldCheck size={18} /></div><div><strong>Source-linked answers</strong><p>Published sample sources are available to the policy assistant; selected files are represented by local demo placeholders.</p></div><Link to="/app/ask" className="text-link">View chat <ArrowRight size={14} /></Link></div>
    <section className="surface-card policy-library"><div className="table-toolbar"><div><strong className="surface-card-title">Policy documents</strong><p className="surface-card-subtitle">{localPolicies.length} sources in the demo library</p></div><div className="table-toolbar-actions"><label className="search-field"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search policies" /></label><select className="table-select" value={policyStatus} onChange={(event) => setPolicyStatus(event.target.value)} aria-label="Filter policies by status"><option>All statuses</option><option>Published</option><option>Draft</option></select></div></div>{loading ? <div className="policy-list"><SkeletonRows count={3} /></div> : localPolicies.length === 0 ? <EmptyState icon={FileText} title="No policies uploaded yet" body="Add a policy to create a sample library source." action={<button className="button button-secondary" onClick={() => inputRef.current?.click()}><Upload size={14} /> Add a policy</button>} /> : shown.length ? <div className="policy-list">{shown.map((policy) => <div className="policy-row" key={policy.id}><span className="policy-file-icon"><FileText size={17} /></span><div className="policy-row-copy"><strong>{policy.title}</strong><small>{policy.section} <span>·</span> {policy.updated}</small></div><StatusPill status={policy.status} /><button className="button button-quiet button-small" onClick={() => togglePolicy(policy.id)}>{policy.status === 'Published' ? 'Pause' : 'Publish'} <ArrowUpRight size={13} /></button><button className="icon-button" aria-label={`Remove ${policy.title}`} onClick={() => removePolicy(policy.id)}><X size={14} /></button></div>)}</div> : <EmptyState icon={Search} title="No policy matches" body="Try another title or status filter." />}</section>
    <div className="policy-upload-note"><Info size={14} />Files selected here are represented as local demo records. No content is uploaded to a service.</div>
  </>;
}

export function CompliancePage() {
  const [items, setItems] = useState(complianceItems);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCadence, setNewCadence] = useState('At start of employment');
  const [newDue, setNewDue] = useState('Within 7 days');
  const [editingId, setEditingId] = useState<string | null>(null);
  const enabledCount = items.filter((item) => item.enabled).length;
  function toggle(id: string) { setItems((current) => current.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item)); setSaved(false); }
  function addRequirement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    setItems((current) => [{ id: `c-${Date.now()}`, title: newTitle.trim(), group: 'Custom requirement', cadence: newCadence, due: newDue, enabled: true }, ...current]);
    setNewTitle(''); setShowForm(false); setSaved(false);
  }
  return <>
    <PageHeading eyebrow="REQUIREMENTS & DEADLINES" title="Compliance setup" description="Configure sample requirements for onboarding plans and recurring acknowledgements." action={<button className="button button-primary" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2300); }}>{saved ? <Check size={15} /> : <CheckCircle2 size={15} />}{saved ? 'Saved locally' : 'Save configuration'}</button>} />
    <div className="compliance-summary"><div className="compliance-summary-icon"><ShieldCheck size={18} /></div><div><strong>{enabledCount} requirements enabled</strong><p>Updates in this prototype stay in browser state and do not change an organization record.</p></div><span className="demo-chip">DEMO CONFIG</span></div>
    {showForm && <form className="surface-card compliance-add-form" onSubmit={addRequirement}><div><strong>Add a requirement</strong><p>This is a local demo rule, not legal guidance.</p></div><input className="field-input" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Requirement name" required /><select className="field-input" value={newCadence} onChange={(event) => setNewCadence(event.target.value)}><option>At start of employment</option><option>Annual</option><option>Quarterly</option></select><select className="field-input" value={newDue} onChange={(event) => setNewDue(event.target.value)}><option>Within 5 days</option><option>Within 7 days</option><option>Within 10 days</option><option>Every 12 months</option><option>Every 6 months</option></select><button className="button button-primary button-small" type="submit">Add rule</button><button className="icon-button" type="button" aria-label="Close add requirement form" onClick={() => setShowForm(false)}><X size={15} /></button></form>}
    <section className="surface-card compliance-list"><div className="compliance-list-header"><div><h2>Requirements</h2><p>Use a consistent checklist and set a clear completion window.</p></div><button className="button button-secondary button-small" onClick={() => setShowForm((value) => !value)}><Plus size={14} /> Add requirement</button></div>{items.map((item) => <div className="compliance-item-block" key={item.id}><article className={`compliance-row ${!item.enabled ? 'compliance-disabled' : ''}`}><div className="compliance-row-icon"><FileCheck2 size={17} /></div><div className="compliance-row-main"><div className="compliance-row-heading"><strong>{item.title}</strong><span>{item.group}</span></div><div className="compliance-row-meta"><span><CalendarDays size={13} /> {item.cadence}</span><span className="meta-separator">·</span><span>Due {item.due}</span></div></div><label className="toggle-control"><input type="checkbox" checked={item.enabled} onChange={() => toggle(item.id)} aria-label={`Enable ${item.title}`} /><span className="toggle-track" /></label><button className="icon-button" aria-label={`Edit ${item.title} deadline`} onClick={() => setEditingId(editingId === item.id ? null : item.id)}><Settings2 size={15} /></button></article>{editingId === item.id && <div className="compliance-edit-row"><label><span>Cadence</span><select className="field-input" value={item.cadence} onChange={(event) => { setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, cadence: event.target.value } : entry)); setSaved(false); }}><option>At start of employment</option><option>Annual</option><option>Quarterly</option></select></label><label><span>Due</span><select className="field-input" value={item.due} onChange={(event) => { setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, due: event.target.value } : entry)); setSaved(false); }}><option>Within 5 days</option><option>Within 7 days</option><option>Within 10 days</option><option>Every 12 months</option><option>Every 6 months</option></select></label><button className="button button-secondary button-small" onClick={() => setEditingId(null)}>Done</button></div>}</div>)}</section>
    <div className="compliance-footnote"><Info size={14} /><span>Requirements shown are generic demo data and are not legal or jurisdiction-specific guidance.</span></div>
  </>;
}

export function ReportsPage() {
  const { exportComplianceReport } = useDemo();
  const [range, setRange] = useState('Last 30 days');
  const [includeDocs, setIncludeDocs] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [notice, setNotice] = useState('');
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    try {
      await exportComplianceReport(range, includeTasks, includeDocs);
      setNotice(`Compliance report exported and recorded to audit_log for ${range.toLowerCase()}.`);
      window.setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      console.error('Failed to export compliance report:', err);
    } finally {
      setGenerating(false);
    }
  }

  return <>
    <PageHeading eyebrow="AUDIT-READY EXPORTS" title="Reports" description="Generate audit-ready compliance and onboarding records with automatic audit logging." />
    <div className="reports-layout"><section className="surface-card report-builder"><div className="report-builder-heading"><span className="report-builder-icon"><BarChart3 size={18} /></span><div><h2>Build a report</h2><p>Select parameters for your official compliance CSV export.</p></div></div><label className="field-label" htmlFor="report-range">Date range</label><select className="field-input" id="report-range" value={range} onChange={(event) => setRange(event.target.value)}><option>Last 30 days</option><option>Last 90 days</option><option>Year to date</option><option>All records</option></select><div className="report-check-heading">Include in report</div><label className="report-option"><span className="report-option-check"><input type="checkbox" checked={includeTasks} onChange={(event) => setIncludeTasks(event.target.checked)} /></span><span><strong>Onboarding progress</strong><small>Employee completion status, deadlines, and task audit trail</small></span><ListChecks size={17} /></label><label className="report-option"><span className="report-option-check"><input type="checkbox" checked={includeDocs} onChange={(event) => setIncludeDocs(event.target.checked)} /></span><span><strong>Document review summary</strong><small>Verification status, timestamps, and reviewer IDs</small></span><FileText size={17} /></label><button className="button button-primary report-generate" onClick={generate} disabled={generating}><ArrowDownToLine size={16} /> {generating ? 'Generating & Logging…' : 'Generate CSV'}</button>{notice && <div className="inline-success"><CheckCircle2 size={15} />{notice}</div>}<p className="report-disclaimer">Every report generation writes an immutable audit record to the <code>audit_log</code> table in Postgres.</p></section>
      <aside className="report-side"><div className="report-side-icon"><ShieldCheck size={18} /></div><h3>Immutable audit trail</h3><p>Keep records easy to scan with the employee, status, and timestamp fields in one verified export.</p><div className="report-preview-label">REPORT INCLUDES</div><div className="report-preview-row"><span><Users size={14} /> Employee roster</span><CheckCircle2 size={15} /></div><div className="report-preview-row"><span><ListChecks size={14} /> Checklist completion</span><CheckCircle2 size={15} /></div><div className="report-preview-row"><span><FileText size={14} /> Document verification</span><CheckCircle2 size={15} /></div><div className="report-side-note"><Info size={14} />Logged to Postgres <code>audit_log</code>.</div></aside></div>
  </>;
}

export function SettingsPage() {
  const [orgName, setOrgName] = useState('Northstar');
  const [departments, setDepartments] = useState(['People & Culture', 'Product', 'Engineering', 'Customer Experience', 'Operations', 'Finance']);
  const [newDepartment, setNewDepartment] = useState('');
  const [saved, setSaved] = useState(false);
  function addDepartment(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!newDepartment.trim()) return; setDepartments((current) => [...current, newDepartment.trim()]); setNewDepartment(''); setSaved(false); }
  return <>
    <PageHeading eyebrow="WORKSPACE PREFERENCES" title="Organization settings" description="Manage the sample organization name, departments, and role labels." action={<button className="button button-primary" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2200); }}>{saved ? <Check size={15} /> : <CheckCircle2 size={15} />}{saved ? 'Saved locally' : 'Save changes'}</button>} />
    <div className="settings-layout"><div className="settings-main"><section className="surface-card settings-card"><div className="settings-section-heading"><span className="settings-icon"><Users size={17} /></span><div><h2>Organization</h2><p>Basic workspace details for the walkthrough.</p></div></div><label className="field-label" htmlFor="org-name">Organization name</label><input id="org-name" className="field-input settings-org-input" value={orgName} onChange={(event) => { setOrgName(event.target.value); setSaved(false); }} /><div className="settings-readonly-row"><span>Workspace type</span><span className="demo-chip">Internal demo</span></div></section>
      <section className="surface-card settings-card"><div className="settings-section-heading"><span className="settings-icon settings-icon-blue"><FolderOpen size={17} /></span><div><h2>Departments</h2><p>Use departments to group employees in the overview.</p></div></div><div className="department-list">{departments.map((department) => <div className="department-row" key={department}><span className="department-dot" /><span>{department}</span><button className="icon-button" aria-label={`Remove ${department}`} onClick={() => { setDepartments((current) => current.filter((item) => item !== department)); setSaved(false); }}><X size={14} /></button></div>)}</div><form className="department-add" onSubmit={addDepartment}><input className="field-input" placeholder="Add a department" value={newDepartment} onChange={(event) => setNewDepartment(event.target.value)} /><button type="submit" className="button button-secondary button-small"><Plus size={14} /> Add</button></form></section>
      <section className="surface-card settings-card"><div className="settings-section-heading"><span className="settings-icon settings-icon-amber"><ShieldCheck size={17} /></span><div><h2>Role access</h2><p>Role-aware navigation for the local demo.</p></div></div><div className="role-access-list"><div><span className="role-access-icon"><UserRoundIcon /></span><span><strong>Employee</strong><small>Personal onboarding, documents, policy chat</small></span><StatusPill status="Active" /></div><div><span className="role-access-icon role-manager"><Users size={15} /></span><span><strong>Manager</strong><small>Employee experience plus direct reports</small></span><StatusPill status="Active" /></div><div><span className="role-access-icon role-admin"><ShieldCheck size={15} /></span><span><strong>HR Admin</strong><small>Organization-wide people operations console</small></span><StatusPill status="Active" /></div></div></section></div>
      <aside className="settings-side"><div className="settings-side-icon"><Info size={17} /></div><h3>About these settings</h3><p>This prototype uses local demo values. Changes are not written to an organization account.</p><div className="settings-side-divider" /><div className="settings-side-meta"><span>Environment</span><strong>Browser demo</strong></div><div className="settings-side-meta"><span>Data source</span><strong>Sample records</strong></div></aside></div>
  </>;
}

function UserRoundIcon() { return <Users size={15} />; }
