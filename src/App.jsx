import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import AuthGate from './components/AuthGate.jsx';
import DashboardOwner from './components/DashboardOwner.jsx';
import DashboardCustomer from './components/DashboardCustomer.jsx';
import { authStore, subscribeAuth } from './lib/storage.js';

export default function App() {
  const [session, setSession] = useState(authStore.getSession());

  useEffect(() => {
    const unsub = subscribeAuth(setSession);
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header session={session} />
      <main className="mx-auto max-w-7xl px-4 pb-12">
        {!session?.user ? (
          <div className="pt-8">
            <AuthGate />
          </div>
        ) : session.user.role === 'owner' ? (
          <DashboardOwner />
        ) : (
          <DashboardCustomer />
        )}
      </main>
      <footer className="border-t mt-8 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Billboard Booker. All rights reserved.
      </footer>
    </div>
  );
}
