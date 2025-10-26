import { useState } from 'react';
import { authStore } from '../lib/storage.js';
import { User, Building2 } from 'lucide-react';

export default function AuthGate() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        authStore.login(form.email.trim(), form.password);
      } else {
        authStore.register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role,
        });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'login' ? 'Login' : 'Create account'}
          </h2>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
            <button
              onClick={() => setMode('login')}
              className={`px-3 py-1 rounded-md ${mode === 'login' ? 'bg-white shadow border' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-3 py-1 rounded-md ${mode === 'register' ? 'bg-white shadow border' : ''}`}
            >
              Register
            </button>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border px-3 py-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md border px-3 py-2"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={4}
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-sm mb-1">Account type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 ${role==='customer'?'ring-2 ring-slate-900':''}`}
                >
                  <User size={16} /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 ${role==='owner'?'ring-2 ring-slate-900':''}`}
                >
                  <Building2 size={16} /> Owner
                </button>
              </div>
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800"
          >
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">How it works</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
          <li>Owners register to list available billboards and manage bookings.</li>
          <li>Customers search on the map, view details, and request bookings.</li>
          <li>All data is stored locally in your browser for this demo.</li>
          <li>Switch account types by logging out and creating another account.</li>
        </ul>
      </div>
    </div>
  );
}
