import { ArrowUpRight, Check, CheckCircle2, Circle, Clock3, FileClock, Info, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DocumentStatus, TaskStatus } from './data';

const statusCopy: Record<string, { label: string; tone: string; icon: LucideIcon }> = {
  'not-started': { label: 'Not started', tone: 'neutral', icon: Circle },
  'in-progress': { label: 'In progress', tone: 'info', icon: Clock3 },
  'pending-review': { label: 'Pending review', tone: 'review', icon: FileClock },
  completed: { label: 'Completed', tone: 'success', icon: CheckCircle2 },
  uploaded: { label: 'Uploaded', tone: 'info', icon: FileClock },
  approved: { label: 'Approved', tone: 'success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', tone: 'danger', icon: Info },
  'On track': { label: 'On track', tone: 'success', icon: CheckCircle2 },
  'Needs attention': { label: 'Needs attention', tone: 'warning', icon: Info },
  Complete: { label: 'Complete', tone: 'success', icon: CheckCircle2 },
  Active: { label: 'Active', tone: 'success', icon: CheckCircle2 },
  Published: { label: 'Published', tone: 'success', icon: CheckCircle2 },
  Draft: { label: 'Draft', tone: 'neutral', icon: Circle },
};

export function StatusPill({ status, label }: { status: TaskStatus | DocumentStatus | string; label?: string }) {
  const config = statusCopy[status] ?? { label: status, tone: 'neutral', icon: Info };
  const Icon = config.icon;
  return <span className={`status-pill status-${config.tone}`}><Icon size={13} strokeWidth={2} aria-hidden="true" />{label ?? config.label}</span>;
}

export function ProgressBar({ value, label, compact = false }: { value: number; label?: string; compact?: boolean }) {
  return <div className={`progress-wrap ${compact ? 'progress-compact' : ''}`}>
    {label && <div className="progress-label"><span>{label}</span><span className="mono">{value}%</span></div>}
    <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}>
      <span className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>;
}

export function Avatar({ initials, color = 'sage', size = 'md' }: { initials: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`avatar avatar-${size} avatar-${color}`} aria-label={initials}>{initials}</span>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>
    {action && <div className="page-heading-action">{action}</div>}
  </div>;
}

export function SectionHeading({ title, action, description }: { title: string; action?: ReactNode; description?: string }) {
  return <div className="section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function StatCard({ label, value, note, icon: Icon, tone = 'green' }: { label: string; value: string | number; note: string; icon: LucideIcon; tone?: 'green' | 'amber' | 'blue' | 'slate' }) {
  return <article className="stat-card">
    <div className={`stat-icon stat-${tone}`}><Icon size={18} strokeWidth={1.8} /></div>
    <div className="stat-copy"><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-note">{note}</span></div>
  </article>;
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={21} /></div><h3>{title}</h3><p>{body}</p>{action}</div>;
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return <div className="skeleton-list" role="status" aria-label="Loading list" aria-busy="true">
    {Array.from({ length: count }, (_, index) => <div className="skeleton-row" key={index} aria-hidden="true">
      <span className="skeleton-avatar" /><span className="skeleton-copy"><i /><i /></span><span className="skeleton-pill" />
    </div>)}
  </div>;
}

export function DataLink({ children }: { children: ReactNode }) {
  return <span className="data-link">{children}<ArrowUpRight size={14} aria-hidden="true" /></span>;
}

export function CheckMark({ checked }: { checked: boolean }) {
  return <span className={`checkmark ${checked ? 'is-checked' : ''}`}>{checked && <Check size={13} strokeWidth={2.5} />}</span>;
}
