import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, 
  PhoneCall, 
  Play, 
  CheckCircle2, 
  SkipForward, 
  RefreshCw, 
  MapPin, 
  AlertCircle,
} from 'lucide-react';

const NO_COUNTER_MESSAGE = 'No counter assigned. Please contact the administrator.';

const StaffDashboard = () => {
  const { user } = useAuth();

  const [counter, setCounter] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noCounter, setNoCounter] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals for notes
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [notes, setNotes] = useState('');

  // Guards against a slow response from a previous login overwriting the current staff member's data
  const activeUserId = useRef(null);

  const resetState = () => {
    setCounter(null);
    setCurrentToken(null);
    setWaitingQueue([]);
    setNoCounter(false);
    setLoadError('');
    setError('');
    setSuccessMsg('');
    setShowCompleteModal(false);
    setShowSkipModal(false);
    setNotes('');
  };

  // Everything shown on this page comes from the backend for the *authenticated* user.
  // Reload from scratch whenever the logged-in user changes (login as someone else, refresh, other tab).
  const fetchPortal = useCallback(async ({ silent = false } = {}) => {
    const requestUserId = activeUserId.current;
    if (!silent) setLoading(true);
    try {
      const [counterRes, currentRes, queueRes] = await Promise.all([
        api.get('/staff/counter'),
        api.get('/staff/current'),
        api.get('/staff/queue')
      ]);
      if (activeUserId.current !== requestUserId) return; // user changed while waiting
      setCounter(counterRes.data);
      setCurrentToken(currentRes.data || null);
      setWaitingQueue(queueRes.data || []);
      setNoCounter(false);
      setLoadError('');
    } catch (err) {
      if (activeUserId.current !== requestUserId) return;
      if (err.response?.status === 404 && err.config?.url?.includes('/staff/counter')) {
        // Valid staff account, but no counter is linked to it in the database
        setCounter(null);
        setCurrentToken(null);
        setWaitingQueue([]);
        setNoCounter(true);
        setLoadError('');
      } else if (!silent) {
        console.error('Staff portal load error:', err);
        setLoadError(
          err.response?.data?.message ||
          (err.request && !err.response ? 'Cannot reach the server. Is the backend running?' : 'Failed to load staff counter details.')
        );
      }
    } finally {
      if (!silent && activeUserId.current === requestUserId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    activeUserId.current = user.id;
    resetState();
    fetchPortal();
    const interval = setInterval(() => fetchPortal({ silent: true }), 6000);
    return () => {
      clearInterval(interval);
      activeUserId.current = null;
    };
  }, [user?.id, fetchPortal]);

  const runAction = async (fn) => {
    setError('');
    setSuccessMsg('');
    setActionLoading(true);
    try {
      await fn();
      await fetchPortal({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'The action failed. Please try again.');
      await fetchPortal({ silent: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNext = () => runAction(async () => {
    const res = await api.post('/staff/queue/next');
    setCurrentToken(res.data);
    setSuccessMsg(`Called next token: ${res.data.tokenNumber}`);
  });

  const handleStartServing = () => {
    if (!currentToken) return undefined;
    return runAction(async () => {
      const res = await api.post(`/staff/queue/${currentToken.id}/serve`);
      setCurrentToken(res.data);
      setSuccessMsg(`Started serving ${res.data.tokenNumber}.`);
    });
  };

  const handleCompleteToken = () => {
    if (!currentToken) return undefined;
    const tokenNumber = currentToken.tokenNumber;
    return runAction(async () => {
      await api.post(`/staff/queue/${currentToken.id}/complete`, { notes });
      setSuccessMsg(`Token ${tokenNumber} marked as COMPLETED.`);
      setCurrentToken(null);
      setShowCompleteModal(false);
      setNotes('');
    });
  };

  const handleSkipToken = () => {
    if (!currentToken) return undefined;
    const tokenNumber = currentToken.tokenNumber;
    return runAction(async () => {
      await api.post(`/staff/queue/${currentToken.id}/skip`, { notes });
      setSuccessMsg(`Token ${tokenNumber} SKIPPED.`);
      setCurrentToken(null);
      setShowSkipModal(false);
      setNotes('');
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '60px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading assigned counter portal...
      </div>
    );
  }

  // Staff account exists but has no counter: say so clearly, never fall back to someone else's counter
  if (noCounter) {
    return (
      <div style={{ maxWidth: '720px', margin: '60px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
          <AlertCircle size={36} color="#f59e0b" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{NO_COUNTER_MESSAGE}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '6px' }}>
            Signed in as <strong style={{ color: '#fff' }}>{user?.fullName}</strong> (Staff ID: {user?.id})
          </p>
          <button onClick={() => fetchPortal()} className="btn-secondary" style={{ marginTop: '18px', padding: '10px 18px', fontSize: '0.85rem' }}>
            <RefreshCw size={16} /> Check again
          </button>
        </div>
      </div>
    );
  }

  // Could not load at all (server down, 5xx...): show the error with a retry instead of a fake counter
  if (loadError || !counter) {
    return (
      <div style={{ maxWidth: '720px', margin: '60px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
          <AlertCircle size={36} color="#ef4444" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Could not load your counter</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{loadError || 'No data was returned.'}</p>
          <button onClick={() => fetchPortal()} className="btn-secondary" style={{ marginTop: '18px', padding: '10px 18px', fontSize: '0.85rem' }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const nowServing = currentToken?.tokenNumber || counter.currentTokenNumber || null;
  const hasService = counter.serviceId != null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Counter Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderLeft: '4px solid #06b6d4' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#06b6d4', background: 'rgba(6,182,212,0.15)', padding: '3px 10px', borderRadius: '6px' }}>
              {counter.counterNumber}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Staff: {counter.staffName || user?.fullName} &middot; Staff ID: {counter.staffId ?? user?.id}
            </span>
            {!counter.active && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '3px 10px', borderRadius: '6px' }}>
                COUNTER INACTIVE
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            {counter.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <MapPin size={16} color="#6366f1" /> Assigned Service:{' '}
            {hasService ? (
              <><strong style={{ color: '#fff' }}>{counter.serviceName}</strong> ({counter.serviceCode})</>
            ) : (
              <strong style={{ color: '#f59e0b' }}>None - contact the administrator</strong>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Currently Serving</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: nowServing ? '#10b981' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {nowServing || '—'}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Waiting in Queue</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              {waitingQueue.length}
            </span>
          </div>

          <button 
            onClick={() => fetchPortal({ silent: true })} 
            className="btn-secondary" 
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* Section: Current Serving / Called Student Panel */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', background: 'rgba(15,23,42,0.85)', border: currentToken ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Now at Counter</h2>
          {currentToken && (
            <span className={`badge badge-${currentToken.status.toLowerCase()}`}>
              {currentToken.status}
            </span>
          )}
        </div>

        {currentToken ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Student Token</span>
                <div style={{ fontSize: '3.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', letterSpacing: '1px', lineHeight: 1.1 }}>
                  {currentToken.tokenNumber}
                </div>
                <div style={{ marginTop: '8px', fontSize: '1rem', color: '#06b6d4', fontWeight: 600 }}>
                  Student: {currentToken.studentName} ({currentToken.studentEmail})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {currentToken.status === 'CALLED' && (
                  <button 
                    onClick={handleStartServing} 
                    disabled={actionLoading}
                    className="btn-primary" 
                    style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                  >
                    <Play size={18} /> Start Serving
                  </button>
                )}

                {(currentToken.status === 'SERVING' || currentToken.status === 'CALLED') && (
                  <button 
                    onClick={() => setShowCompleteModal(true)} 
                    disabled={actionLoading}
                    className="btn-success" 
                    style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                  >
                    <CheckCircle2 size={18} /> Complete Service
                  </button>
                )}

                <button 
                  onClick={() => setShowSkipModal(true)} 
                  disabled={actionLoading}
                  className="btn-danger" 
                  style={{ padding: '12px 20px', fontSize: '0.95rem' }}
                >
                  <SkipForward size={18} /> Skip
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Issued At</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                  {currentToken.issueTime ? new Date(currentToken.issueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Called At</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                  {currentToken.calledTime ? new Date(currentToken.calledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Service Started</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                  {currentToken.servedTime ? new Date(currentToken.servedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '20px' }}>
              No student is currently called to this counter.
            </p>
            <button 
              onClick={handleCallNext} 
              disabled={waitingQueue.length === 0 || actionLoading || !hasService || !counter.active}
              className="btn-primary" 
              style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '12px' }}
            >
              <PhoneCall size={20} /> Call Next Student ({waitingQueue.length} Waiting)
            </button>
          </div>
        )}
      </div>

      {/* Section: Waiting Queue Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#6366f1" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
              Waiting Line (FIFO Order)
            </h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Earliest tokens served first</span>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {waitingQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Queue is empty. No students waiting for {counter.serviceName}.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 20px' }}>Pos</th>
                    <th style={{ padding: '14px 20px' }}>Token Number</th>
                    <th style={{ padding: '14px 20px' }}>Student Name</th>
                    <th style={{ padding: '14px 20px' }}>Student Email</th>
                    <th style={{ padding: '14px 20px' }}>Requested At</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingQueue.map((t, idx) => (
                    <tr 
                      key={t.id} 
                      style={{ 
                        borderBottom: idx !== waitingQueue.length - 1 ? '1px solid var(--border-glass)' : 'none',
                        background: idx === 0 ? 'rgba(99,102,241,0.05)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: idx === 0 ? '#10b981' : 'var(--text-muted)' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                        {t.tokenNumber}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#fff' }}>
                        {t.studentName}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {t.studentEmail}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {t.issueTime ? new Date(t.issueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className="badge badge-waiting">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-panel" style={{ padding: '28px', maxWidth: '440px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Complete Service</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Finalize token <strong>{currentToken?.tokenNumber}</strong> for {currentToken?.studentName}.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Resolution Notes (Optional)
              </label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="e.g., Documents verified and certificate issued."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCompleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCompleteToken} disabled={actionLoading} className="btn-success">
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Modal */}
      {showSkipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-panel" style={{ padding: '28px', maxWidth: '440px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#ef4444' }}>Skip Token</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Are you sure student <strong>{currentToken?.studentName}</strong> ({currentToken?.tokenNumber}) was not present?
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Skip Reason (Optional)
              </label>
              <textarea 
                className="form-input" 
                rows="2" 
                placeholder="e.g., Student was not present at the counter after 3 calls."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSkipModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSkipToken} disabled={actionLoading} className="btn-danger">
                Skip Token
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;
