import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  type Profile,
  type UserRole,
  type EmployeeTask,
  type DocumentRecord,
  type Policy,
  type AuditLogRow,
} from './lib/supabase';
import {
  employees as initialEmployees,
  initialDocuments,
  initialTasks,
  initialTemplates,
  buildingPlanItems,
  policySources,
  complianceItems,
  type DemoDocument,
  type DocumentStatus,
  type Employee,
  type OnboardingTemplate,
  type PolicySource,
  type Role,
  type Task,
  type TaskStatus,
  type TemplateTask,
} from './data';

export interface TaskAuditLog {
  id: string;
  employeeId: string;
  taskId: string;
  taskTitle: string;
  oldDue: string;
  newDue: string;
  reason?: string;
  actor: string;
  timestamp: string;
}

export interface BuildingDecisionState {
  priority: 'Must have' | 'Should have' | 'Nice to have';
  decision: 'Approved' | 'In Review' | 'Hold';
  notes: string;
}

export interface PolicyAnswerResult {
  answer: string;
  sourceSection?: string;
  sourceTitle?: string;
  sourceId?: string;
  fallback: boolean;
  error?: boolean;
}

interface AppContextValue {
  // Auth & Session
  user: User | null;
  profile: Profile | null;
  displayName: string;
  role: Role; // 'employee' | 'manager' | 'admin'
  userRole: UserRole; // 'employee' | 'manager' | 'hr_admin'
  authLoading: boolean;
  isLive: boolean;
  signOut: () => Promise<void>;

  // Tasks
  tasks: Task[];
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskDate: (id: string, newDue: string, reason?: string) => Promise<void>;
  getEmployeeTasks: (employee: Employee) => Task[];
  updateEmployeeTaskDate: (employeeId: string, taskId: string, newDue: string, reason?: string) => Promise<void>;
  addAdHocTask: (employeeId: string, title: string, category: string, dueDate: string, description?: string) => Promise<void>;

  // Documents
  documents: DemoDocument[];
  addDocument: (name: string, file?: File, taskId?: string) => Promise<string>;
  setDocumentStatus: (id: string, status: DocumentStatus, employeeId?: string, taskId?: string) => Promise<void>;

