import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, UserCheck, ShieldCheck, GraduationCap, AlertCircle } from 'lucide-react';

// Demo convenience only (matches the seed data). These just sign in as that account; which counter and
// service the dashboard shows is decided entirely by the backend from the account that logs in.
// Set VITE_SHOW_DEMO_LOGINS=false in production to hide the one-click demo accounts.
const SHOW_DEMO = import.meta.env.VITE_SHOW_DEMO_LOGINS !== 'false';

const DEMO_STAFF = [
  { label: 'Exam', email: 'staff.exam@college.edu' },
  { label: 'Accounts', email: 'staff.fees@college.edu' },
  { label: 'Certificates', email: 'staff.cert@college.edu' },
  { label: 'Student Section', email: 'staff.stud@college.edu' },
  { label: 'Administration', email: 'staff.admn@college.edu' },
  { label: 'Library', email: 'staff.libr@college.edu' },
  { label: 'No counter', email: 'staff.none@college.edu' },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user: currentUser, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const staffMode = searchParams.get('role') === 'staff';

  const homeFor = (role) => (
    role === 'STUDENT' ? '/student' : role === 'STAFF' ? '/staff' : role === 'ADMIN' ? '/admin' : '/'
  );

  // After login always go to the dashboard that belongs to the account that actually logged in
  // (never to a page chosen for a different role).
  const goAfterLogin = (loggedIn) => {
    const wanted = location.state?.from;
    const roleHome = homeFor(loggedIn.role);
    if (wanted && wanted.startsWith(roleHome)) navigate(wanted, { replace: true });
    else navigate(roleHome, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedIn = await login(email, password);
      goAfterLogin(loggedIn);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(demoEmail, demoPass);
      goAfterLogin(loggedIn);
    } catch (err) {
      setError('Failed to login with demo account.');
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && currentUser) {
    return <Navigate to={homeFor(currentUser.role)} replace />;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{staffMode ? 'Staff Login' : 'Welcome Back'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {staffMode ? 'Sign in with your staff account to open your counter' : 'Log in to access your college queue portal'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '42px' }} 
                placeholder="student@college.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '42px' }} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Credentials for Instant Evaluation */}
        {SHOW_DEMO && (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', textAlign: 'center', marginBottom: '12px' }}>
            Quick Demo Login (Click to Test)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              onClick={() => fillDemoAccount('student1@college.edu', 'password123')}
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '8px 4px', color: '#6366f1', fontSize: '0.75rem', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <GraduationCap size={16} /> Student
            </button>

            <button 
              onClick={() => fillDemoAccount('admin@college.edu', 'password123')}
              style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '8px', padding: '8px 4px', color: '#ec4899', fontSize: '0.75rem', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          </div>

          {/* Demo staff accounts: each one is a DIFFERENT staff member with their own counter */}
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center', marginBottom: '6px' }}>
              Demo staff accounts (one per service)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEMO_STAFF.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => fillDemoAccount(d.email, 'password123')}
                  disabled={loading}
                  style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px', padding: '8px 4px', color: '#06b6d4', fontSize: '0.72rem', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                >
                  <UserCheck size={16} /> Staff · {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '24px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6366f1', fontWeight: 600 }}>Register as Student</Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
