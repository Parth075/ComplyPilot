import { useState, type ReactNode } from 'react';
import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, CircleHelp, FileCheck2, Grid2X2, LayoutDashboard, Menu, MessageCircle, Settings, ShieldCheck, Users, X, FileText, ClipboardList, UserRound, BarChart3 } from 'lucide-react';
import { navAdmin, navEmployee, navManager, type Role } from './data';
import { Avatar } from './components';
import { AuthPage, LandingPage } from './pages/PublicPages';
import { AdminDashboard, CompliancePage, EmployeeDetailPage, EmployeeDirectoryPage, PoliciesPage, ReportsPage, SettingsPage, TemplatesPage } from './pages/AdminPages';
import { AskPage, DashboardPage, DocumentsPage, ProfilePage, TasksPage, TeamPage } from './pages/EmployeePages';
import { DemoProvider, useDemo } from './state';

const iconLookup = { overview: LayoutDashboard, tasks: ClipboardList, documents: FileText, ask: MessageCircle, profile: UserRound, team: Users, templates: Grid2X2, compliance: ShieldCheck, reports: BarChart3, settings: Settings } as const;

export function App() {
  return <DemoProvider><BrowserRouter><AppRoutes /></BrowserRouter></DemoProvider>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/signup" element={<AuthPage signup />} />
    <Route path="/app" element={<RoleLayout admin={false} />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="ask" element={<AskPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="team" element={<ManagerOnly><TeamPage /></ManagerOnly>} />
    </Route>
    <Route path="/admin" element={<RoleLayout admin />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="employees" element={<EmployeeDirectoryPage />} />
      <Route path="employees/:id" element={<EmployeeDetailPage />} />
      <Route path="templates" element={<TemplatesPage />} />
      <Route path="policies" element={<PoliciesPage />} />
      <Route path="compliance" element={<CompliancePage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>;
}

function RoleLayout({ admin }: { admin: boolean }) {
  const { role } = useDemo();
  if (admin && role !== 'admin') return <Navigate to="/app/dashboard" replace />;
  if (!admin && role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <AppShell admin={admin}><Outlet /></AppShell>;
}

function ManagerOnly({ children }: { children: ReactNode }) {
  const { role } = useDemo();
  return role === 'manager' ? <>{children}</> : <Navigate to="/app/dashboard" replace />;
}

function AppShell({ admin, children }: { admin: boolean; children: ReactNode }) {
  const { role, setRole } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentRole: Role = admin ? 'admin' : role;
  const links = admin ? navAdmin : role === 'manager' ? navManager : navEmployee;
  const roleLabel = currentRole === 'admin' ? 'HR Admin' : currentRole === 'manager' ? 'Manager' : 'Employee';
  const pageTitle = location.pathname.startsWith('/admin') ? 'People operations' : 'Your workspace';

  function switchRole(nextRole: Role) {
    setRole(nextRole);
    setMobileOpen(false);
    navigate(nextRole === 'admin' ? '/admin/dashboard' : '/app/dashboard');
  }

  return <div className={`app-shell ${mobileOpen ? 'mobile-nav-open' : ''}`}>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className="sidebar">
      <div className="sidebar-brand-row"><Brand /><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="workspace-switch"><span className="workspace-mark">N</span><span className="workspace-label"><strong>Northstar</strong><small>Sample organization</small></span><ChevronDown size={15} /></div>
      <div className="nav-caption">{admin ? 'PEOPLE OPERATIONS' : 'WORKSPACE'}</div>
      <nav className="main-nav" aria-label={`${roleLabel} navigation`}>
        {links.map((item) => {
          const Icon = iconLookup[item.icon as keyof typeof iconLookup];
          return <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} onClick={() => setMobileOpen(false)}>
            <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>
            {item.to === '/admin/dashboard' && <span className="nav-count">12</span>}
          </NavLink>;
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-icon"><CircleHelp size={16} /></span><div><strong>Need a hand?</strong><small>Ask People Operations</small></div><ChevronDown size={14} /></div>
        <label className="role-switch-label" htmlFor="role-switch">DEMO ROLE</label>
        <div className="role-select-wrap"><select id="role-switch" className="role-select" value={role} onChange={(event) => switchRole(event.target.value as Role)} aria-label="Switch demo role"><option value="employee">Employee view</option><option value="manager">Manager view</option><option value="admin">HR Admin view</option></select><ChevronDown size={14} /></div>
        <div className="sidebar-profile"><Avatar initials={role === 'admin' ? 'JL' : role === 'manager' ? 'JL' : 'MC'} size="sm" color={role === 'admin' ? 'blue' : 'sage'} /><span><strong>{role === 'admin' ? 'Jordan Lee' : role === 'manager' ? 'Jordan Lee' : 'Maya Chen'}</strong><small>{roleLabel}</small></span><button className="icon-button profile-more" aria-label="Profile options"><span>···</span></button></div>
      </div>
    </aside>
    <main className="main-area">
      <div className="utility-bar"><div className="utility-left"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button><span className="utility-context">{pageTitle}</span><span className="utility-separator">/</span><span className="utility-context-muted">{roleLabel}</span></div><div className="utility-actions"><span className="environment-pill"><span /> Demo environment</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={17} /><i /></button><Avatar initials={role === 'admin' || role === 'manager' ? 'JL' : 'MC'} size="sm" color={role === 'admin' ? 'blue' : 'sage'} /></div></div>
      <div className="page-content">{children}</div>
      <footer className="app-footer"><span>ComplyPilot <span className="footer-dot">·</span> Internal workspace</span><span>Sample data for walkthrough</span></footer>
    </main>
  </div>;
}

function Brand() {
  return <Link to="/" className="sidebar-brand" aria-label="ComplyPilot home"><span className="sidebar-wordmark">Comply<span>Pilot</span></span></Link>;
}

function NotFound() {
  return <main className="public-page not-found"><div className="not-found-card"><div className="eyebrow">404 · PAGE NOT FOUND</div><h1>This page isn’t on the checklist.</h1><p>Return to the ComplyPilot workspace and continue from there.</p><Link to="/" className="button button-primary">Back to home <FileCheck2 size={15} /></Link></div></main>;
}
