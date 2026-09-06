import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { AuthPage } from '@/components/AuthPage.jsx';
import { DashboardLayout } from '@/components/layout/DashboardLayout.jsx';
import { DashboardPage } from '@/pages/DashboardPage.jsx';
import { DocumentsPage } from '@/pages/DocumentsPage.jsx';
import { DocumentDetailsPage } from '@/pages/DocumentDetailsPage.jsx';
import { UploadPage } from '@/pages/UploadPage.jsx';
import { FlaggedItemsPage } from '@/pages/FlaggedItemsPage.jsx';
import { AuditHistoryPage } from '@/pages/AuditHistoryPage.jsx';
import { TeamPage } from '@/pages/TeamPage.jsx';
import { SettingsPage } from '@/pages/SettingsPage.jsx';
import { ProfilePage } from '@/pages/ProfilePage.jsx';
import { SupportPage } from '@/pages/SupportPage.jsx';
import { NotFoundPage } from '@/pages/NotFoundPage.jsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Global auth state
  const [user, setUser] = useState(null);
  // Whether we're still checking for an existing session on first load
  const [checkingSession, setCheckingSession] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Bumped whenever an upload finishes, to trigger an immediate table refresh
  const [refreshSignal, setRefreshSignal] = useState(0);

  // On first load, check whether the auth cookie from a previous session
  // is still valid, so a page refresh doesn't force a re-login.
  useEffect(() => {
    let cancelled = false;
    api.get('/api/auth/me')
      .then((response) => {
        if (!cancelled) setUser(response.data.user);
      })
      .catch(() => {
        // No valid session — stay on the login page.
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setUser(null);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage onLoginSuccess={(userData) => setUser(userData)} />
            )
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          element={
            user ? (
              <DashboardLayout
                user={user}
                onLogout={handleLogout}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                searchTerm={searchTerm}
                refreshSignal={refreshSignal}
                onRefresh={() => setRefreshSignal((n) => n + 1)}
              />
            }
          />
          <Route
            path="/documents"
            element={<DocumentsPage refreshSignal={refreshSignal} />}
          />
          <Route path="/documents/:id" element={<DocumentDetailsPage />} />
          <Route
            path="/upload"
            element={<UploadPage onRefresh={() => setRefreshSignal((n) => n + 1)} />}
          />
          <Route path="/flagged-items" element={<FlaggedItemsPage />} />
          <Route path="/audit-history" element={<AuditHistoryPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}