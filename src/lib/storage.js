const LS_KEY = 'billboard-booker.v1';

const defaultData = () => ({
  users: [
    { id: 'u_owner', name: 'Olivia Owner', email: 'owner@example.com', password: 'owner', role: 'owner', createdAt: Date.now() },
    { id: 'u_cust', name: 'Carl Customer', email: 'customer@example.com', password: 'customer', role: 'customer', createdAt: Date.now() },
  ],
  billboards: [
    {
      id: 'bb_001', title: 'Times Square North', description: 'High-visibility board', ownerId: 'u_owner',
      lat: 40.7590, lng: -73.9845, price: 2500, size: '14x48 ft', address: '1560 Broadway', city: 'New York', status: 'available', bookings: [], createdAt: Date.now(),
    },
    {
      id: 'bb_002', title: 'Downtown Brooklyn', description: 'Commuter traffic', ownerId: 'u_owner',
      lat: 40.6928, lng: -73.9903, price: 1200, size: '10x30 ft', address: 'Flatbush Ave', city: 'New York', status: 'booked', bookings: [], createdAt: Date.now(),
    },
  ],
  bookings: [],
  session: null,
});

function read() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultData();
    return JSON.parse(raw);
  } catch {
    return defaultData();
  }
}

function write(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  listeners.forEach((fn) => fn(getSession()));
}

export function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

let listeners = new Set();

export function subscribeAuth(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export const authStore = {
  getSession() {
    const db = read();
    return db.session;
  },
  login(email, password) {
    const db = read();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    db.session = { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    write(db);
    return db.session;
  },
  register({ name, email, password, role }) {
    const db = read();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const user = { id: id('u'), name, email, password, role, createdAt: Date.now() };
    db.users.push(user);
    db.session = { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    write(db);
    return db.session;
  },
  logout() {
    const db = read();
    db.session = null;
    write(db);
  },
};

export const dataStore = {
  getUsers() {
    return read().users;
  },
  getBillboards() {
    return read().billboards;
  },
  getBookings() {
    return read().bookings;
  },
  addBillboard(bb) {
    const db = read();
    db.billboards.unshift(bb);
    write(db);
  },
  updateBillboard(bb) {
    const db = read();
    const idx = db.billboards.findIndex((x) => x.id === bb.id);
    if (idx !== -1) db.billboards[idx] = bb;
    write(db);
  },
  removeBillboard(id) {
    const db = read();
    db.billboards = db.billboards.filter((b) => b.id !== id);
    write(db);
  },
  addBooking(bk) {
    const db = read();
    db.bookings.unshift(bk);
    write(db);
  },
  cancelBooking(bookingId) {
    const db = read();
    const idx = db.bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) db.bookings[idx] = { ...db.bookings[idx], status: 'cancelled' };
    write(db);
  },
};

export function getSession() { return authStore.getSession(); }
