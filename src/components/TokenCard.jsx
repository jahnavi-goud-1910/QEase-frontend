import React, { useState } from 'react';
import { Clock, UserCheck, MapPin, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';

const TokenCard = ({ token, onCancel }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!token) return null;

  const isCalled = token.status === 'CALLED';
  const isServing = token.status === 'SERVING';
  const isWaiting = token.status === 'WAITING';

  return (
    <div 
      className={`glass-panel ${isCalled ? 'pulse-called-ticket' : ''}`} 
      style={{ 
        padding: '24px', 
        position: 'relative', 
        overflow: 'hidden',
        borderLeft: isCalled ? '4px solid #ec4899' : isServing ? '4px solid #06b6d4' : '4px solid #6366f1'
      }}
    >
      {/* Background Subtle Gradient Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: isCalled ? 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {token.serviceName}
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', letterSpacing: '1px', lineHeight: 1.1, marginTop: '4px' }}>
            {token.tokenNumber}
          </h2>
        </div>

        <span className={`badge badge-${token.status ? token.status.toLowerCase() : 'waiting'}`}>
          {token.status}
        </span>
      </div>

      {/* Callout alert if CALLED */}
      {isCalled && (
        <div style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle color="#ec4899" size={20} />
          <div>
            <div style={{ fontWeight: 700, color: '#ec4899', fontSize: '0.9rem' }}>YOUR TURN IS HERE!</div>
            <div style={{ fontSize: '0.82rem', color: '#fff' }}>Please proceed to Counter {token.counterNumber || 'assigned'} immediately.</div>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', background: 'rgba(15,23,42,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Queue Position</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: isWaiting ? '#f59e0b' : '#10b981' }}>
            {isWaiting ? `#${token.queuePosition}` : 'Now'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>People Ahead</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            {token.peopleAhead} {token.peopleAhead === 1 ? 'student' : 'students'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Est. Wait Time</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={16} /> ~{token.estimatedWaitTimeMinutes} min
          </span>
        </div>

        {token.counterName && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Counter</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} /> {token.counterName} ({token.counterNumber})
            </span>
          </div>
        )}
      </div>

      {/* Cancel button if waiting */}
      {isWaiting && onCancel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setShowCancelModal(true)}
            className="btn-danger" 
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            <XCircle size={14} /> Leave Queue
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-panel" style={{ padding: '24px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Leave the Queue?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Are you sure you want to cancel token <strong>{token.tokenNumber}</strong>? You will lose your position in line.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                Keep Token
              </button>
              <button 
                onClick={() => { setShowCancelModal(false); onCancel(token.id); }} 
                className="btn-danger" 
                style={{ flex: 1 }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenCard;
