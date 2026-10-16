import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Download, FileCheck2, FileText, Info, LifeBuoy, ListChecks, MessageCircle, Plus, Send, ShieldCheck, Sparkles, Upload, UserRound, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, EmptyState, PageHeading, ProgressBar, SectionHeading, SkeletonRows, StatusPill } from '../components';
import type { TaskStatus } from '../data';
import { useDemo } from '../state';

const nextStatus: Record<TaskStatus, TaskStatus> = {
  'not-started': 'in-progress',
  'in-progress': 'completed',
  'pending-review': 'pending-review',
  completed: 'not-started',
};

export function DashboardPage() {
  const { tasks, setTaskStatus, displayName } = useDemo();
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 360); return () => window.clearTimeout(timer); }, []);
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const nextTask = tasks.find((task) => task.status === 'in-progress') ?? tasks.find((task) => task.status === 'not-started');
  const recent = tasks.filter((task) => task.status !== 'completed').slice(0, 4);
  const firstName = displayName.trim().split(/\s+/)[0] || 'there';

  return <>
    <PageHeading eyebrow="ONBOARDING WORKSPACE" title={`Good morning, ${firstName}`} description="A clear start begins with knowing what comes next." action={<Link to="/app/tasks" className="button button-secondary"><CalendarDays size={15} /> First week</Link>} />
    <div className="welcome-strip"><div className="welcome-icon"><Sparkles size={18} /></div><div><strong>{tasks.length ? 'You’re finding your rhythm.' : 'Your next steps will appear here.'}</strong><p>{tasks.length ? 'Your onboarding plan is moving along. Here’s the next useful step.' : 'People Operations will add an onboarding plan when it is ready.'}</p></div><div className="welcome-progress"><span>{completed} of {tasks.length} steps complete</span><ProgressBar value={progress} compact /></div></div>
    <div className="employee-dashboard-grid">
      <section className="next-step-card">
        <div className="next-step-top"><span className="next-step-label"><span className="live-dot" /> YOUR NEXT STEP</span><span className="step-count">{tasks.length ? <>{String(Math.min(completed + 1, tasks.length)).padStart(2, '0')} <span>/ {String(tasks.length).padStart(2, '0')}</span></> : <>00 <span>/ 00</span></>}</span></div>
        {nextTask ? <>
          <div className="next-step-content"><span className="next-step-icon"><FileCheck2 size={19} /></span><span className="task-category">{nextTask.category}</span><h2>{nextTask.title}</h2><p>{nextTask.description}</p></div>
          <div className="next-step-bottom"><span><Clock3 size={14} /> {nextTask.due}</span><button className="button button-primary" onClick={() => setTaskStatus(nextTask.id, nextStatus[nextTask.status])}>{nextTask.status === 'in-progress' ? 'Mark complete' : 'Start this task'} <ArrowRight size={15} /></button></div>
        </> : <div className="next-step-content"><span className="next-step-icon">{tasks.length ? <CheckCircle2 size={20} /> : <ListChecks size={20} />}</span><h2>{tasks.length ? 'You’re all caught up.' : 'No onboarding plan assigned yet.'}</h2><p>{tasks.length ? 'There are no open onboarding steps right now.' : 'People Operations will add your plan here. You can check back soon.'}</p></div>}
      </section>
      <section className="surface-card overview-card">
        <SectionHeading title="Your progress" action={<span className="progress-total">{progress}%</span>} />
        <div className="progress-ring-area"><div className="progress-ring" style={{ background: `conic-gradient(var(--brand) ${progress * 3.6}deg, #e9f0eb 0deg)` }}><div className="progress-ring-inner"><strong>{completed}<span>/{tasks.length}</span></strong><small>steps</small></div></div><div className="progress-ring-copy"><strong>Steady progress</strong><span>Every completed step brings day one into focus.</span></div></div>
        <div className="progress-legend"><span><i className="legend-dot legend-done" />Completed <strong>{completed}</strong></span><span><i className="legend-dot legend-open" />To do <strong>{tasks.length - completed}</strong></span></div>
        <div className="progress-card-note"><ShieldCheck size={15} /><span>Your information is only visible to you and your People Operations team.</span></div>
      </section>
    </div>

    <div className="employee-lower-grid">
      <section>
        <SectionHeading title="Coming up" description="A few helpful things to keep moving." action={<Link className="text-link" to="/app/tasks">View all <ArrowRight size={14} /></Link>} />
        <div className="surface-card task-preview-list">
          {loading ? <SkeletonRows count={3} /> : recent.length ? recent.map((task) => <div className="task-preview-row" key={task.id}>
            <span className={`task-state-mark state-${task.status}`} />
            <div className="task-preview-copy"><strong>{task.title}</strong><small>{task.category} <span>·</span> {task.due}</small></div>
            <StatusPill status={task.status} />
            <Link className="icon-button row-chevron" aria-label={`Open ${task.title}`} to="/app/tasks"><ChevronRight size={16} /></Link>
          </div>) : <EmptyState icon={tasks.length ? CheckCircle2 : ListChecks} title={tasks.length ? 'Your plan is complete' : 'No onboarding plan assigned yet'} body={tasks.length ? 'You’ve finished every assigned onboarding step.' : 'Your onboarding plan will appear here once People Operations assigns it.'} />}
        </div>
      </section>
      <section className="help-panel">
        <div className="help-panel-icon"><MessageCircle size={18} /></div><span className="eyebrow">HERE TO HELP</span><h2>Have a policy question?</h2><p>Ask in plain language. Answers include the handbook section they came from.</p><Link className="button button-secondary" to="/app/ask">Ask a question <ArrowRight size={15} /></Link>
      </section>
    </div>
  </>;
}

