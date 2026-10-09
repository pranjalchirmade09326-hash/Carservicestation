import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

// compute backend base url from environment variable or fallback to localhost
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL
});

// attach jwt token to request headers if logged in
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// main application component
function App() {
  // get user from localStorage on initial load
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="container main-content">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/vehicles" element={<Vehicles user={user} />} />
          <Route path="/bookings" element={<Bookings user={user} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// navigation bar
function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          🚗 CarCare
        </Link>

        {/* mobile menu toggle button */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        {/* nav links */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Services
          </Link>

          {user && user.role === 'user' && (
            <>
              <Link to="/vehicles" className="nav-link" onClick={() => setMenuOpen(false)}>
                My Cars
              </Link>
              <Link to="/bookings" className="nav-link" onClick={() => setMenuOpen(false)}>
                My Bookings
              </Link>
            </>
          )}

          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
              Admin Dashboard
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="user-info">
                <span>{user.name}</span>
                <span className={`user-role-badge ${user.role}`}>
                  {user.role}
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// 10 mock dummy services for comprehensive car care station
export const MOCK_SERVICES = [
  {
    id: 1,
    name: 'Periodic Maintenance Service (Basic)',
    description: 'Comprehensive 40-point vehicle inspection, fluid top-up, wiper check, and spark plug cleaning.',
    price: 1999,
    durationMinutes: 90,
    isActive: 1
  },
  {
    id: 2,
    name: 'Standard Service & Oil Flush',
    description: 'Engine oil change, oil filter replacement, air filter cleaning, and brake inspection.',
    price: 2999,
    durationMinutes: 120,
    isActive: 1
  },
  {
    id: 3,
    name: 'Comprehensive Major Service',
    description: 'Full synthetic oil replacement, oil filter, air filter, fuel filter, spark plugs, coolant flush, and wheel inspection.',
    price: 4999,
    durationMinutes: 180,
    isActive: 1
  },
  {
    id: 4,
    name: 'Complete AC Deep Clean & Gas Refill',
    description: 'AC cabin filter replacement, evaporator coil antibacterial spray, condenser wash, and R134a refrigerant gas top-up.',
    price: 1899,
    durationMinutes: 75,
    isActive: 1
  },
  {
    id: 5,
    name: 'Computerized 3D Wheel Alignment & Balancing',
    description: 'High-precision laser alignment for all 4 wheels, automated dynamic wheel balancing, and tyre rotation.',
    price: 899,
    durationMinutes: 45,
    isActive: 1
  },
  {
    id: 6,
    name: 'Brake Overhaul & Pad Replacement',
    description: 'Front & rear brake pad wear inspection, disc rotor skimming/polishing, brake fluid bleeding, and caliper greasing.',
    price: 1499,
    durationMinutes: 60,
    isActive: 1
  },
  {
    id: 7,
    name: 'Premium Foam Wash & Interior Detailing',
    description: 'pH-neutral high-pressure snow foam wash, interior vacuuming, dashboard UV dressing, and upholstery steam sanitation.',
    price: 2199,
    durationMinutes: 120,
    isActive: 1
  },
  {
    id: 8,
    name: 'Battery Health Diagnostics & Terminals Service',
    description: 'Digital CCA battery load testing, alternator charging rate verification, and anti-corrosion terminal treatment.',
    price: 499,
    durationMinutes: 30,
    isActive: 1
  },
  {
    id: 9,
    name: 'Suspension & Steering Overhaul',
    description: 'Front & rear shock absorbers check, tie-rod end and ball joint inspection, bushing lubrication, and road test.',
    price: 2599,
    durationMinutes: 110,
    isActive: 1
  },
  {
    id: 10,
    name: 'Ceramic Paint Protection & Glass Coating',
    description: '3-step paint correction rubbing & polishing followed by 9H nano ceramic protective hydrophobic coat.',
    price: 5999,
    durationMinutes: 240,
    isActive: 1
  }
];

// home page showing service packages
function Home({ user }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // load services from backend with mock fallback
  useEffect(() => {
    api.get('/services')
      .then(res => {
        const loaded = res.data.services || [];
        setServices(loaded.length > 0 ? loaded : MOCK_SERVICES);
      })
      .catch(err => {
        console.warn('Backend services request failed, fallback to 10 mock services:', err);
        setServices(MOCK_SERVICES);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // filter services by name or description
  const filteredServices = services.filter(service => {
    const text = `${service.name} ${service.description}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  // handle click on book service
  const handleBookClick = serviceId => {
    if (!user) {
      alert('Please login to book a service');
      navigate('/login');
      return;
    }
    navigate(`/bookings?serviceId=${serviceId}`);
  };

  return (
    <>
      {/* hero banner */}
      <section className="hero">
        <h1>Online Car Service & Maintenance</h1>
        <p>
          Book reliable car repair, regular servicing, and cleaning packages online.
          Manage your vehicles and track repair status from one dashboard.
        </p>
        <div className="hero-buttons">
          <Link to="/bookings" className="btn btn-primary">
            Book a Service
          </Link>
          <a href="#services-list" className="btn btn-secondary">
            View All Services
          </a>
        </div>
      </section>

      {/* services section */}
      <div id="services-list">
        <div className="section-header">
          <div>
            <h2>Available Service Packages</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Choose a package suited for your vehicle
            </p>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search service name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-box">Loading services...</div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-box">No services found matching "{searchTerm}"</div>
        ) : (
          <div className="cards-grid">
            {filteredServices.map(service => (
              <div className="card service-card" key={service.id}>
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
                <div>
                  <div className="service-meta">
                    <span className="service-price">₹{service.price}</span>
                    <span className="service-duration">⏱ {service.durationMinutes} mins</span>
                  </div>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleBookClick(service.id)}
                  >
                    Book This Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// login component
function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('customer@gmail.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // handle login form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);

      // redirect based on user role
      if (res.data.user.role === 'user') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.message === 'Network Error' ? 'Server connection failed (CORS or server offline).' : err.message) ||
        'Login failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // helper to quickly test accounts
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-box">
      <h2>User Login</h2>
      <p>Sign in with your email and password.</p>

      {/* demo account quick-fill box */}
      <div className="demo-box">
        <strong>Demo Accounts for Testing:</strong>
        <div className="demo-buttons">
          <button
            type="button"
            className="demo-btn"
            onClick={() => handleQuickFill('customer@gmail.com', 'Password@123')}
          >
            Customer
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => handleQuickFill('admin@carcare.com', 'Password@123')}
          >
            Admin
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => handleQuickFill('superadmin@carcare.com', 'Password@123')}
          >
            Super Admin
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: '13px', textAlign: 'center' }}>
        New user? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Create an account</Link>
      </p>
    </div>
  );
}

// register component
function Register({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // handle registration form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'admin' || res.data.user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.message === 'Network Error' ? 'Server connection failed (CORS or server offline).' : err.message) ||
        'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2>Register Account</h2>
      <p>Create a new customer account to manage your car bookings.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Full Name</label>
          <input
            type="text"
            className="form-control"
            required
            placeholder="Rahul Sharma"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            required
            placeholder="rahul@gmail.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Password (min 8 characters)</label>
          <input
            type="password"
            className="form-control"
            required
            minLength="8"
            placeholder="Password@123"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Phone Number</label>
          <input
            type="tel"
            className="form-control"
            placeholder="9876500000"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label>Account Type / Role</label>
          <select
            className="form-control"
            value={formData.role || 'user'}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">Customer (Standard User)</option>
            <option value="admin">Service Center Admin (Admin Role)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: '13px', textAlign: 'center' }}>
        Already registered? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Login here</Link>
      </p>
    </div>
  );
}

// vehicles management page
function Vehicles({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    registrationNo: '',
    make: '',
    model: '',
    year: '2023',
    fuelType: 'Petrol',
    color: 'White'
  });

  // load user's registered vehicles
  const loadVehicles = () => {
    api.get('/vehicles')
      .then(res => setVehicles(res.data || []))
      .catch(err => setError('Failed to load vehicles'));
  };

  useEffect(() => {
    if (user && user.role === 'user') {
      loadVehicles();
    }
  }, [user]);

  if (!user || user.role !== 'user') {
    return <div className="alert alert-error">Please login as customer to view your vehicles.</div>;
  }

  // handle add vehicle form submission
  const handleAddVehicle = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post('/vehicles', form);
      setMessage('Vehicle added successfully!');
      setForm({
        registrationNo: '',
        make: '',
        model: '',
        year: '2023',
        fuelType: 'Petrol',
        color: 'White'
      });
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add vehicle');
    }
  };

  // handle delete vehicle
  const handleDeleteVehicle = async id => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        setMessage('Vehicle deleted successfully');
        loadVehicles();
      } catch (err) {
        setError(err.response?.data?.message || 'Could not delete vehicle');
      }
    }
  };

  return (
    <>
      <div className="section-header">
        <h2>My Garage & Vehicles</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* add vehicle form */}
      <div className="form-card">
        <h3 style={{ marginBottom: 16 }}>Add New Vehicle</h3>
        <form onSubmit={handleAddVehicle}>
          <div className="form-grid">
            <div className="form-group">
              <label>Registration Number (License Plate)</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. MH 12 AB 1234"
                value={form.registrationNo}
                onChange={e => setForm({ ...form, registrationNo: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group">
              <label>Make (Brand)</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Honda, Hyundai, Tata"
                value={form.make}
                onChange={e => setForm({ ...form, make: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. City, Creta, Nexon"
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                className="form-control"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Fuel Type</label>
              <select
                className="form-control"
                value={form.fuelType}
                onChange={e => setForm({ ...form, fuelType: e.target.value })}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. White, Silver, Black"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
              />
            </div>

            <div className="form-group full">
              <button type="submit" className="btn btn-primary">
                Add Vehicle
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* vehicles list */}
      <h3 style={{ marginBottom: 16 }}>Registered Cars ({vehicles.length})</h3>
      {vehicles.length === 0 ? (
        <div className="empty-box">No cars registered yet. Add your first vehicle above.</div>
      ) : (
        <div className="cards-grid">
          {vehicles.map(v => (
            <div className="card" key={v.id}>
              <div className="plate-box">{v.registrationNo}</div>
              <h3 style={{ fontSize: '18px', marginBottom: 6 }}>
                {v.make} {v.model}
              </h3>
              <div className="car-details">
                <span>{v.year}</span>
                <span>{v.fuelType}</span>
                <span>{v.color || 'Standard'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <Link to={`/bookings?vehicleId=${v.id}`} className="btn btn-secondary btn-sm">
                  Book Service
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteVehicle(v.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// service bookings page
function Bookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // booking form state
  const [form, setForm] = useState({
    vehicleId: '',
    serviceId: '',
    bookingDate: '',
    notes: ''
  });

  // load user's bookings, active services, and cars
  const loadData = () => {
    Promise.all([
      api.get('/bookings/my'),
      api.get('/services'),
      api.get('/vehicles')
    ])
      .then(([bookingsRes, servicesRes, vehiclesRes]) => {
        setBookings(bookingsRes.data || []);
        const activeServices = (servicesRes.data?.services || []).filter(s => s.isActive);
        const resolvedServices = activeServices.length > 0 ? activeServices : MOCK_SERVICES;
        setServices(resolvedServices);
        const myCars = vehiclesRes.data || [];
        setVehicles(myCars);

        // preselect first vehicle and service if available
        setForm(prev => ({
          ...prev,
          vehicleId: prev.vehicleId || (myCars[0]?.id ? String(myCars[0].id) : ''),
          serviceId: prev.serviceId || (resolvedServices[0]?.id ? String(resolvedServices[0].id) : '')
        }));
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (user && user.role === 'user') {
      loadData();
    }
  }, [user]);

  if (!user || user.role !== 'user') {
    return <div className="alert alert-error">Please login as customer to view bookings.</div>;
  }

  // create a new booking
  const handleCreateBooking = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.vehicleId) {
      setError('Please select a car from your garage.');
      return;
    }
    if (!form.serviceId) {
      setError('Please select a service package.');
      return;
    }

    try {
      await api.post('/bookings', form);
      setMessage('Service booking created successfully!');
      setForm(prev => ({ ...prev, bookingDate: '', notes: '' }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  // cancel a booking
  const handleCancelBooking = async id => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        setMessage('Booking cancelled successfully');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Could not cancel booking');
      }
    }
  };

  // filter bookings by status tab
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <>
      <div className="section-header">
        <h2>Service Appointments & History</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* booking form */}
      <div className="form-card">
        <h3 style={{ marginBottom: 16 }}>Book a New Service Appointment</h3>
        {vehicles.length === 0 ? (
          <p style={{ color: '#d97706' }}>
            You have not registered any vehicles yet. Please <Link to="/vehicles" style={{ textDecoration: 'underline' }}>add a car</Link> first to schedule service.
          </p>
        ) : (
          <form onSubmit={handleCreateBooking}>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Your Car</label>
                <select
                  className="form-control"
                  required
                  value={form.vehicleId}
                  onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNo} - {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Service Package</label>
                <select
                  className="form-control"
                  required
                  value={form.serviceId}
                  onChange={e => setForm({ ...form, serviceId: e.target.value })}
                >
                  <option value="">-- Select Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - ₹{s.price} ({s.durationMinutes} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Booking Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  required
                  value={form.bookingDate}
                  onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes / Issue Description (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Engine noise, AC not cooling properly..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <button type="submit" className="btn btn-primary">
                  Confirm Booking
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* booking history with filter tabs */}
      <h3 style={{ marginBottom: 12 }}>My Service Bookings</h3>

      <div className="tabs">
        {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace('_', ' ').toUpperCase()} ({bookings.filter(b => tab === 'all' || b.status === tab).length})
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-box">No bookings found under "{activeTab}" status.</div>
      ) : (
        <div className="cards-grid">
          {filteredBookings.map(b => (
            <div className="card" key={b.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className={`status-badge ${b.status}`}>{b.status.replace('_', ' ')}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>#{b.id}</span>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 4 }}>
                {b.service?.name}
              </h4>
              <p style={{ color: '#475569', fontSize: '13px', marginBottom: 4 }}>
                Vehicle: <strong>{b.vehicle?.make} {b.vehicle?.model}</strong> ({b.vehicle?.registrationNo})
              </p>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: 4 }}>
                Date: {new Date(b.bookingDate).toLocaleString()}
              </p>
              {b.notes && (
                <p style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic', marginBottom: 10 }}>
                  "{b.notes}"
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <strong style={{ color: '#2563eb', fontSize: '16px' }}>₹{b.totalAmount}</strong>
                {!['completed', 'cancelled'].includes(b.status) && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelBooking(b.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// admin dashboard component
function AdminDashboard({ user }) {
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // fetch admin data
  const loadAdminData = async () => {
    try {
      const [statsRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/bookings'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data || {});
      setBookings(bookingsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      loadAdminData();
    }
  }, [user]);

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="alert alert-error">Access Denied. Admin account required.</div>;
  }

  // update booking status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      setMessage(`Booking #${bookingId} status updated to ${newStatus}`);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // delete user (super admin only)
  const handleDeleteUser = async userId => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/super-admin/users/${userId}`);
        setMessage('User deleted successfully');
        loadAdminData();
      } catch (err) {
        setError(err.response?.data?.message || 'Could not delete user');
      }
    }
  };

  return (
    <>
      <div className="section-header">
        <h2>{user.role === 'super_admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* statistics summary boxes */}
      <div className="stats-row">
        <div className="stat-box">
          <span>TOTAL USERS</span>
          <strong>{stats.users || 0}</strong>
        </div>
        <div className="stat-box">
          <span>VEHICLES</span>
          <strong>{stats.vehicles || 0}</strong>
        </div>
        <div className="stat-box">
          <span>SERVICES</span>
          <strong>{stats.services || 0}</strong>
        </div>
        <div className="stat-box">
          <span>TOTAL BOOKINGS</span>
          <strong>{stats.bookings || 0}</strong>
        </div>
        <div className="stat-box">
          <span>PENDING</span>
          <strong style={{ color: '#d97706' }}>{stats.pending || 0}</strong>
        </div>
        <div className="stat-box">
          <span>COMPLETED</span>
          <strong style={{ color: '#16a34a' }}>{stats.completed || 0}</strong>
        </div>
      </div>

      {/* bookings management */}
      <div className="table-card">
        <h3 style={{ marginBottom: 16 }}>Manage Service Bookings ({bookings.length})</h3>

        {bookings.length === 0 ? (
          <p style={{ color: '#64748b' }}>No bookings received yet.</p>
        ) : (
          <div>
            {bookings.map(b => (
              <div className="list-item" key={b.id}>
                <div className="list-info">
                  <h4>
                    {b.service?.name} — ₹{b.totalAmount}
                  </h4>
                  <p>
                    Customer: <strong>{b.user?.name}</strong> ({b.user?.phone || b.user?.email})
                  </p>
                  <p>
                    Vehicle: {b.vehicle?.make} {b.vehicle?.model} ({b.vehicle?.registrationNo})
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Scheduled: {new Date(b.bookingDate).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '13px', color: '#475569' }}>Status:</span>
                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
                    value={b.status}
                    onChange={e => handleStatusChange(b.id, e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="in_progress">in_progress</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* super admin user management */}
      {user.role === 'super_admin' && (
        <div className="table-card">
          <h3 style={{ marginBottom: 16 }}>User Management ({users.length} Users)</h3>
          <div>
            {users.map(u => (
              <div className="list-item" key={u.id}>
                <div className="list-info">
                  <h4>{u.name}</h4>
                  <p>{u.email} · Role: <strong>{u.role}</strong> · Phone: {u.phone || 'N/A'}</p>
                </div>
                <div>
                  {u.id !== user.id && u.role !== 'super_admin' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// render root react application
createRoot(document.getElementById('root')).render(<App />);
