import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Layers, 
  Bell, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Auto-poll notifications every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/queue/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/queue/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'ADMIN':
        return <span className="badge" style={{ background: 'rgba(236,72,153,0.2)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.4)' }}><ShieldCheck size={12}/> Admin</span>;
      case 'STAFF':
        return <span className="badge" style={{ background: 'rgba(6,182,212,0.2)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.4)' }}><UserCheck size={12}/> Staff</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.4)' }}><GraduationCap size={12}/> Student</span>;
    }
  };

  return (
    <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '14px 28px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers color="#fff" size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Q<span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>Ease</span>
            </span>
            <span style={{ fontSize: '0.68rem', display: 'block', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-4px' }}>College Service Queues</span>
          </div>
        </Link>

        {/* Navigation Links & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <>
              {/* Role Dashboard Navigation */}
              {user.role === 'STUDENT' && (
                <Link 
                  to="/student" 
                  style={{ 
                    color: location.pathname === '/student' ? '#6366f1' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}
                >
                  My Queue
                </Link>
              )}

              {user.role === 'STAFF' && (
                <Link 
                  to="/staff" 
                  style={{ 
                    color: location.pathname === '/staff' ? '#06b6d4' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}
                >
                  Counter Portal
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  style={{ 
                    color: location.pathname === '/admin' ? '#ec4899' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}
                >
                  Admin Portal
                </Link>
              )}

              {/* Student Notification Bell */}
              {user.role === 'STUDENT' && (
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)} 
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', padding: '8px', borderRadius: '10px', color: '#fff', position: 'relative', display: 'flex' }}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-dark)' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Drawer */}
                  {showNotifications && (
                    <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '45px', width: '320px', padding: '16px', zIndex: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: 600 }}>
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '16px 0' }}>No notifications yet</p>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              style={{ 
                                padding: '10px', 
                                borderRadius: '8px', 
                                background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.1)', 
                                borderLeft: n.isRead ? '2px solid transparent' : '2px solid #6366f1' 
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{n.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)' }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1 }}>{user.fullName}</span>
                  <div style={{ marginTop: '2px' }}>{getRoleBadge(user.role)}</div>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link to="/staff" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', marginRight: '6px' }}>
                Staff
              </Link>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