export function TasksPage() {
  const { tasks, setTaskStatus } = useDemo();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Open' | 'Completed'>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 360); return () => window.clearTimeout(timer); }, []);
  const shown = tasks.filter((task) => filter === 'All' || (filter === 'Completed' ? task.status === 'completed' : task.status !== 'completed'));
  const completeCount = tasks.filter((task) => task.status === 'completed').length;
  function downloadTasks() {
    const rows = [['Task', 'Category', 'Due date', 'Status'], ...tasks.map((task) => [task.title, task.category, task.due, task.status])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'complypilot-my-tasks.csv'; anchor.click(); URL.revokeObjectURL(url);
  }
  return <>
    <PageHeading eyebrow="YOUR ONBOARDING PLAN" title="My tasks" description="Small steps, clear progress. Your plan is personalized for your role and start date." action={<button className="button button-secondary" onClick={downloadTasks}><Download size={15} /> Download list</button>} />
    <div className="task-summary-strip"><div className="task-summary-number"><strong>{completeCount}</strong><span>of {tasks.length} complete</span></div><div className="task-summary-progress"><ProgressBar value={tasks.length ? Math.round(completeCount / tasks.length * 100) : 0} label="Onboarding progress" /></div><span className="task-summary-caption"><CheckCircle2 size={15} /> You’re on track</span></div>
    <section className="surface-card task-board">
      <div className="task-board-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter tasks">{(['All', 'Open', 'Completed'] as const).map((value) => <button className={`filter-tab ${filter === value ? 'filter-tab-active' : ''}`} key={value} onClick={() => setFilter(value)} role="tab" aria-selected={filter === value}>{value}<span>{value === 'All' ? tasks.length : value === 'Completed' ? completeCount : tasks.length - completeCount}</span></button>)}</div><span className="task-summary-caption"><CheckCircle2 size={14} /> Filter by status</span></div>
      <div className="task-list">
        {loading ? <SkeletonRows count={5} /> : !tasks.length ? <EmptyState icon={ListChecks} title="No onboarding plan assigned yet" body="People Operations will add your tasks here when your plan is ready." /> : shown.map((task) => <article className={`task-row ${expanded === task.id ? 'task-row-expanded' : ''}`} key={task.id}>
          <button className="task-row-main" onClick={() => setExpanded(expanded === task.id ? null : task.id)} aria-expanded={expanded === task.id}>
            <span className={`task-state-mark state-${task.status}`} />
            <span className="task-row-copy"><strong>{task.title}</strong><small>{task.category}</small></span>
            <span className="task-due"><CalendarDays size={13} />{task.due}</span>
            <StatusPill status={task.status} /><ChevronRight className="task-row-chevron" size={16} />
          </button>
          {expanded === task.id && <div className="task-detail"><p>{task.description}</p>{task.status !== 'pending-review' && <button className="button button-secondary button-small" onClick={() => setTaskStatus(task.id, nextStatus[task.status])}>{task.status === 'completed' ? 'Reopen task' : task.status === 'in-progress' ? 'Mark complete' : 'Start task'} <ArrowRight size={13} /></button>}{task.status === 'pending-review' && <span className="muted-detail"><Clock3 size={13} /> People Operations will update this when review is complete.</span>}</div>}
        </article>)}
        {!shown.length && <EmptyState icon={CheckCircle2} title="Nothing to show yet" body="Try a different filter to see your assigned onboarding tasks." />}
      </div>
    </section>
  </>;
}

export function DocumentsPage() {
  const { documents, addDocument, setDocumentStatus } = useDemo();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 360); return () => window.clearTimeout(timer); }, []);

  async function processFile(file: File) {
    setUploading(true);
    setUploadError(false);
    try {
      const documentId = await addDocument(file.name, file);
      // Status becomes pending_review for HR review
      await setDocumentStatus(documentId, 'pending-review');
      setFailedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      console.error('File upload failed:', err);
      setFailedFile(file);
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  }

  return <>
    <PageHeading eyebrow="DOCUMENTS & FORMS" title="My documents" description="Securely submit required onboarding and compliance records. Files are stored in private Supabase Storage and gated by Postgres RLS." />
    <div className="documents-layout">
      <div className="documents-main">
        <section className="surface-card upload-card">
          <div className="upload-card-heading"><div><h2>Upload a document</h2><p>PDF, JPG, or PNG · Up to 10 MB</p></div><span className="upload-privacy"><ShieldCheck size={14} /> Private to your team</span></div>
          <button className={`dropzone ${uploading ? 'dropzone-loading' : ''}`} onClick={() => !uploading && inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) processFile(file); }} aria-label="Choose a document to upload">
            <span className="dropzone-icon">{uploading ? <span className="spinner" /> : <Upload size={19} />}</span>
            <strong>{uploading ? 'Uploading to secure storage…' : 'Drop a file here, or browse'}</strong>
            <small>{uploading ? 'Encrypting and saving to private bucket...' : 'Stored securely in private Supabase Storage bucket.'}</small>
          </button>
          <input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={chooseFile} />
          {uploadError && <div className="inline-error"><span><Info size={15} /></span><div><strong>That upload didn’t finish.</strong><p>Could not write to Supabase Storage. Please verify bucket permissions or try again.</p></div>{failedFile && <button className="button button-secondary button-small" onClick={() => processFile(failedFile)}>Retry</button>}</div>}
        </section>
        <section className="documents-table-section">
          <SectionHeading title="Your files" description={`${documents.length} documents in your workspace`} />
          {loading ? <div className="surface-card document-list"><SkeletonRows count={3} /></div> : documents.length ? <div className="surface-card document-list">{documents.map((document) => <div className="document-row" key={document.id}><span className="document-icon"><FileText size={17} /></span><div className="document-row-copy"><strong>{document.name}</strong><small>{document.type} <span>·</span> {document.date}</small></div><StatusPill status={document.status} /><button className="icon-button" aria-label={`More actions for ${document.name}`}><ChevronRight size={16} /></button></div>)}</div> : <div className="surface-card"><EmptyState icon={FileText} title="No documents uploaded yet" body="When a document is added to your onboarding plan, it will appear here." action={<button className="button button-secondary" onClick={() => inputRef.current?.click()}>Add your first document <Plus size={14} /></button>} /></div>}
        </section>
      </div>
      <aside className="document-side-panel"><div className="doc-side-icon"><Info size={17} /></div><h3>What happens next?</h3><p>Uploaded documents show as pending review until People Operations checks them.</p><ul className="document-steps"><li><span className="step-n">1</span><span>Choose a file</span></li><li><span className="step-n">2</span><span>People Operations reviews it</span></li><li><span className="step-n">3</span><span>You’ll see the status here</span></li></ul><Link to="/app/ask" className="text-link">Questions about a document? <ArrowRight size={14} /></Link></aside>
    </div>
  </>;
}

