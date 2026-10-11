import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(fullName, email, password, phone, 'STUDENT');
      setSuccess(true);
      // Automatically log student in
      await login(email, password);
      setTimeout(() => {
        navigate('/student');
      }, 1000);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Student Registration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create an account to join college queues instantly</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> Registration successful! Logging you in...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '42px' }} 
                placeholder="Alex Morgan" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
          </div>

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
                placeholder="alex.m@college.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="tel" 
                className="form-input" 
                style={{ paddingLeft: '42px' }} 
                placeholder="+1 555 0192" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
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
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '24px' }}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Sign In</Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
