import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  return (
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  );
};

export type UserRole = 'employee' | 'manager' | 'hr_admin';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  department: string;
  manager_id: string | null;
  start_date: string;
  created_at: string;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  role_target: string;
  created_by: string;
  created_at: string;
}

export interface TemplateTask {
  id: string;
  template_id: string;
  title: string;
  description: string;
  due_offset_days: number;
  required: boolean;
}

export type EmployeeTaskStatus = 'not_started' | 'in_progress' | 'pending_review' | 'completed';

export interface EmployeeTask {
  id: string;
  employee_id: string;
  template_task_id: string | null;
  title?: string;
  description?: string;
  status: EmployeeTaskStatus;
  due_date: string;
  completed_at: string | null;
  template_task?: TemplateTask | null;
}

export type DocumentReviewStatus = 'uploaded' | 'pending_review' | 'approved' | 'rejected';

export interface DocumentRecord {
  id: string;
  employee_id: string;
  employee_task_id: string | null;
  storage_path: string;
  status: DocumentReviewStatus;
  uploaded_at: string;
  reviewed_by: string | null;
}

export interface Policy {
  id: string;
  title: string;
  storage_path: string;
  version: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface PolicyChunk {
  id: string;
  policy_id: string;
  content: string;
  section_ref: string;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  applies_to_role: string | null;
  recurrence: 'one_time' | 'annual';
  policy_id: string | null;
}

export interface ComplianceRecord {
  id: string;
  employee_id: string;
  requirement_id: string;
  status: 'pending' | 'completed' | 'overdue';
  due_date: string;
  completed_at: string | null;
  requirement?: ComplianceRequirement;
  employee?: Profile;
}

export interface AuditLogRow {
  id: string;
  actor_id: string;
  action: string;
  target_table: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
