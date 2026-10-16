import { useState, type ReactNode } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  Users,
  X,
  FileText,
  ClipboardList,
  UserRound,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { navAdmin, navEmployee, navManager, type Role } from './data';
import { Avatar } from './components';
import { AuthPage, LandingPage } from './pages/PublicPages';
import {
  AdminDashboard,
  CompliancePage,
  EmployeeDetailPage,
  EmployeeDirectoryPage,
  PoliciesPage,
  ReportsPage,
  SettingsPage,
  TemplatesPage,
} from './pages/AdminPages';
import {
  AskPage,
  DashboardPage,
  DocumentsPage,
  ProfilePage,
  TasksPage,
  TeamPage,
} from './pages/EmployeePages';
import { OnboardingPage } from './pages/OnboardingPage';
import { DemoProvider, useDemo } from './state';

const iconLookup = {
  overview: LayoutDashboard,
  tasks: ClipboardList,
  onboarding: Sparkles,
  documents: FileText,
  ask: MessageCircle,
  profile: UserRound,
  team: Users,
  templates: Grid2X2,
  compliance: ShieldCheck,
  reports: BarChart3,
  settings: Settings,
} as const;

export function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </DemoProvider>
  );
}

function AppRoutes() {
  const { user, role, authLoading, isLive } = useDemo();

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner" />
        <p>Loading ComplyPilot workspace...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user || !isLive ? (
            role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/app/dashboard" replace />
            )
          ) : (
            <LandingPage />
          )
        }
      />
      <Route
        path="/login"
        element={
          user && isLive ? (
            role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/app/dashboard" replace />
            )
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/signup"
        element={
          user && isLive ? (
            role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/app/dashboard" replace />
            )
          ) : (
            <AuthPage signup />
          )
        }
      />

      {/* Employee / Manager Portal */}
      <Route path="/app" element={<RoleLayout admin={false} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="onboarding" element={<OnboardingPage adminMode={false} />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="ask" element={<AskPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="team"
          element={
            <ManagerOnly>
              <TeamPage />
            </ManagerOnly>
          }
        />
      </Route>

      {/* HR Admin Console */}
      <Route path="/admin" element={<RoleLayout admin />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<EmployeeDirectoryPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="onboarding" element={<OnboardingPage adminMode />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function RoleLayout({ admin }: { admin: boolean }) {
  const { user, role, isLive } = useDemo();

  // If live Supabase auth is enabled and user is not authenticated, redirect to /login
  if (isLive && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect rules per App Flow spec:
  // Non-admin accessing /admin -> redirect to /app/dashboard
  if (admin && role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Admin accessing /app -> redirect to /admin/dashboard
  if (!admin && role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <AppShell admin={admin}>
      <Outlet />
    </AppShell>
  );
}

function ManagerOnly({ children }: { children: ReactNode }) {
  const { role } = useDemo();
  return role === 'manager' || role === 'admin' ? (
    <>{children}</>
  ) : (
    <Navigate to="/app/dashboard" replace />
  );
}

function AppShell({ admin, children }: { admin: boolean; children: ReactNode }) {
  const { role, profile, user, signOut } = useDemo();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentRole: Role = admin ? 'admin' : role;
  const links = admin ? navAdmin : role === 'manager' ? navManager : navEmployee;
  const roleLabel =
    currentRole === 'admin'
      ? 'HR Admin'
      : currentRole === 'manager'
      ? 'Manager'
      : 'Employee';
  const pageTitle = location.pathname.startsWith('/admin')
    ? 'People operations'
    : 'Your workspace';

  const displayName = profile?.full_name || (role === 'admin' ? 'Jordan Lee' : 'Maya Chen');
  const userInitials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`app-shell ${mobileOpen ? 'mobile-nav-open' : ''}`}>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className="sidebar">
        <div className="sidebar-brand-row">
          <Brand />
          <button
            className="mobile-close icon-button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-mark">N</span>
          <span className="workspace-label">
            <strong>Northstar</strong>
            <small>Enterprise Workspace</small>
          </span>
          <ChevronDown size={15} />
        </div>
        <div className="nav-caption">{admin ? 'PEOPLE OPERATIONS' : 'WORKSPACE'}</div>
        <nav className="main-nav" aria-label={`${roleLabel} navigation`}>
          {links.map((item) => {
            const Icon = iconLookup[item.icon as keyof typeof iconLookup];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.to === '/admin/dashboard' && <span className="nav-count">12</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">
              <CircleHelp size={16} />
            </span>
            <div>
              <strong>Need a hand?</strong>
              <small>Ask People Operations</small>
            </div>
            <ChevronDown size={14} />
          </div>

          <div className="sidebar-profile">
            <Avatar
              initials={userInitials}
              size="sm"
              color={role === 'admin' ? 'blue' : 'sage'}
            />
            <span className="profile-text-block">
              <strong>{displayName}</strong>
              <small>{user?.email || roleLabel}</small>
            </span>
            <button
              className="icon-button profile-signout-btn"
              aria-label="Sign out"
              title="Sign out of ComplyPilot"
              onClick={() => signOut()}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <div className="utility-bar">
          <div className="utility-left">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={19} />
            </button>
            <span className="utility-context">{pageTitle}</span>
            <span className="utility-separator">/</span>
            <span className="utility-context-muted">{roleLabel}</span>
          </div>
          <div className="utility-actions">
            <span className="environment-pill live-pill">
              <span className="live-status-dot" /> Secure Postgres + RLS
            </span>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Bell size={17} />
              <i />
            </button>
            <Avatar
              initials={userInitials}
              size="sm"
              color={role === 'admin' ? 'blue' : 'sage'}
            />
          </div>
        </div>
        <div className="page-content">{children}</div>
        <footer className="app-footer">
          <span>
            ComplyPilot <span className="footer-dot">·</span> Production Workspace
          </span>
          <span>Role-based access enforced via Row-Level Security</span>
        </footer>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="sidebar-brand" aria-label="ComplyPilot home">
      <span className="brand-badge">
        <FileCheck2 size={18} />
      </span>
      <div className="brand-text">
        <span className="brand-title">ComplyPilot</span>
        <span className="brand-tag">PEOPLE OPS</span>
      </div>
    </Link>
  );
}

function NotFound() {
  const { role } = useDemo();
  return (
    <main className="public-page not-found-page">
      <section className="auth-card">
        <div className="auth-emblem">
          <FileText size={22} />
        </div>
        <div className="eyebrow">404 ERROR</div>
        <h1>Page not found</h1>
        <p className="auth-subtitle">The page you were looking for doesn't exist.</p>
        <Link
          className="button button-primary"
          to={role === 'admin' ? '/admin/dashboard' : '/app/dashboard'}
        >
          Return to workspace
        </Link>
      </section>
    </main>
  );
}
