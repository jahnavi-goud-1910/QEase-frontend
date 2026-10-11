import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveServices();
  }, []);

  const fetchActiveServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services on landing page:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      
      {/* Hero Section */}
      <section style={{ padding: '80px 20px 60px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '6px 16px', borderRadius: 'var(--radius-full)', color: '#6366f1', fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px' }}>
          <Sparkles size={16} /> Next-Gen Digital Campus Queue Management
        </div>

        <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          No More Standing in Line.<br />
          Join College Queues <span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>Digitally.</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          QEase eliminates physical waiting lines across Admissions, Fee Payment, Exam Cell, and Library counters. Get real-time position updates, live wait time predictions, and turn notifications directly on your device.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '12px' }}>
            Get Digital Token Now <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '12px' }}>
            Portal Login
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 60px', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Zap color="#6366f1" size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Instant Token Issuance</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Select your required college service and instantly generate a FIFO ticket with transparent estimated wait time calculations.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ background: 'rgba(6,182,212,0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Smartphone color="#06b6d4" size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Live Mobile Tracking</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Track how many students are ahead of you in real time. Receive instant turn-approaching alerts so you can study or grab coffee.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ background: 'rgba(236,72,153,0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck color="#ec4899" size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Role-Based Dashboards</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Dedicated portals for Students, Counter Staff (Call Next / Serve / Complete / Skip), and Administrators with full analytics.
          </p>
        </div>
      </section>

      {/* Available College Services Live Ticker */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Active Campus Counters</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Real-time queue length across college services</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading live service counters...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {services.map(s => (
              <div key={s.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', borderTop: '3px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                    {s.code}
                  </span>
                  <span className="badge badge-waiting">
                    <Users size={12} /> {s.waitingCount || 0} waiting
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{s.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', height: '36px', overflow: 'hidden' }}>
                  {s.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                  <span>Est. Service Time</span>
                  <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#06b6d4" /> {s.estimatedTimeMinutes} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default LandingPage;
