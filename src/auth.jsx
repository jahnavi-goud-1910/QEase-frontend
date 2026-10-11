import { createContext, useContext, useState } from 'react';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export const homeFor = role => ({ STUDENT: '/student', STAFF: '/staff', ADMIN: '/admin' })[role] || '/login';
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('qease_user') || 'null'));
  const login = r => { localStorage.setItem('qease_token', r.token); localStorage.setItem('qease_user', JSON.stringify(r)); setUser(r); };
  const logout = () => { localStorage.clear(); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