  // Employees / Directory
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'initials'>) => Promise<void>;

  // Policies & RAG
  policies: PolicySource[];
  addPolicy: (policy: Omit<PolicySource, 'id' | 'updated' | 'status'>, file?: File) => Promise<void>;
  togglePolicy: (id: string) => Promise<void>;
  removePolicy: (id: string) => Promise<void>;
  askPolicy: (question: string) => Promise<PolicyAnswerResult>;

  // Templates
  templates: OnboardingTemplate[];
  updateTemplate: (templateId: string, updates: Partial<OnboardingTemplate>) => Promise<void>;
  updateTemplateTask: (templateId: string, taskId: string, taskUpdates: Partial<TemplateTask>) => Promise<void>;
  addTemplateTask: (templateId: string, task: Omit<TemplateTask, 'id'>) => Promise<void>;
  deleteTemplateTask: (templateId: string, taskId: string) => Promise<void>;
  addTemplate: (template: Omit<OnboardingTemplate, 'id' | 'updated'>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;

  // Compliance & Reports
  complianceItemsList: typeof complianceItems;
  exportComplianceReport: (range: string, includeTasks: boolean, includeDocs: boolean) => Promise<string>;

  // Audit Logs
  taskAuditLogs: TaskAuditLog[];
  auditLogs: AuditLogRow[];

  // Building plan / blueprint
  buildingDecisions: Record<string, BuildingDecisionState>;
  updateBuildingDecision: (featureId: string, updates: Partial<BuildingDecisionState>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const isConfigured = isSupabaseConfigured();

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Data State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [employeeTaskOverrides, setEmployeeTaskOverrides] = useState<Record<string, Task[]>>({});
  const [documents, setDocuments] = useState<DemoDocument[]>(initialDocuments);
  const [employeeRows, setEmployeeRows] = useState<Employee[]>(initialEmployees);
  const [policyRows, setPolicyRows] = useState<PolicySource[]>(
    policySources.map((policy) => ({ ...policy, status: 'Published' }))
  );
  const [templates, setTemplates] = useState<OnboardingTemplate[]>(initialTemplates);
  const [taskAuditLogs, setTaskAuditLogs] = useState<TaskAuditLog[]>([
    {
      id: 'log-1',
      employeeId: 'CP-1048',
      taskId: 't4',
      taskTitle: 'Upload your identity document',
      oldDue: 'Due Oct 4',
      newDue: 'Submitted Oct 6',
      reason: 'Employee provided high-res document',
      actor: 'Jordan Lee (HR Admin)',
      timestamp: 'Oct 6, 2026 · 11:24 AM',
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);

  const [buildingDecisions, setBuildingDecisions] = useState<Record<string, BuildingDecisionState>>(() => {
    const initial: Record<string, BuildingDecisionState> = {};
    for (const item of buildingPlanItems) {
      initial[item.id] = {
        priority: item.defaultPriority,
        decision: item.defaultPriority === 'Must have' ? 'Approved' : 'In Review',
        notes: '',
      };
    }
    return initial;
  });

  // Calculate effective role
  const userRole: UserRole = profile?.role || 'employee';
  const role: Role = userRole === 'hr_admin' ? 'admin' : userRole;

  // 1. Initialize Supabase Auth & Session listener
  useEffect(() => {
    if (!isConfigured) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [isConfigured]);

  async function loadUserProfile(userId: string, currentUser?: User | null) {
    try {
      const activeUser = currentUser || user;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch warning (new user may need setup):', error.message);
        // Fallback to user metadata if profile table row is being provisioned
        const metaName = activeUser?.user_metadata?.full_name;
        const metaRole = activeUser?.user_metadata?.role as UserRole | undefined;
        setProfile({
          id: userId,
          full_name: metaName || (activeUser?.email ? activeUser.email.split('@')[0] : 'Team Member'),
          role: metaRole || 'employee',
          department: 'General',
          manager_id: null,
          start_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        });
        return;
      }

      if (data) {
        setProfile(data as Profile);
        // Refresh backend data for this authenticated user
        loadBackendData(data as Profile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  // 2. Fetch real data from Supabase if authenticated
  async function loadBackendData(userProfile: Profile) {
    try {
      // Load user's tasks
      if (userProfile.role === 'employee' || userProfile.role === 'manager') {
        const { data: taskData, error: taskErr } = await supabase
          .from('employee_tasks')
          .select('*')
          .eq('employee_id', userProfile.id)
          .order('due_date', { ascending: true });

        if (!taskErr && taskData && taskData.length > 0) {
          const mappedTasks: Task[] = taskData.map((t: EmployeeTask) => ({
            id: t.id,
            title: t.title || 'Onboarding Task',
            category: (t as unknown as { category: string }).category || 'Getting started',
            due: t.due_date ? `Due ${t.due_date}` : 'Due soon',
            status: (t.status === 'pending_review' ? 'pending-review' : t.status === 'in_progress' ? 'in-progress' : t.status === 'not_started' ? 'not-started' : 'completed') as TaskStatus,
            description: t.description || '',
          }));
          setTasks(mappedTasks);
        }
      }

      // Load documents
      const { data: docData, error: docErr } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (!docErr && docData && docData.length > 0) {
        const mappedDocs: DemoDocument[] = docData.map((d: DocumentRecord) => ({
          id: d.id,
          name: d.storage_path.split('/').pop() || 'Document',
          type: 'Secure PDF',
          date: new Date(d.uploaded_at).toLocaleDateString(),
          status: (d.status === 'pending_review' ? 'pending-review' : d.status) as DocumentStatus,
        }));
        setDocuments(mappedDocs);
      }

      // Load policies
      const { data: policyData, error: polErr } = await supabase
        .from('policies')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (!polErr && policyData && policyData.length > 0) {
        const mappedPolicies: PolicySource[] = policyData.map((p: Policy) => ({
          id: p.id,
          title: p.title,
          section: `Version ${p.version}`,
          updated: new Date(p.uploaded_at).toLocaleDateString(),
          body: `Official policy document stored securely at ${p.storage_path}`,
          status: 'Published',
        }));
        setPolicyRows(mappedPolicies);
      }

      // If HR Admin, load full employee directory & audit log
      if (userProfile.role === 'hr_admin') {
        const { data: allProfiles, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!profErr && allProfiles && allProfiles.length > 0) {
          const mappedEmployees: Employee[] = allProfiles.map((p: Profile, idx: number) => ({
            id: `CP-${1040 + idx}`,
            name: p.full_name,
            initials: p.full_name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase(),
            email: `${p.full_name.toLowerCase().replace(/\s+/g, '.')}@northstar.test`,
            department: p.department || 'General',
            role: p.role === 'hr_admin' ? 'HR Admin' : p.role === 'manager' ? 'Team Lead' : 'Associate',
            manager: 'Jordan Lee',
            startDate: p.start_date || 'Oct 1, 2026',
            progress: 75,
            status: 'On track',
          }));
          setEmployeeRows(mappedEmployees);
        }

        const { data: logsData, error: logErr } = await supabase
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!logErr && logsData) {
          setAuditLogs(logsData as AuditLogRow[]);
        }
      }
    } catch (err) {
      console.error('Error loading Supabase backend data:', err);
    }
  }

  // 3. Auth Actions
  async function signOut() {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  }

  // 4. Task Management
  const getEmployeeTasks = (employee: Employee): Task[] => {
    if (employeeTaskOverrides[employee.id]) {
      return employeeTaskOverrides[employee.id];
    }
    if (employee.id === 'CP-1048') {
      return tasks;
    }
    const completedCount = Math.round((employee.progress / 100) * tasks.length);
    return tasks.map((task, index) => ({
      ...task,
      id: `${employee.id}-${task.id}`,
      status: (index < completedCount
        ? 'completed'
        : index === completedCount
        ? employee.status === 'Needs attention'
          ? 'pending-review'
          : 'in-progress'
        : 'not-started') as TaskStatus,
    }));
  };

  const setTaskStatus = async (id: string, status: TaskStatus) => {
    // Optimistic UI update
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));

    if (isConfigured && user) {
      try {
        const dbStatus =
          status === 'pending-review'
            ? 'pending_review'
            : status === 'in-progress'
            ? 'in_progress'
            : status === 'not-started'
            ? 'not_started'
            : 'completed';

        await supabase
          .from('employee_tasks')
          .update({
            status: dbStatus,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          })
          .eq('id', id);
      } catch (err) {
        console.error('Error updating task status in Supabase:', err);
      }
    }
  };

  const updateTaskDate = async (taskId: string, newDue: string, reason?: string) => {
    let affectedTitle = '';
    let oldDue = '';

    setTasks((current) =>
      current.map((t) => {
        if (t.id === taskId) {
          affectedTitle = t.title;
          oldDue = t.due;
          return { ...t, due: newDue };
        }
        return t;
      })
    );

    setEmployeeTaskOverrides((prev) => {
      if (!prev['CP-1048']) return prev;
      return {
        ...prev,
        'CP-1048': prev['CP-1048'].map((t) => (t.id === taskId ? { ...t, due: newDue } : t)),
      };
    });

    const newLog: TaskAuditLog = {
      id: `log-${Date.now()}`,
      employeeId: 'CP-1048',
      taskId,
      taskTitle: affectedTitle || 'Onboarding task',
      oldDue,
      newDue,
      reason: reason || 'HR Admin adjusted deadline',
      actor: profile?.full_name ? `${profile.full_name} (HR Admin)` : 'Jordan Lee (HR Admin)',
      timestamp: 'Just now',
    };

    setTaskAuditLogs((logs) => [newLog, ...logs]);

    if (isConfigured && user) {
      try {
        // Extract ISO date or keep string
        const parsedDate = newDue.replace(/^Due\s*/i, '').trim();
        await supabase
          .from('employee_tasks')
          .update({ due_date: parsedDate })
          .eq('id', taskId);

        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'task_due_date_updated',
          target_table: 'employee_tasks',
          target_id: taskId,
          metadata: { old_due: oldDue, new_due: newDue, reason },
        });
      } catch (err) {
        console.error('Error writing audit log for task date update:', err);
      }
    }
  };

  const updateEmployeeTaskDate = async (
    employeeId: string,
    taskId: string,
    newDue: string,
    reason?: string
  ) => {
    if (employeeId === 'CP-1048') {
      await updateTaskDate(taskId, newDue, reason);
      return;
    }

    const emp = employeeRows.find((e) => e.id === employeeId);
    let targetTitle = '';
    let oldDue = '';

    setEmployeeTaskOverrides((prev) => {
      const existing = prev[employeeId] || (emp ? getEmployeeTasks(emp) : []);
      const updated = existing.map((t) => {
        if (t.id === taskId) {
          targetTitle = t.title;
          oldDue = t.due;
          return { ...t, due: newDue };
        }
        return t;
      });
      return { ...prev, [employeeId]: updated };
    });

    const newLog: TaskAuditLog = {
      id: `log-${Date.now()}`,
      employeeId,
      taskId,
      taskTitle: targetTitle || 'Onboarding task',
      oldDue,
      newDue,
      reason: reason || 'HR Admin adjusted deadline',
      actor: profile?.full_name ? `${profile.full_name} (HR Admin)` : 'Jordan Lee (HR Admin)',
      timestamp: 'Just now',
    };

    setTaskAuditLogs((logs) => [newLog, ...logs]);

    if (isConfigured && user) {
      try {
        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'employee_task_due_date_updated',
          target_table: 'employee_tasks',
          target_id: taskId,
          metadata: { employee_id: employeeId, old_due: oldDue, new_due: newDue, reason },
        });
      } catch (err) {
        console.error('Audit log error:', err);
      }
    }
  };

  const addAdHocTask = async (
    employeeId: string,
    title: string,
    category: string,
    dueDate: string,
    description: string = ''
  ) => {
    const taskId = `task-adhoc-${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      title,
      category,
      due: dueDate,
      status: 'not-started',
      description,
    };

    setTasks((current) => [newTask, ...current]);

    if (isConfigured && user) {
      try {
        await supabase.from('employee_tasks').insert({
          id: taskId,
          employee_id: employeeId,
          title,
          category,
          due_date: dueDate,
          description,
          status: 'not_started',
        });

        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'ad_hoc_task_created',
          target_table: 'employee_tasks',
          target_id: taskId,
          metadata: { employee_id: employeeId, title, due_date: dueDate },
        });
      } catch (err) {
        console.error('Error adding ad-hoc task:', err);
      }
    }
  };

  // 5. Documents & Storage
  const addDocument = async (name: string, file?: File, taskId?: string): Promise<string> => {
    const documentId = `d-${Date.now()}`;
    const newDoc: DemoDocument = {
      id: documentId,
      name,
      type: 'Secure PDF',
      date: 'Added just now',
      status: 'uploaded',
    };

    setDocuments((current) => [newDoc, ...current]);

    if (isConfigured && user) {
      try {
        const employeeId = user.id;
        const fileExt = file?.name.split('.').pop() || 'pdf';
        const storagePath = `documents/${employeeId}/${documentId}.${fileExt}`;

        if (file) {
          await supabase.storage.from('documents').upload(storagePath, file, {
            contentType: file.type || 'application/pdf',
            upsert: true,
          });
        }

        await supabase.from('documents').insert({
          id: documentId,
          employee_id: employeeId,
          employee_task_id: taskId || null,
          storage_path: storagePath,
          status: 'uploaded',
        });

        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'document_uploaded',
          target_table: 'documents',
          target_id: documentId,
          metadata: { file_name: name, storage_path: storagePath },
        });
      } catch (err) {
        console.error('Error uploading document to Supabase:', err);
      }
    }

    return documentId;
  };

  const setDocumentStatus = async (
    id: string,
    status: DocumentStatus,
    employeeId?: string,
    taskId?: string
  ) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id ? { ...document, status } : document
      )
    );

    // If approved and linked to a task, auto-complete the task per Journey A
    if (status === 'approved' && taskId) {
      await setTaskStatus(taskId, 'completed');
    }

    if (isConfigured && user) {
      try {
        const dbStatus =
          status === 'pending-review'
            ? 'pending_review'
            : status;

        await supabase
          .from('documents')
          .update({
            status: dbStatus,
            reviewed_by: user.id,
          })
          .eq('id', id);

        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'document_reviewed',
          target_table: 'documents',
          target_id: id,
          metadata: { status, employee_id: employeeId },
        });
      } catch (err) {
        console.error('Error updating document status in Supabase:', err);
      }
    }
  };

  // 6. Employees Directory
  const addEmployee = async (employee: Omit<Employee, 'id' | 'initials'>) => {
    const id = `CP-${1080 + employeeRows.length}`;
    const initials = employee.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();

    setEmployeeRows((current) => [{ ...employee, id, initials }, ...current]);

    if (isConfigured && user) {
      try {
        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'employee_profile_created',
          target_table: 'profiles',
          target_id: id,
          metadata: { name: employee.name, department: employee.department },
        });
      } catch (err) {
        console.error('Error adding employee audit log:', err);
      }
    }
  };

  // 7. Policies & RAG
  const addPolicy = async (policy: Omit<PolicySource, 'id' | 'updated' | 'status'>, file?: File) => {
    const policyId = `pol-${Date.now()}`;
    const newPolicy: PolicySource = {
      ...policy,
      id: policyId,
      updated: 'Added just now',
      status: 'Published',
    };

    setPolicyRows((current) => [newPolicy, ...current]);

    if (isConfigured && user) {
      try {
        let storagePath = `policies/${policyId}.pdf`;
        if (file) {
          const res = await supabase.storage.from('policies').upload(storagePath, file, {
            contentType: 'application/pdf',
            upsert: true,
          });
          if (res.data?.path) storagePath = res.data.path;
        }

        await supabase.from('policies').insert({
          id: policyId,
          title: policy.title,
          storage_path: storagePath,
          version: 1,
          uploaded_by: user.id,
        });

        // Insert policy chunk for vector/text search
        await supabase.from('policy_chunks').insert({
          policy_id: policyId,
          content: `${policy.title}. ${policy.section}. ${policy.body}`,
          section_ref: policy.section || 'General',
        });

        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'policy_uploaded',
          target_table: 'policies',
          target_id: policyId,
          metadata: { title: policy.title },
        });
      } catch (err) {
        console.error('Error adding policy to Supabase:', err);
      }
    }
  };

  const togglePolicy = async (id: string) => {
    setPolicyRows((current) =>
      current.map((policy) =>
        policy.id === id
          ? {
              ...policy,
              status: policy.status === 'Published' ? 'Draft' : 'Published',
              updated: 'Just now',
            }
          : policy
      )
    );
  };

  const removePolicy = async (id: string) => {
    setPolicyRows((current) => current.filter((policy) => policy.id !== id));
  };

  const askPolicy = async (question: string): Promise<PolicyAnswerResult> => {
    // If Supabase Edge Function is configured, invoke 'ask-policy'
    if (isConfigured) {
      try {
        const { data, error } = await supabase.functions.invoke('ask-policy', {
          body: { question },
        });

        if (!error && data && data.answer) {
          return {
            answer: data.answer,
            sourceTitle: data.sourceTitle,
            sourceSection: data.sourceSection,
            sourceId: data.sourceId,
            fallback: !!data.fallback,
          };
        }
      } catch (err) {
        console.warn('Edge Function ask-policy not reachable, evaluating local sources:', err);
      }
    }

    // Strict Fallback Engine: Only grounded answers or explicit "contact HR" message
    const cleanQ = question.toLowerCase();
    const published = policyRows.filter((p) => p.status === 'Published');

    if (!published.length) {
      return {
        answer:
          'No policies are published in the library right now, so I cannot verify an answer. Please contact People Operations directly for guidance.',
        fallback: true,
      };
    }

    const matched = published.find(
      (p) =>
        cleanQ.includes(p.title.toLowerCase()) ||
        cleanQ.includes(p.section.toLowerCase()) ||
        p.body.toLowerCase().split(/\s+/).some((w) => w.length > 4 && cleanQ.includes(w))
    );

    if (matched) {
      return {
        answer: matched.body,
        sourceTitle: matched.title,
        sourceSection: matched.section,
        sourceId: matched.id,
        fallback: false,
      };
    }

    return {
      answer:
        'I am not sure based on our published policies. Please contact People Operations directly so they can confirm the right guidance for your situation.',
      fallback: true,
    };
  };

  // 8. Onboarding Templates
  const updateTemplate = async (templateId: string, updates: Partial<OnboardingTemplate>) => {
    setTemplates((current) =>
      current.map((tpl) =>
        tpl.id === templateId ? { ...tpl, ...updates, updated: 'Just now' } : tpl
      )
    );
  };

  const updateTemplateTask = async (
    templateId: string,
    taskId: string,
    taskUpdates: Partial<TemplateTask>
  ) => {
    setTemplates((current) =>
      current.map((tpl) => {
        if (tpl.id !== templateId) return tpl;
        const updatedTasks = tpl.tasks.map((task) =>
          task.id === taskId ? { ...task, ...taskUpdates } : task
        );
        return { ...tpl, tasks: updatedTasks, updated: 'Just now' };
      })
    );
  };

  const addTemplateTask = async (templateId: string, task: Omit<TemplateTask, 'id'>) => {
    setTemplates((current) =>
      current.map((tpl) => {
        if (tpl.id !== templateId) return tpl;
        const newTask: TemplateTask = {
          ...task,
          id: `st-${Date.now()}`,
        };
        return {
          ...tpl,
          tasks: [...tpl.tasks, newTask],
          updated: 'Just now',
        };
      })
    );
  };

  const deleteTemplateTask = async (templateId: string, taskId: string) => {
    setTemplates((current) =>
      current.map((tpl) => {
        if (tpl.id !== templateId) return tpl;
        return {
          ...tpl,
          tasks: tpl.tasks.filter((t) => t.id !== taskId),
          updated: 'Just now',
        };
      })
    );
  };

  const addTemplate = async (template: Omit<OnboardingTemplate, 'id' | 'updated'>) => {
    const id = `tpl-${Date.now()}`;
    setTemplates((current) => [
      {
        ...template,
        id,
        updated: 'Just now',
      },
      ...current,
    ]);
  };

  const deleteTemplate = async (templateId: string) => {
    setTemplates((current) => current.filter((tpl) => tpl.id !== templateId));
  };

  // 9. Compliance CSV Export + Real DB Audit Write
  const exportComplianceReport = async (
    range: string,
    includeTasks: boolean,
    includeDocs: boolean
  ): Promise<string> => {
    let rows: string[][] = [
      ['Employee ID', 'Employee Name', 'Department', 'Start Date', 'Onboarding Progress', 'Status'],
      ...employeeRows.map((e) => [
        e.id,
        e.name,
        e.department,
        e.startDate,
        `${e.progress}%`,
        e.status,
      ]),
    ];

    if (includeTasks) {
      rows.push([]);
      rows.push(['TASK AUDIT TRAIL', 'Task Title', 'Previous Due', 'Updated Due', 'Reason', 'Timestamp']);
      taskAuditLogs.forEach((l) => {
        rows.push([l.employeeId, l.taskTitle, l.oldDue, l.newDue, l.reason || '', l.timestamp]);
      });
    }

    if (includeDocs) {
      rows.push([]);
      rows.push(['DOCUMENT VERIFICATION LOG', 'Document Name', 'Review Status', 'Uploaded Date']);
      documents.forEach((d) => {
        rows.push([d.id, d.name, d.status, d.date]);
      });
    }

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\r\n');

    // Trigger download in browser
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complypilot-compliance-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    // STEP 6: Write audit_log row for CSV export
    if (isConfigured && user) {
      try {
        await supabase.from('audit_log').insert({
          actor_id: user.id,
          action: 'compliance_report_exported',
          target_table: 'compliance_records',
          target_id: user.id,
          metadata: {
            date_range: range,
            include_tasks: includeTasks,
            include_documents: includeDocs,
            records_count: employeeRows.length,
          },
        });
      } catch (err) {
        console.error('Error logging compliance export in audit_log:', err);
      }
    }

    return csvContent;
  };

  const updateBuildingDecision = (featureId: string, updates: Partial<BuildingDecisionState>) => {
    setBuildingDecisions((prev) => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        ...updates,
      },
    }));
  };

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string) ||
    (user?.email ? user.email.split('@')[0] : '');

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      profile,
      displayName,
      role,
      userRole,
      authLoading,
      isLive: isConfigured && !!user,
      signOut,
      tasks,
      setTaskStatus,
      updateTaskDate,
      getEmployeeTasks,
      updateEmployeeTaskDate,
      addAdHocTask,
      documents,
      addDocument,
      setDocumentStatus,
      employees: employeeRows,
      addEmployee,
      policies: policyRows,
      addPolicy,
      togglePolicy,
      removePolicy,
      askPolicy,
      templates,
      updateTemplate,
      updateTemplateTask,
      addTemplateTask,
      deleteTemplateTask,
      addTemplate,
      deleteTemplate,
      complianceItemsList: complianceItems,
      exportComplianceReport,
      taskAuditLogs,
      auditLogs,
      buildingDecisions,
      updateBuildingDecision,
    }),
    [
      user,
      profile,
      displayName,
      role,
      userRole,
      authLoading,
      isConfigured,
      tasks,
      employeeTaskOverrides,
      documents,
      employeeRows,
      policyRows,
      templates,
      taskAuditLogs,
      auditLogs,
      buildingDecisions,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useDemo() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
}
