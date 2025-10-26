import { useMemo, useState } from 'react';
import MapView from './MapView.jsx';
import { dataStore, authStore, id } from '../lib/storage.js';
import { Search, Calendar, Check } from 'lucide-react';

export default function DashboardCustomer() {
  const session = authStore.getSession();
  const me = session.user;
  const [query, setQuery] = useState('');
  const [dates, setDates] = useState({ start: '', end: '' });
  const allBillboards = dataStore.getBillboards();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBillboards.filter((b) => {
      if (!q) return b.status === 'available';
      const text = `${b.title} ${b.city} ${b.address}`.toLowerCase();
      return text.includes(q) && b.status === 'available';
    });
  }, [allBillboards, query]);

  const myBookings = useMemo(() => dataStore.getBookings().filter((bk) => bk.userId === me.id), [me.id, allBillboards]);

  const book = (b) => {
    if (!dates.start || !dates.end) return alert('Select start and end dates first.');
    const booking = {
      id: id('bk'),
      billboardId: b.id,
      userId: me.id,
      startDate: dates.start,
      endDate: dates.end,
      status: 'active',
      createdAt: Date.now(),
    };
    dataStore.addBooking(booking);
    const next = { ...b, status: 'booked' };
    dataStore.updateBillboard(next);
  };

  const cancel = (bk) => {
    dataStore.cancelBooking(bk.id);
    const b = dataStore.getBillboards().find((x) => x.id === bk.billboardId);
    if (b) {
      const stillActive = dataStore.getBookings().some((x) => x.billboardId === b.id && x.status === 'active');
      if (!stillActive) dataStore.updateBillboard({ ...b, status: 'available' });
    }
  };

  return (
    <div className="pt-6 space-y-6">
      <div className="rounded-xl border bg-white p-4">
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Search city, address, or title</label>
            <div className="flex items-center gap-2 rounded-md border px-3 py-2">
              <Search size={16} className="text-slate-500" />
              <input className="w-full outline-none" placeholder="e.g., New York, Times" value={query} onChange={(e)=>setQuery(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Start date</label>
            <input type="date" className="w-full rounded-md border px-3 py-2" value={dates.start} onChange={(e)=>setDates({...dates,start:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm mb-1">End date</label>
            <input type="date" className="w-full rounded-md border px-3 py-2" value={dates.end} onChange={(e)=>setDates({...dates,end:e.target.value})} />
          </div>
        </div>
      </div>

      <MapView
        billboards={filtered}
        center={filtered[0] ? [filtered[0].lat, filtered[0].lng] : [40.7128, -74.006]}
        onMarkerClick={(b) => {
          const el = document.getElementById(`bb-${b.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((b) => (
          <div id={`bb-${b.id}`} key={b.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{b.title}</h3>
                <div className="text-sm text-slate-600">{b.city} • {b.address}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">available</span>
            </div>
            <div className="mt-2 text-sm flex flex-wrap gap-3 text-slate-700">
              <span>${b.price}</span>
              {b.size && <span>{b.size}</span>}
              <span>Lat {b.lat.toFixed(4)}, Lng {b.lng.toFixed(4)}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => book(b)} className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-slate-800">
                <Check size={16} /> Book billboard
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-slate-600 text-sm">No available billboards match your search.</div>
        )}
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="font-semibold mb-3">My bookings</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {myBookings.length === 0 && (
            <div className="text-sm text-slate-600">No bookings yet.</div>
          )}
          {myBookings.map((bk) => {
            const b = allBillboards.find((x) => x.id === bk.billboardId);
            if (!b) return null;
            return (
              <div key={bk.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.title}</div>
                    <div className="text-sm text-slate-600">{b.city} • {b.address}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${bk.status==='active'?'bg-blue-100 text-blue-700':'bg-slate-100 text-slate-700'}`}>{bk.status}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <Calendar size={16} /> {bk.startDate} → {bk.endDate}
                </div>
                {bk.status === 'active' && (
                  <div className="mt-2">
                    <button onClick={() => cancel(bk)} className="text-sm underline">Cancel booking</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
