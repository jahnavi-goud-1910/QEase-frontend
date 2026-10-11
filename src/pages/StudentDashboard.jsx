import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TokenCard from '../components/TokenCard';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  RefreshCw, 
  History, 
  Layers, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search 
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();

  const [activeToken, setActiveToken] = useState(null);
  const [history, setHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [takingToken, setTakingToken] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh active token status every 6 seconds
    const interval = setInterval(fetchActiveToken, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchActiveToken(),
      fetchServices(),
      fetchHistory()
    ]);
    setLoading(false);
  };

  const fetchActiveToken = async () => {
    try {
      const res = await api.get('/queue/my-active');
      setActiveToken(res.data || null);
    } catch (err) {
      console.error("Error fetching active token:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/queue/my-history');
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleTakeToken = async (serviceId) => {
    setError('');
    setSuccessMsg('');
    setTakingToken(true);

    try {
      const res = await api.post('/queue/take', { serviceId });
      setActiveToken(res.data);
      setSuccessMsg(`Successfully joined queue! Your token is ${res.data.tokenNumber}.`);
      
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      await Promise.all([fetchServices(), fetchHistory()]);
    } catch (err) {
      console.error("Failed to take token:", err);
      setError(err.response?.data?.message || 'Failed to take queue token. Please try again.');
    } finally {
      setTakingToken(false);
    }
  };

  const handleCancelToken = async (tokenId) => {
    setError('');
    setSuccessMsg('');

    try {
      await api.delete(`/queue/${tokenId}`);
      setSuccessMsg('Your token has been successfully cancelled.');
      setActiveToken(null);
      await Promise.all([fetchServices(), fetchHistory()]);
    } catch (err) {
      console.error("Failed to cancel token:", err);
      setError(err.response?.data?.message || 'Failed to cancel token.');
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            Hello, {user?.fullName || 'Student'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage your digital college tokens and monitor queue progress in real-time.
          </p>
        </div>

        <button 
          onClick={loadDashboardData} 
          className="btn-secondary" 
          style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          title="Refresh Queue Status"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '14px 18px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '14px 18px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Section 1: Active Token Card (if student is in queue) */}
      {activeToken && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Your Active Token</h2>
          </div>
          <TokenCard token={activeToken} onCancel={handleCancelToken} />
        </div>
      )}

      {/* Section 2: College Services - Take a Token */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Available College Services</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Select a service below to request a digital queue token
            </p>
          </div>

          {/* Search filter */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px', fontSize: '0.85rem' }} 
              placeholder="Search services..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {activeToken && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '12px 16px', borderRadius: '10px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="#6366f1" />
            <span>You currently have an active token (<strong>{activeToken.tokenNumber}</strong>). You must complete or cancel it before joining another queue.</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredServices.map(service => {
            const isServiceActive = service.active;
            const hasExistingToken = !!activeToken;

            return (
              <div 
                key={service.id} 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: '3px solid #6366f1',
                  opacity: !isServiceActive ? 0.6 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', background: 'rgba(99,102,241,0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                      {service.code}
                    </span>
                    <span className="badge badge-waiting">
                      {service.waitingCount || 0} in line
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                    {service.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '40px' }}>
                    {service.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                    <span>Estimated wait</span>
                    <span style={{ color: '#06b6d4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> ~{service.estimatedTimeMinutes} min/student
                    </span>
                  </div>

                  <button 
                    onClick={() => handleTakeToken(service.id)} 
                    disabled={hasExistingToken || !isServiceActive || takingToken}
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      fontSize: '0.9rem',
                      opacity: (hasExistingToken || !isServiceActive) ? 0.5 : 1,
                      cursor: (hasExistingToken || !isServiceActive) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <PlusCircle size={16} /> {hasExistingToken ? 'Queue Active' : 'Take Token'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Token History Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={20} color="#06b6d4" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Queue History</h2>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You haven't requested any tokens yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 20px' }}>Token</th>
                    <th style={{ padding: '14px 20px' }}>Service</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px' }}>Counter</th>
                    <th style={{ padding: '14px 20px' }}>Issued Time</th>
                    <th style={{ padding: '14px 20px' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((t, idx) => (
                    <tr 
                      key={t.id} 
                      style={{ 
                        borderBottom: idx !== history.length - 1 ? '1px solid var(--border-glass)' : 'none',
                        background: 'transparent'
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                        {t.tokenNumber}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {t.serviceName}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge badge-${t.status.toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {t.counterNumber || '-'}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {t.issueTime ? new Date(t.issueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {t.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