type ChatMessage = { id: string; from: 'assistant' | 'you'; text: string; sourceId?: string; sourceTitle?: string; sourceSection?: string; fallback?: boolean; error?: boolean };

export function AskPage() {
  const { policies, displayName, askPolicy } = useDemo();
  const publishedPolicies = policies.filter((policy) => policy.status === 'Published');
  const firstName = displayName.trim().split(/\s+/)[0] || 'there';
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', from: 'assistant', text: `Hi ${firstName}. I can help you find answers in published workplace policies. Ask in your own words and I’ll point you to a source when one is available.` }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, typing]);

  async function sendMessage(raw = input) {
    const question = raw.trim();
    if (!question || typing) return;
    setMessages((current) => [...current, { id: `u-${Date.now()}`, from: 'you', text: question }]);
    setInput('');
    setTyping(true);

    try {
      const res = await askPolicy(question);
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          from: 'assistant',
          text: res.answer,
          sourceId: res.sourceId,
          sourceTitle: res.sourceTitle,
          sourceSection: res.sourceSection,
          fallback: res.fallback,
          error: res.error,
        },
      ]);
    } catch (err) {
      console.error('Ask policy error:', err);
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          from: 'assistant',
          text: 'I couldn’t load a policy response just now. Please contact People Operations directly for help with this question.',
          fallback: true,
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  const selectedSource = publishedPolicies.find((source) => source.id === sourceId);
  const suggestions = ['How do I request time off?', 'What’s the remote work approach?', 'How should I protect work information?'];

  return <>
    <PageHeading eyebrow="POLICY GUIDANCE" title="Ask a question" description="Answers are grounded in locally published sample excerpts and include a source when one is available." action={<span className="button button-secondary"><ShieldCheck size={15} /> {publishedPolicies.length ? `${publishedPolicies.length} sources included` : 'No sources published'}</span>} />
    <div className="chat-layout">
      <section className="surface-card chat-card">
        <div className="chat-topline"><div className="chat-agent-avatar"><Sparkles size={17} /></div><div><strong>Policy assistant</strong><small><span className="chat-online-dot" /> {publishedPolicies.length ? `${publishedPolicies.length} published policy sources` : 'No published policy sources'}</small></div></div>
        <div className="chat-messages" aria-live="polite">
          <div className="chat-day-divider"><span>Today · Oct 7</span></div>
          {messages.map((message) => <div className={`chat-message-row ${message.from === 'you' ? 'chat-message-you' : ''}`} key={message.id}>
            {message.from === 'assistant' && <span className="chat-mini-avatar"><Sparkles size={13} /></span>}
            <div className={`chat-bubble ${message.from === 'you' ? 'bubble-you' : message.error ? 'bubble-error' : message.fallback ? 'bubble-fallback' : 'bubble-assistant'}`}>
              {message.fallback && <div className={message.error ? 'error-label' : 'fallback-label'}>{message.error ? <Info size={13} /> : <LifeBuoy size={13} />}{message.error ? 'Connection issue' : 'People Operations can help'}</div>}
              <p>{message.text}</p>
              {message.sourceId && (() => { const source = publishedPolicies.find((item) => item.id === message.sourceId); return source ? <button className="citation-link" onClick={() => setSourceId(source.id)}><FileCheck2 size={13} /><span>{source.title}</span><small>{source.section}</small><ArrowUpRight size={13} /></button> : null; })()}
            </div>
          </div>)}
          {typing && <div className="chat-message-row"><span className="chat-mini-avatar"><Sparkles size={13} /></span><div className="typing-bubble"><span /><span /><span /><small>Checking published sources</small></div></div>}
          <div ref={endRef} />
        </div>
        {messages.length === 1 && publishedPolicies.length > 0 && <div className="suggested-questions"><span>TRY ASKING</span>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(suggestion)}>{suggestion}<ArrowUpRight size={13} /></button>)}</div>}
        <form className="chat-composer" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); sendMessage(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a workplace policy…" aria-label="Your question" /><button type="submit" className="send-button" disabled={!input.trim() || typing} aria-label="Send question"><Send size={16} /></button></form>
        <div className="chat-disclaimer"><Info size={12} />Sample content for this demo. Confirm specific situations with People Operations.</div>
      </section>
      <aside className="chat-side-panel"><div className="chat-side-icon"><FileCheck2 size={17} /></div><h3>Grounded in your policies</h3><p>Answers link back to the section they’re based on, so you can check the source yourself.</p><div className="source-list-title">PUBLISHED SOURCES</div>{publishedPolicies.length ? publishedPolicies.map((source) => <button className="source-preview" key={source.id} onClick={() => setSourceId(source.id)}><span className="source-file-icon"><FileText size={14} /></span><span><strong>{source.title}</strong><small>{source.section}</small></span><ChevronRight size={14} /></button>) : <EmptyState icon={FileText} title="No policies published yet" body="Ask People Operations to publish a policy source before checking policy guidance." />}<div className="chat-side-footer"><ShieldCheck size={14} />No confident answer? We’ll say so.</div></aside>
    </div>
    {selectedSource && <div className="dialog-backdrop" role="presentation" onClick={() => setSourceId(null)}><section className="source-dialog" role="dialog" aria-modal="true" aria-labelledby="source-title" onClick={(event) => event.stopPropagation()}><div className="dialog-top"><span className="source-file-icon"><FileText size={16} /></span><button className="icon-button" aria-label="Close source" onClick={() => setSourceId(null)}><X size={17} /></button></div><div className="eyebrow">POLICY SOURCE</div><h2 id="source-title">{selectedSource.title}</h2><span className="source-section-label">{selectedSource.section}</span><p>{selectedSource.body}</p><div className="source-dialog-foot"><span>{selectedSource.updated}</span><span className="demo-chip">Sample excerpt</span></div></section></div>}
  </>;
}

