import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";

import { Account } from "@/pages/Account";
import { ProtectedRoute } from "@/router/protectedRoute";
import { Landing } from "@/pages/Landing";
import { Index } from "@/pages/Admin";
import { Logs } from "@/pages/Admin/components/logs";
import { Users } from "@/pages/Admin/components/users";
import { Dashboard as AdminDashboard } from "@/pages/Admin/components/dashboard";
import { Login } from "@/pages/Authentication/login";
import { Register } from "@/pages/Authentication/register";
import { Config } from "@/pages/Admin/components/config";
import { RegisterGoogleForm } from "@/pages/Authentication/registerGoogleForm";
import { StravaCallback } from "@/pages/Authentication/stravaCallback";
import { AuthCallback } from "@/pages/Authentication/authCallback";
import Dashboard from "@/pages/Dashboard";
import YearInSport from "@/pages/YearInSport";
import GearPage from "@/pages/Gear/GearPage";
import AnalyticsPage from "@/pages/Analytics/AnalyticsPage";

export const Router = () => {
  return (
    <Routes>
      {/* Public routes without layout */}
      <Route element={<LayoutWrapper withLayout={false} />}>
        {/* Landing page - public, for unauthenticated users */}
        <Route
          path="/"
          element={
            <ProtectedRoute authRequired={false} redirectTo="/dashboard">
              <Landing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            <ProtectedRoute authRequired={false} redirectTo="/dashboard">
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute authRequired={false} redirectTo="/dashboard">
              <Register />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register/google"
          element={
            <ProtectedRoute authRequired={false} redirectTo="/dashboard">
              <RegisterGoogleForm />
            </ProtectedRoute>
          }
        />

        {/* OAuth Callbacks - no auth required, they handle auth internally */}
        <Route path="/auth/strava/callback" element={<StravaCallback />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute authRequired={true} role="admin">
              <Index />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Config />} />
        </Route>
      </Route>

      {/* Protected routes with layout (for account settings etc) */}
      <Route element={<LayoutWrapper />}>
        <Route
          path="/account"
          element={
            <ProtectedRoute authRequired={true}>
              <Account />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Full-screen protected routes without navbar/footer */}
      <Route element={<LayoutWrapper withLayout={false} />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute authRequired={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/year-in-sport"
          element={
            <ProtectedRoute authRequired={true}>
              <YearInSport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gear"
          element={
            <ProtectedRoute authRequired={true}>
              <GearPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute authRequired={true}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
