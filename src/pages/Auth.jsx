import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom';
import { api, errMsg } from '../api'; import { useAuth, homeFor } from '../auth'; import { Alert } from '../ui';
function AuthForm({ mode }) {
  const reg = mode === 'register', nav = useNavigate(), { login } = useAuth();
  const [f, setF] = useState({ name: '', email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => { e.preventDefault(); setBusy(true); setErr('');
    try { const r = (await api.post(reg ? '/api/auth/register' : '/api/auth/login', f)).data; login(r); nav(homeFor(r.role)); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  return <div className="authbox"><form className="card" onSubmit={submit}><h2>{reg ? 'Create student account' : 'Login to QEase'}</h2><Alert bad={err} />
    {reg && <label>Full name<input required value={f.name} onChange={set('name')} /></label>}
    <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
    <label>Password<input type="password" required minLength={reg ? 6 : 1} value={f.password} onChange={set('password')} /></label>
    <button className="btn" disabled={busy}>{busy ? 'Please wait...' : reg ? 'Register' : 'Login'}</button>
    <p className="muted">{reg ? <>Already registered? <Link to="/login">Login</Link></> : <>New student? <Link to="/register">Register</Link></>}</p></form></div>;
}
export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
