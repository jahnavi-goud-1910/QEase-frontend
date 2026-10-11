import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  Plus, 
  RefreshCw, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  ShieldAlert,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, services, counters, staff, students, queues

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Forms
  const [serviceForm, setServiceForm] = useState({ name: '', code: '', description: '', estimatedTimeMinutes: 10 });
  const [counterForm, setCounterForm] = useState({ counterNumber: '', name: '', serviceId: '', staffId: '' });
  const [staffForm, setStaffForm] = useState({ fullName: '', email: '', password: '', phone: '' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [sumRes, anaRes, srvRes, cntRes, stfRes, usrRes, queRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics'),
        api.get('/admin/services'),
        api.get('/admin/counters'),
        api.get('/admin/staff'),
        api.get('/admin/users'),
        api.get('/admin/queues')
      ]);

      setSummary(sumRes.data);
      setAnalytics(anaRes.data);
      setServices(srvRes.data);
      setCounters(cntRes.data);
      setStaffList(stfRes.data);
      setUsersList(usrRes.data);
      setAllQueues(queRes.data);
    } catch (err) {
      console.error("Admin data load error:", err);
      setError('Failed to load administrative records.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Services ---
  const handleCreateService = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/services', serviceForm);
      setSuccess('Service created successfully!');
      setShowServiceModal(false);
      setServiceForm({ name: '', code: '', description: '', estimatedTimeMinutes: 10 });
      await loadAllAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service.');
    }
  };

  const handleToggleService = async (id) => {
    try {
      await api.patch(`/admin/services/${id}/status`);
      await loadAllAdminData();
    } catch (err) {
      setError('Failed to update service status.');
    }
  };

  // --- Handlers: Counters ---
  const handleCreateCounter = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/counters', {
        ...counterForm,
        serviceId: counterForm.serviceId ? Number(counterForm.serviceId) : null,
        staffId: counterForm.staffId ? Number(counterForm.staffId) : null,
      });
      setSuccess('Counter created successfully!');
      setShowCounterModal(false);
      setCounterForm({ counterNumber: '', name: '', serviceId: '', staffId: '' });
      await loadAllAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create counter.');
    }
  };

  const handleToggleCounter = async (id) => {
    try {
      await api.patch(`/admin/counters/${id}/status`);
      await loadAllAdminData();
    } catch (err) {
      setError('Failed to update counter status.');
    }
  };

  // --- Handlers: Staff ---
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/staff', { ...staffForm, role: 'STAFF' });
      setSuccess('Staff member added successfully!');
      setShowStaffModal(false);
      setStaffForm({ fullName: '', email: '', password: '', phone: '' });
      await loadAllAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff member.');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/status`);
      await loadAllAdminData();
    } catch (err) {
      setError('Failed to update user status.');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>Campus Admin Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live queue monitoring, counter assignments, and analytics
          </p>
        </div>

        <button onClick={loadAllAdminData} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
          <RefreshCw size={16} /> Sync Live Data
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 18px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '12px 18px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '32px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Analytics & Overview', icon: BarChart3 },
          { id: 'services', label: `Services (${services.length})`, icon: Layers },
          { id: 'counters', label: `Counters (${counters.length})`, icon: MapPin },
          { id: 'staff', label: `Staff (${staffList.length})`, icon: UserCheck },
          { id: 'students', label: `Students (${usersList.filter(u => u.role === 'STUDENT').length})`, icon: Users },
          { id: 'queues', label: `Campus Queues (${allQueues.length})`, icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} color={isActive ? '#6366f1' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Waiting In Queue</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {summary?.waitingTokens ?? 0}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Currently Serving</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>
                {summary?.currentlyServing ?? 0}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Today</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {summary?.completedTokens ?? 0}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cancelled / Skipped</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                {summary?.cancelledTokens ?? 0}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #ec4899' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Wait Time</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ec4899', fontFamily: 'var(--font-mono)' }}>
                {analytics?.averageWaitTimeMinutes ?? 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>min</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Service Duration</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>
                {analytics?.averageServiceTimeMinutes ?? 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>min</span>
              </div>
            </div>
          </div>

          {/* Interactive Charts with Recharts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            
            {/* Chart 1: Daily Volume (BarChart) */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Daily Token Volume (Last 7 Days)</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.dailyVolumes || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="totalTokens" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Tokens" />
                    <Bar dataKey="completedTokens" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Tokens by Service (BarChart) */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Tokens by Service</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.serviceStats || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="serviceCode" type="category" stroke="#64748b" width={60} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="tokenCount" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Peak Queue Hours (LineChart) */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Peak Traffic Hours (8 AM - 5 PM)</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.peakHours || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hourLabel" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899' }} name="Tokens Issued" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Counter Utilization */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Counter Processing Output</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.counterUtilizations || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="counterNumber" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="processedTokens" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Tokens" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>College Services</h2>
            <button onClick={() => setShowServiceModal(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              <Plus size={16} /> Add Service
            </button>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px' }}>Code</th>
                  <th style={{ padding: '14px 20px' }}>Service Name</th>
                  <th style={{ padding: '14px 20px' }}>Description</th>
                  <th style={{ padding: '14px 20px' }}>Est. Time (min)</th>
                  <th style={{ padding: '14px 20px' }}>Waiting</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: idx !== services.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#6366f1' }}>{s.code}</td>
                    <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{s.description}</td>
                    <td style={{ padding: '14px 20px', color: '#06b6d4' }}>{s.estimatedTimeMinutes} min</td>
                    <td style={{ padding: '14px 20px', color: '#f59e0b', fontWeight: 700 }}>{s.waitingCount || 0}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${s.active ? 'badge-completed' : 'badge-cancelled'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button 
                        onClick={() => handleToggleService(s.id)} 
                        style={{ background: 'none', color: s.active ? '#ef4444' : '#10b981', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {s.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COUNTERS MANAGEMENT */}
      {activeTab === 'counters' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Active Counters</h2>
            <button onClick={() => setShowCounterModal(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              <Plus size={16} /> Add Counter
            </button>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px' }}>Counter No.</th>
                  <th style={{ padding: '14px 20px' }}>Counter Name</th>
                  <th style={{ padding: '14px 20px' }}>Assigned Service</th>
                  <th style={{ padding: '14px 20px' }}>Assigned Staff</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {counters.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom: idx !== counters.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#06b6d4' }}>{c.counterNumber}</td>
                    <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '14px 20px', color: '#6366f1' }}>{c.serviceName}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{c.staffName}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${c.active ? 'badge-completed' : 'badge-cancelled'}`}>
                        {c.active ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button 
                        onClick={() => handleToggleCounter(c.id)} 
                        style={{ background: 'none', color: c.active ? '#ef4444' : '#10b981', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        {c.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Staff Members</h2>
            <button onClick={() => setShowStaffModal(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              <Plus size={16} /> Add Staff
            </button>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px' }}>Name</th>
                  <th style={{ padding: '14px 20px' }}>Email</th>
                  <th style={{ padding: '14px 20px' }}>Phone</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: idx !== staffList.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#fff' }}>{s.fullName}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{s.phone || '-'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${s.active ? 'badge-completed' : 'badge-cancelled'}`}>
                        {s.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button 
                        onClick={() => handleToggleUser(s.id)} 
                        style={{ background: 'none', color: s.active ? '#ef4444' : '#10b981' }}
                      >
                        {s.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENTS */}
      {activeTab === 'students' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>Registered Students</h2>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px' }}>Name</th>
                  <th style={{ padding: '14px 20px' }}>Email</th>
                  <th style={{ padding: '14px 20px' }}>Phone</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.filter(u => u.role === 'STUDENT').map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#fff' }}>{s.fullName}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{s.phone || '-'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${s.active ? 'badge-completed' : 'badge-cancelled'}`}>
                        {s.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button 
                        onClick={() => handleToggleUser(s.id)} 
                        style={{ background: 'none', color: s.active ? '#ef4444' : '#10b981' }}
                      >
                        {s.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ALL CAMPUS QUEUES */}
      {activeTab === 'queues' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>Live Queue Tickets & Records</h2>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px' }}>Token</th>
                  <th style={{ padding: '14px 20px' }}>Student</th>
                  <th style={{ padding: '14px 20px' }}>Service</th>
                  <th style={{ padding: '14px 20px' }}>Counter</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Issued Time</th>
                </tr>
              </thead>
              <tbody>
                {allQueues.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: idx !== allQueues.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {t.tokenNumber}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#fff' }}>{t.studentName}</td>
                    <td style={{ padding: '14px 20px', color: '#6366f1' }}>{t.serviceName}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{t.counterNumber || '-'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {t.issueTime ? new Date(t.issueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Service */}
      {showServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-panel" style={{ padding: '28px', maxWidth: '460px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Add New College Service</h3>
            <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Service Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Examination Cell"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Code (Prefix)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. EXAM"
                  value={serviceForm.code}
                  onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estimated Service Time (Minutes)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1"
                  value={serviceForm.estimatedTimeMinutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, estimatedTimeMinutes: Number(e.target.value) })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea 
                  className="form-input" 
                  rows="2"
                  placeholder="Service description..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowServiceModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Counter */}
      {showCounterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-panel" style={{ padding: '28px', maxWidth: '460px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Add New Service Counter</h3>
            <form onSubmit={handleCreateCounter} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Counter Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. C-105"
                  value={counterForm.counterNumber}
                  onChange={(e) => setCounterForm({ ...counterForm, counterNumber: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Counter Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Admissions Desk A"
                  value={counterForm.name}
                  onChange={(e) => setCounterForm({ ...counterForm, name: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Assigned Service</label>
                <select 
                  className="form-input"
                  value={counterForm.serviceId}
                  onChange={(e) => setCounterForm({ ...counterForm, serviceId: e.target.value })}
                >
                  <option value="">-- Select Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Assigned Staff</label>
                <select 
                  className="form-input"
                  value={counterForm.staffId}
                  onChange={(e) => setCounterForm({ ...counterForm, staffId: e.target.value })}
                >
                  <option value="">-- Select Staff --</option>
                  {staffList.map(st => (
                    <option key={st.id} value={st.id}>{st.fullName} ({st.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCounterModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Counter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Staff */}
      {showStaffModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-panel" style={{ padding: '28px', maxWidth: '460px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Add Staff Member</h3>
            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Dr. Robert Vance"
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="staff@college.edu"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="+1 555 0100"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowStaffModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
