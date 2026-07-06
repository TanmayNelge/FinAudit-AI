import React, { useState } from 'react';
import { AuthPage } from '@/components/AuthPage.jsx';
import { Sidebar } from '@/components/dashboard/sidebar.jsx';
import { Topbar } from '@/components/dashboard/topbar.jsx';
import { StatCards } from '@/components/dashboard/stat-cards.jsx';
import { UploadZone } from '@/components/dashboard/upload-zone.jsx';
import { DocumentsTable } from '@/components/dashboard/documents-table.jsx';

export default function App() {
  // Global auth state
  const [user, setUser] = useState(null);

  // If there is no user, ONLY render the login page
  if (!user) {
    return <AuthPage onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // If user exists, render the main application
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Pass user to Topbar if you want to display their name */}
        <Topbar user={user} onLogout={() => setUser(null)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <StatCards />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
              <div className="xl:col-span-2">
                <UploadZone />
              </div>
              <div className="xl:col-span-3">
                <DocumentsTable />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}