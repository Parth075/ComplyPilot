import type { ReactNode } from 'react'
import { ArrowUpRight, Check, CircleAlert, Clock3, FileCheck2, LoaderCircle, Minus, Sparkles } from 'lucide-react'
import type { DocumentStatus, Role, TaskStatus } from '../data/mockData'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? 'brand-lockup--compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true"><Check size={18} strokeWidth={3} /></span>
      {!compact && <span className="brand-wordmark">Comply<span>Pilot</span></span>}
    </div>
  )
}

export function RolePill({ role }: { role: Role }) {
  const labels = { employee: 'Employee demo', manager: 'Manager demo', admin: 'HR Admin demo' }
  return <span className={`role-pill role-pill--${role}`}><span className="role-pill__dot" />{labels[role]}</span>
}

const taskStatusConfig: Record<TaskStatus, { label: string; tone: string; icon: ReactNode }> = {
  'not-started': { label: 'Not started', tone: 'neutral', icon: <Minus size={13} /> },
  'in-progress': { label: 'In progress', tone: 'info', icon: <Clock3 size={13} /> },
  'pending-review': { label: 'Pending review', tone: 'warning', icon: <CircleAlert size={13} /> },
  completed: { label: 'Completed', tone: 'success', icon: <Check size={13} /> },
}

const documentStatusConfig: Record<DocumentStatus, { label: string; tone: string; icon: ReactNode }> = {
  uploaded: { label: 'Uploaded', tone: 'neutral', icon: <FileCheck2 size={13} /> },
  'pending-review': { label: 'Pending review', tone: 'warning', icon: <Clock3 size={13} /> },
  approved: { label: 'Approved', tone: 'success', icon: <Check size={13} /> },
  rejected: { label: 'Rejected', tone: 'danger', icon: <CircleAlert size={13} /> },
  failed: { label: 'Upload failed', tone: 'danger', icon: <CircleAlert size={13} /> },
}

export function StatusBadge({ status, kind = 'task' }: { status: TaskStatus | DocumentStatus | string; kind?: 'task' | 'document' | 'generic' }) {
  const config = kind === 'task' ? taskStatusConfig[status as TaskStatus] : kind === 'document' ? documentStatusConfig[status as DocumentStatus] : undefined
  const label = config?.label ?? status
  const tone = config?.tone ?? (status === 'Complete' || status === 'Healthy' || status === 'Published' ? 'success' : status === 'Needs attention' || status === 'Draft' ? 'warning' : 'neutral')
  return <span className={`status-badge status-badge--${tone}`}>{config?.icon ?? <span className="status-badge__dot" />}{label}</span>
}

export function ProgressBar({ value, label, tone = 'teal' }: { value: number; label?: string; tone?: 'teal' | 'violet' | 'amber' }) {
  return <div className="progress-wrap">
    {label && <div className="progress-label"><span>{label}</span><strong>{value}%</strong></div>}
    <div className="progress-track"><span className={`progress-fill progress-fill--${tone}`} style={{ width: `${value}%` }} /></div>
  </div>
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action && <div className="section-heading__action">{action}</div>}
  </div>
}

export function StatCard({ label, value, note, tone = 'default', icon }: { label: string; value: string | number; note: string; tone?: 'default' | 'teal' | 'amber' | 'red' | 'violet'; icon?: ReactNode }) {
  return <div className={`stat-card stat-card--${tone}`}><div className="stat-card__top"><span className="stat-card__label">{label}</span>{icon && <span className="stat-card__icon">{icon}</span>}</div><strong className="stat-card__value">{value}</strong><span className="stat-card__note">{note}</span></div>
}

export function EmptyState({ icon = <Sparkles size={21} />, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state__icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return <div className="skeleton-stack" aria-label="Loading"><span className="skeleton skeleton--heading" />{Array.from({ length: count }).map((_, index) => <span className="skeleton skeleton--row" key={index} />)}</div>
}

export function IconLink({ children }: { children: ReactNode }) {
  return <button className="text-link">{children}<ArrowUpRight size={14} /></button>
}

export function Spinner() { return <LoaderCircle className="spin" size={16} /> }
