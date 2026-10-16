import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { employees as initialEmployees, initialDocuments, initialTasks, policySources, type DemoDocument, type DocumentStatus, type Employee, type PolicySource, type Role, type Task, type TaskStatus } from './data';

interface DemoContextValue {
  role: Role;
  setRole: (role: Role) => void;
  tasks: Task[];
  setTaskStatus: (id: string, status: TaskStatus) => void;
  documents: DemoDocument[];
  addDocument: (name: string) => string;
  setDocumentStatus: (id: string, status: DocumentStatus) => void;
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'initials'>) => void;
  policies: PolicySource[];
  addPolicy: (policy: Omit<PolicySource, 'id' | 'updated' | 'status'>) => void;
  togglePolicy: (id: string) => void;
  removePolicy: (id: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('employee');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [documents, setDocuments] = useState<DemoDocument[]>(initialDocuments);
  const [employeeRows, setEmployeeRows] = useState<Employee[]>(employeesFromDemo());
  const [policyRows, setPolicyRows] = useState<PolicySource[]>(policySources.map((policy) => ({ ...policy, status: 'Published' })));

  const value = useMemo<DemoContextValue>(() => ({
    role,
    setRole,
    tasks,
    setTaskStatus: (id, status) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task)),
    documents,
    addDocument: (name) => {
      const id = `d-${Date.now()}`;
      setDocuments((current) => [{ id, name, type: 'Local demo file', date: 'Added just now', status: 'uploaded' }, ...current]);
      return id;
    },
    setDocumentStatus: (id, status) => setDocuments((current) => current.map((document) => document.id === id && (status !== 'pending-review' || document.status === 'uploaded') ? { ...document, status } : document)),
    employees: employeeRows,
    addEmployee: (employee) => setEmployeeRows((current) => {
      const id = `CP-${1080 + current.length}`;
      const initials = employee.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
      return [{ ...employee, id, initials }, ...current];
    }),
    policies: policyRows,
    addPolicy: (policy) => setPolicyRows((current) => [{ ...policy, id: `pol-${Date.now()}`, updated: 'Added just now', status: 'Draft' }, ...current]),
    togglePolicy: (id) => setPolicyRows((current) => current.map((policy) => policy.id === id ? { ...policy, status: policy.status === 'Published' ? 'Draft' : 'Published', updated: 'Just now' } : policy)),
    removePolicy: (id) => setPolicyRows((current) => current.filter((policy) => policy.id !== id)),
  }), [role, tasks, documents, employeeRows, policyRows]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

function employeesFromDemo(): Employee[] {
  return initialEmployees;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
}
