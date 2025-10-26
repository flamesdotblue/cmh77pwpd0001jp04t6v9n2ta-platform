import { LogOut, MapPin, Building2, User } from 'lucide-react';
import { authStore } from '../lib/storage.js';

export default function Header({ session }) {
  const user = session?.user;
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-900 text-white">
            <MapPin size={18} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">Billboard Booker</span>
            <span className="text-xs text-slate-500">Search • Book • Manage</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-2 text-sm text-slate-700">
                <User size={16} className="text-slate-500" />
                {user.name} • {user.role === 'owner' ? 'Owner' : 'Customer'}
              </span>
              <button
                onClick={() => authStore.logout()}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 active:scale-[.99]"
                title="Log out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 size={16} className="text-slate-500" /> Log in to manage or book billboards
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
