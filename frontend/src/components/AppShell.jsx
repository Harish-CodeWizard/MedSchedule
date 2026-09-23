import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  ScanLine,
  Settings,
  Stethoscope,
  UserRound,
  Users,
  X,
  CalendarPlus,
} from 'lucide-react';
import userStore from '../store/userStore';
import patientStore from '../store/patientStore';
import { dashboardPathForRole } from '../utils/navigation';

const roleNames = {
  Admin: 'Administrator',
  Reception: 'Reception',
  Doctor: 'Doctor',
  Lab: 'Laboratory',
  'X-Ray': 'Imaging',
  Pharmacy: 'Pharmacy',
  Patient: 'Patient',
};

const navigationByRole = {
  Admin: [
    { label: 'Admin overview', path: '/admin-dashboard', icon: LayoutDashboard },
    { label: 'Reception desk', path: '/reception-dashboard', icon: Users },
  ],
  Reception: [
    { label: 'Reception desk', path: '/reception-dashboard', icon: LayoutDashboard },
    { label: 'Admin overview', path: '/admin-dashboard', icon: BarChart3 },
  ],
  Doctor: [
    { label: 'Doctor dashboard', path: '/doctor-dashboard', icon: LayoutDashboard },
    { label: 'Patient records', path: '/patientDetailsByDoctor', icon: Users },
    { label: 'Recommend lab test', path: '/recommendTest', icon: FlaskConical },
    { label: 'Recommend X-ray', path: '/recommendXray', icon: ScanLine },
    { label: 'Prescriptions', path: '/medicine', icon: Pill },
  ],
  Lab: [
    { label: 'Laboratory dashboard', path: '/lab-dashboard', icon: LayoutDashboard },
    { label: 'Test records', path: '/labTest', icon: FlaskConical },
  ],
  'X-Ray': [
    { label: 'Imaging dashboard', path: '/xray-dashboard', icon: LayoutDashboard },
    { label: 'Test records', path: '/xrayTest', icon: ScanLine },
    { label: 'Walk-in registration', path: '/walkin-registration', icon: ClipboardList },
    { label: 'Walk-in records', path: '/walkin-record', icon: Activity },
  ],
  Pharmacy: [
    { label: 'Pharmacy dashboard', path: '/pharmacy-dashboard', icon: LayoutDashboard },
    { label: 'Prescription records', path: '/pharmacyRecords', icon: ClipboardList },
    { label: 'Walk-in records', path: '/WalkInRecords', icon: Pill },
  ],
  Patient: [
    { label: 'My dashboard', path: '/patient-dashboard', icon: LayoutDashboard },
    { label: 'Book appointment', path: '/book-appointment', icon: CalendarPlus },
  ],
};

function AppShell({ children }) {
  const { user, logoutUser } = userStore();
  const { patients } = patientStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleLinks = navigationByRole[user?.role] || [];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/persona-select');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="btn btn-ghost btn-square md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <button type="button" onClick={() => navigate(dashboardPathForRole(user?.role))} className="flex items-center gap-2 text-left">
            <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-950">MediSchedule</p>
              <p className="text-[11px] text-slate-500">Outpatient operations</p>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{roleNames[user?.role] || user?.role}</p>
          </div>
          <button type="button" onClick={() => navigate('/profile')} className="grid size-9 place-items-center rounded-full bg-blue-100 font-semibold text-blue-700" title="Open profile">
            {user?.name?.charAt(0)?.toUpperCase() || <UserRound className="size-4" />}
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {mobileOpen && <button type="button" aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" />}
        <aside className={`fixed inset-y-0 left-0 z-50 mt-16 flex w-72 -translate-x-full flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-xl transition-transform md:sticky md:top-16 md:z-20 md:mt-0 md:h-[calc(100vh-4rem)] md:translate-x-0 md:shadow-none ${mobileOpen ? 'translate-x-0' : ''}`}>
          <div className="mb-5 flex items-center justify-between md:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
            <button type="button" onClick={() => setMobileOpen(false)} className="btn btn-ghost btn-square btn-sm"><X className="size-4" /></button>
          </div>
          <div className="mb-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current workspace</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{roleNames[user?.role] || user?.role}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Operational tools and patient information in one place.</p>
          </div>
          <nav className="space-y-1" aria-label="Main navigation">
            {roleLinks.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                state={
                  user?.role === 'Doctor' && ['/recommendTest', '/recommendXray', '/medicine'].includes(path)
                    ? { patientID: patients?.[0]?._id, doctorID: user?._id }
                    : undefined
                }
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
            <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-slate-200 text-slate-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
              <Settings className="size-4" />
              Profile settings
            </NavLink>
          </nav>
          <div className="mt-auto border-t border-slate-200 pt-4">
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50">
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
