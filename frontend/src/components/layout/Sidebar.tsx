import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanFace,
  Users,
  CalendarCheck,
  BarChart3,
  FileSpreadsheet,
  Camera,
  ShieldAlert,
  Settings,
  LogOut,
  Calendar,
  UserCheck,
  Radio,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  interface NavItem {
    to: string;
    icon: any;
    label: string;
    highlight?: boolean;
  }

  const adminNav: NavItem[] = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/live-recognition', icon: ScanFace, label: 'Live Recognition', highlight: true },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance Records' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/reports', icon: FileSpreadsheet, label: 'Reports' },
    { to: '/admin/cameras', icon: Camera, label: 'Cameras' },
    { to: '/admin/audit-logs', icon: ShieldAlert, label: 'Audit Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const studentNav: NavItem[] = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/student/attendance', icon: CalendarCheck, label: 'My Attendance' },
    { to: '/student/calendar', icon: Calendar, label: 'Attendance Calendar' },
    { to: '/student/profile', icon: UserCheck, label: 'My Profile' },
  ];

  const links = isAdmin() ? adminNav : studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 backdrop-blur-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ScanFace className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide block leading-tight">
                SMART ATTENDANCE
              </span>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest">
                AI Vision Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    } ${item.highlight && !isActive ? 'text-sky-300 bg-sky-500/5' : ''}`
                  }
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User & Logout section */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-cyan-400 border border-slate-700">
              {user?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
