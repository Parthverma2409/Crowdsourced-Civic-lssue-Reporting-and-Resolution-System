import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROLES } from "./lib/constants";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Auth & Landing
const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/auth/AuthPage"));
const SSOCallback = lazy(() => import("./pages/auth/SSOCallback"));

// Helper portal
const HelperLayout = lazy(() => import("./pages/helper/HelperLayout"));
const HelperHome = lazy(() => import("./pages/helper/HelperHome"));
const SubmitReport = lazy(() => import("./pages/helper/SubmitReport"));
const MyReports = lazy(() => import("./pages/helper/MyReports"));

// Admin portal
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Workers = lazy(() => import("./pages/admin/Workers"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));

// Worker portal
const WorkerLayout = lazy(() => import("./pages/worker/WorkerLayout"));
const WorkerDashboard = lazy(() => import("./pages/worker/WorkerDashboard"));
const WorkerMapView = lazy(() => import("./pages/worker/WorkerMapView"));
const WorkerProfile = lazy(() => import("./pages/worker/WorkerProfile"));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing — role selector */}
        <Route path="/" element={<Landing />} />

        {/* Role-specific auth pages */}
        <Route path="/login/helper" element={<AuthPage role="helper" />} />
        <Route path="/login/worker" element={<AuthPage role="worker" />} />
        <Route path="/login/admin" element={<AuthPage role="admin" />} />

        {/* SSO callback — handles Google/OAuth redirect */}
        <Route path="/sso-callback" element={<SSOCallback />} />

        {/* Legacy redirects */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/login/helper" replace />} />

        {/* Helper portal */}
        <Route
          path="/helper"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HELPER]}>
              <HelperLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<HelperHome />} />
          <Route path="submit" element={<SubmitReport />} />
          <Route path="my-reports" element={<MyReports />} />
        </Route>

        {/* Admin portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="workers" element={<Workers />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Worker portal */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute allowedRoles={[ROLES.WORKER]}>
              <WorkerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="map" element={<WorkerMapView />} />
          <Route path="profile" element={<WorkerProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
