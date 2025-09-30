import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../features/layout/AuthLayout.tsx';
import { MainLayout } from '../features/layout/MainLayout.tsx';
import { LoginPage } from '../pages/LoginPage.tsx';
import { SignupPage } from '../pages/SignupPage.tsx';
import { DashboardPage } from '../pages/DashboardPage.tsx';
import { GamePage } from '../pages/GamePage.tsx';
import { RequireAuth } from '../features/auth/RequireAuth.tsx';
import { LandingPage } from '../pages/LandingPage.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/game"
          element={
            <RequireAuth>
              <GamePage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
