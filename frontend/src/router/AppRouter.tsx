import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppShell } from '../components/layout/AppShell';

// Auth
import { LoginPage } from '../pages/auth/LoginPage';

// Admin Pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { LiveRecognitionPage } from '../pages/admin/LiveRecognitionPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { StudentNewPage } from '../pages/admin/StudentNewPage';
import { StudentDetailPage } from '../pages/admin/StudentDetailPage';
import { AttendancePage } from '../pages/admin/AttendancePage';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { CamerasPage } from '../pages/admin/CamerasPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage';
import { StudentCalendarPage } from '../pages/student/StudentCalendarPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

// 404
import { NotFoundPage } from '../pages/NotFoundPage';
import { useAuthStore } from '../stores/authStore';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirection based on role */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="ADMIN">
              <AppShell />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="live-recognition" element={<LiveRecognitionPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<StudentNewPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="cameras" element={<CamerasPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="STUDENT">
              <AppShell />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="attendance" element={<StudentAttendancePage />} />
        <Route path="calendar" element={<StudentCalendarPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
