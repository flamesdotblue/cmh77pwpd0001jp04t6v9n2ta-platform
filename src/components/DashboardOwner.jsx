import { useMemo, useState } from 'react';
import MapView from './MapView.jsx';
import { dataStore, authStore, id } from '../lib/storage.js';
import { Plus, Check, X, Calendar } from 'lucide-react';

export default function DashboardOwner() {
  const session = authStore.getSession();
  const me = session.user;
  const [form, setForm] = useState({
    title: '',
    price: '',
    size: '',
    address: '',
    city: '',
    lat: '',
    lng: '',
  });
  const [selected, setSelected] = useState(null);
  const allBillboards = dataStore.getBillboards();
  const myBillboards = useMemo(() => allBillboards.filter(b => b.ownerId === me.id), [allBillboards, me.id]);

  const onMapClick = (latlng) => {
    setForm((f) => ({ ...f, lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) }));
  };

  const addBillboard = (e) => {
    e.preventDefault();
    const payload = {
      id: id('bb'),
      title: form.title || 'Untitled Billboard',
      description: '',
      ownerId: me.id,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      price: parseFloat(form.price || '0'),
      size: form.size,
      address: form.address,
      city: form.city,
      status: 'available',
      bookings: [],
      createdAt: Date.now(),
    };
    if (Number.isNaN(payload.lat) || Number.isNaN(payload.lng)) return;
    dataStore.addBillboard(payload);
    setForm({ title: '', price: '', size: '', address: '', city: '', lat: '', lng: '' });
  };

  const toggleAvailability = (b) => {
    const next = { ...b, status: b.status === 'available' ? 'booked' : 'available' };
    dataStore.updateBillboard(next);
    setSelected(next);
  };

  const cancelBooking = (b) => {
    const bookings = dataStore.getBookings().filter((bk) => bk.billboardId === b.id && bk.status === 'active');
    bookings.forEach((bk) => dataStore.cancelBooking(bk.id));
    const next = { ...b, status: 'available' };
    dataStore.updateBillboard(next);
    setSelected(next);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 pt-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your billboards</h2>
          <span className="text-sm text-slate-600">{myBillboards.length} total</span>
        </div>
        <MapView
          billboards={myBillboards}
          center={myBillboards[0] ? [myBillboards[0].lat, myBillboards[0].lng] : [40.7128, -74.006]}
          onMapClick={onMapClick}
          onMarkerClick={(b) => setSelected(b)}
        />
        <div className="grid md:grid-cols-2 gap-4">
          {myBillboards.map((b) => (
            <div key={b.id} className={`rounded-xl border p-4 bg-white ${selected?.id===b.id?'ring-2 ring-slate-900':''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <div className="text-sm text-slate-600">{b.city} • {b.address}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${b.status==='available'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                  {b.status}
                </span>
              </div>
              <div className="mt-2 text-sm flex flex-wrap gap-3 text-slate-700">
                <span>${b.price}</span>
                {b.size && <span>{b.size}</span>}
                <span>Lat {b.lat.toFixed(4)}, Lng {b.lng.toFixed(4)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleAvailability(b)} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
                  <Check size={16} /> Toggle availability
                </button>
                <button onClick={() => cancelBooking(b)} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
                  <X size={16} /> Cancel bookings
                </button>
              </div>
              <div className="mt-3 text-sm text-slate-600 flex items-center gap-2">
                <Calendar size={16} /> Active bookings: {dataStore.getBookings().filter((bk)=>bk.billboardId===b.id && bk.status==='active').length}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold mb-3">Add new billboard</h3>
          <form onSubmit={addBillboard} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input className="w-full rounded-md border px-3 py-2" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Times Sq. North" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Price (USD)</label>
                <input type="number" step="0.01" className="w-full rounded-md border px-3 py-2" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} placeholder="1500" />
              </div>
              <div>
                <label className="block text-sm mb-1">Size</label>
                <input className="w-full rounded-md border px-3 py-2" value={form.size} onChange={(e)=>setForm({...form,size:e.target.value})} placeholder="14x48 ft" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">City</label>
                <input className="w-full rounded-md border px-3 py-2" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm mb-1">Address</label>
                <input className="w-full rounded-md border px-3 py-2" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} placeholder="123 Main St" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Latitude</label>
                <input className="w-full rounded-md border px-3 py-2" value={form.lat} onChange={(e)=>setForm({...form,lat:e.target.value})} placeholder="40.7128" />
              </div>
              <div>
                <label className="block text-sm mb-1">Longitude</label>
                <input className="w-full rounded-md border px-3 py-2" value={form.lng} onChange={(e)=>setForm({...form,lng:e.target.value})} placeholder="-74.0060" />
              </div>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800">
              <Plus size={16} /> Add billboard
            </button>
            <p className="text-xs text-slate-500">Tip: Click on the map to auto-fill coordinates.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