export function ProfilePage() {
  const { profile, user, displayName, role } = useDemo();
  const [saved, setSaved] = useState(false);
  const nameParts = displayName.trim().split(/\s+/);
  const preferredName = nameParts[0] || 'Team';
  const lastName = nameParts.slice(1).join(' ') || 'Member';
  const email = user?.email || 'employee@northstar.test';
  const roleLabel = role === 'admin' ? 'HR Administrator' : role === 'manager' ? 'Team Lead / Manager' : 'Employee';
  const department = profile?.department || 'People & Culture';
  const empId = user ? `CP-${user.id.slice(0, 4).toUpperCase()}` : 'CP-1048';
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'U';

  return <>
    <PageHeading eyebrow="YOUR DETAILS" title="My profile" description="Your profile helps People Operations and your manager support your first weeks." action={<button className="button button-primary" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2200); }}>{saved ? <Check size={15} /> : <CheckCircle2 size={15} />}{saved ? 'Saved' : 'Save changes'}</button>} />
    <div className="profile-layout">
      <section className="surface-card profile-card"><div className="profile-identity"><Avatar initials={initials} size="lg" color="sage" /><div><h2>{displayName}</h2><p>{roleLabel} <span>·</span> {department}</p></div><span className="profile-active"><i /> Active</span></div><div className="profile-form-grid"><label><span>Preferred name</span><input className="field-input" defaultValue={preferredName} /></label><label><span>Last name</span><input className="field-input" defaultValue={lastName} /></label><label><span>Work email</span><input className="field-input" defaultValue={email} type="email" /></label><label><span>Phone number</span><input className="field-input" defaultValue="+1 (555) 014-2078" /></label><label><span>Department</span><input className="field-input field-locked" defaultValue={department} readOnly /></label><label><span>Role</span><input className="field-input field-locked" defaultValue={roleLabel} readOnly /></label></div></section>
      <aside className="surface-card profile-meta"><div className="profile-meta-heading"><UserRound size={16} /><h3>Work details</h3></div><div className="meta-row"><span>Manager</span><strong>Jordan Lee</strong></div><div className="meta-row"><span>Start date</span><strong>{profile?.start_date || 'October 1, 2026'}</strong></div><div className="meta-row"><span>Employee ID</span><strong className="mono">{empId}</strong></div><div className="profile-privacy"><ShieldCheck size={15} /><span>Profile details are available to you, your manager, and People Operations.</span></div></aside>
    </div>
  </>;
}

