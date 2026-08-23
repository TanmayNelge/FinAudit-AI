import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { AuthPage } from '@/components/AuthPage.jsx';
import { Sidebar } from '@/components/dashboard/sidebar.jsx';
import { Topbar } from '@/components/dashboard/topbar.jsx';
import { StatCards } from '@/components/dashboard/stat-cards.jsx';
import { UploadZone } from '@/components/dashboard/upload-zone.jsx';
import { DocumentsTable } from '@/components/dashboard/documents-table.jsx';
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

  // If there is no user, ONLY render the login page
  if (!user) {
    return <AuthPage onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // If user exists, render the main application
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          onLogout={handleLogout}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <StatCards />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
              <div className="xl:col-span-2">
                <UploadZone onUploadComplete={() => setRefreshSignal((n) => n + 1)} />
              </div>
              <div className="xl:col-span-3">
                <DocumentsTable searchTerm={searchTerm} refreshSignal={refreshSignal} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}