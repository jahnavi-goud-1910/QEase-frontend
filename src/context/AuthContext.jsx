import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qease_token'));
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem('qease_token');
    localStorage.removeItem('qease_user');
    setToken(null);
    setUser(null);
  };

  // Restore the session on page load / refresh. The cached user is only a placeholder: the real identity
  // always comes from the backend (/auth/me, resolved from the JWT), so a refresh can never show a stale
  // or default staff member.
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('qease_token');

      if (!storedToken) {
        clearSession();
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;
        setToken(storedToken);
        setUser(res.data);
        localStorage.setItem('qease_user', JSON.stringify(res.data));
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          // Token invalid / expired / user removed -> drop the session
          clearSession();
        } else {
          // Backend unreachable: keep the token, fall back to the cached profile for now
          try {
            const cached = JSON.parse(localStorage.getItem('qease_user') || 'null');
            setToken(storedToken);
            setUser(cached);
          } catch {
            clearSession();
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initAuth();
    return () => { cancelled = true; };
  }, []);

  // Keep every open tab on the same account. localStorage is shared between tabs, so if another tab
  // logs in as a different user (or logs out) this tab must follow, otherwise its API calls would use the
  // new token while the UI still showed the previous person.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'qease_token' && e.key !== 'qease_user' && e.key !== null) return;
      const newToken = localStorage.getItem('qease_token');
      let newUser = null;
      try { newUser = JSON.parse(localStorage.getItem('qease_user') || 'null'); } catch { newUser = null; }
      setToken(newToken);
      setUser(newToken ? newUser : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, ...userData } = res.data;

    localStorage.setItem('qease_token', jwtToken);
    localStorage.setItem('qease_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);

    return userData;
  };

  const register = async (fullName, email, password, phone, role = 'STUDENT') => {
    const res = await api.post('/auth/register', {
      fullName,
      email,
      password,
      phone,
      role
    });
    return res.data;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