export function TeamPage() {
  const { employees } = useDemo();
  const team = employees.filter((employee) => employee.manager === 'Jordan Lee');
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 360); return () => window.clearTimeout(timer); }, []);
  return <>
    <PageHeading eyebrow="MANAGER VIEW" title="My team" description="A quick view of your direct reports’ onboarding progress." action={<span className="button button-secondary"><Users size={15} /> {team.length} direct reports</span>} />
    <div className="stat-grid team-stat-grid"><article className="team-summary-card"><span className="team-summary-icon"><Users size={17} /></span><span>Direct reports</span><strong>{team.length}</strong><small>Across {new Set(team.map((employee) => employee.startDate)).size} start dates</small></article><article className="team-summary-card"><span className="team-summary-icon team-summary-amber"><Clock3 size={17} /></span><span>Need your review</span><strong>{team.filter((employee) => employee.status === 'Needs attention').length}</strong><small>Documents or acknowledgements</small></article><article className="team-summary-card"><span className="team-summary-icon team-summary-blue"><CheckCircle2 size={17} /></span><span>On track</span><strong>{team.filter((employee) => employee.status === 'On track').length}</strong><small>Moving through their plan</small></article><article className="team-summary-card"><span className="team-summary-icon team-summary-rose"><Info size={17} /></span><span>Needs a check-in</span><strong>{team.filter((employee) => employee.status === 'Needs attention').length}</strong><small>Could use a quick follow-up</small></article></div>
    <section className="surface-card manager-team-card"><div className="table-toolbar"><div><strong className="surface-card-title">Direct reports</strong><p className="surface-card-subtitle">Progress and next-step signals, at a glance.</p></div></div><div className="table-wrap">{loading ? <SkeletonRows count={team.length || 3} /> : <table className="data-table"><thead><tr><th>TEAM MEMBER</th><th>START DATE</th><th>ONBOARDING</th><th>STATUS</th><th>NEXT TASK</th><th>UP NEXT</th></tr></thead><tbody>{team.map((employee) => <tr key={employee.id}><td><div className="table-person"><Avatar initials={employee.initials} color="sage" size="sm" /><span><strong>{employee.name}</strong><small>{employee.role}</small></span></div></td><td>{employee.startDate}</td><td><div className="team-progress-cell"><ProgressBar value={employee.progress} compact /><small>{employee.progress}%</small></div></td><td><StatusPill status={employee.status} /></td><td><StatusPill status={employee.progress >= 100 ? 'completed' : employee.status === 'Needs attention' ? 'pending-review' : employee.progress > 40 ? 'in-progress' : 'not-started'} /></td><td><span className="table-next-step">{employee.status === 'Needs attention' ? 'Review welcome plan' : employee.progress >= 100 ? 'Plan complete' : 'Review first-week plan'}</span></td></tr>)}</tbody></table>}</div><div className="table-footnote"><ShieldCheck size={13} />You’re seeing onboarding progress for your direct reports only.</div></section>
    <div className="manager-tip"><span><Sparkles size={15} /></span><p><strong>A small check-in goes a long way.</strong> A quick note can help a new teammate feel supported during their first week.</p><Link className="button button-quiet" to="/app/tasks">View onboarding guide <ArrowRight size={14} /></Link></div>
  </>;
}
