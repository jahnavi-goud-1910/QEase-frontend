import { useState } from 'react'; import { useNavigate, Link } from 'react-router-dom';
import { api, errMsg, get } from '../api'; import { useAuth } from '../auth'; import { Alert, Badge, Stat, fmt, usePoll } from '../ui';

export function Dashboard() {
  const [t, err, reload] = usePoll(() => api.get('/api/queue/my-active').then(r => r.data || null), 4000), [msg, setMsg] = useState('');
  const cancel = async () => { if (!confirm('Cancel your token? You will lose your place in the queue.')) return;
    try { await api.delete('/api/queue/' + t.id); setMsg('Token cancelled'); reload(); } catch (e) { setMsg(errMsg(e)); } };
  return <><h1>My queue</h1><Alert bad={err} info={msg} />
    {t === null && !err && <div className="card empty"><p>You have no active token.</p><Link className="btn" to="/student/services">Take a token</Link></div>}
    {t && <><Alert ok={t.status === 'CALLED' ? t.notice : null} info={t.status === 'WAITING' ? t.notice : null} />
      <div className="card tokencard"><div className="muted">{t.service}</div><div className="token">{t.label}</div><Badge s={t.status} />
        <div className="grid3"><Stat label="Queue position" value={t.status === 'WAITING' ? t.position : '-'} /><Stat label="People ahead" value={t.ahead} /><Stat label="Estimated wait" value={t.status === 'WAITING' ? t.estimatedMinutes + ' min' : '-'} /></div>
        {t.counter && <p>Counter: <b>{t.counter}</b></p>}
        {t.status === 'WAITING' && <button className="btn danger" onClick={cancel}>Cancel token</button>}</div></>}</>;
}

export function Services() {
  const [list, err] = usePoll(() => get('/api/services'), 15000), [q, setQ] = useState(''), [msg, setMsg] = useState(''), nav = useNavigate();
  const take = async s => { try { await api.post('/api/queue/take', { serviceId: s.id }); nav('/student'); } catch (e) { setMsg(errMsg(e)); } };
  const shown = (list || []).filter(s => (s.name + s.description).toLowerCase().includes(q.toLowerCase()));
  return <><h1>College services</h1><Alert bad={err || msg} /><input className="search" placeholder="Search services..." value={q} onChange={e => setQ(e.target.value)} aria-label="Search services" />
    <div className="grid3">{shown.map(s => <div className="card" key={s.id}><h3>{s.name}</h3><p className="muted">{s.description}</p><p>Avg. service time: {s.avgMinutes} min</p>
      <button className="btn" onClick={() => take(s)}>Take token</button></div>)}</div>{list && !shown.length && <div className="card empty">No services found.</div>}</>;
}

export function History() {
  const [rows, err] = usePoll(() => get('/api/queue/my-history'), 10000), [f, setF] = useState('ALL');
  const shown = (rows || []).filter(r => f === 'ALL' || r.status === f);
  return <><h1>Queue history</h1><Alert bad={err} /><select value={f} onChange={e => setF(e.target.value)} aria-label="Filter by status">
    {['ALL', 'COMPLETED', 'CANCELLED', 'SKIPPED', 'WAITING', 'SERVING'].map(s => <option key={s}>{s}</option>)}</select>
    <div className="card tablewrap"><table><thead><tr><th>Token</th><th>Service</th><th>Status</th><th>Taken at</th><th>Finished</th></tr></thead>
      <tbody>{shown.map(r => <tr key={r.id}><td>{r.label}</td><td>{r.service}</td><td><Badge s={r.status} /></td><td>{fmt(r.createdAt)}</td><td>{fmt(r.completedAt)}</td></tr>)}
        {!shown.length && <tr><td colSpan="5" className="muted">Nothing here yet.</td></tr>}</tbody></table></div></>;
}

export function Profile() {
  const { user } = useAuth();
  return <><h1>Profile</h1><div className="card"><p><b>Name:</b> {user.name}</p><p><b>Email:</b> {user.email}</p><p><b>Role:</b> {user.role}</p></div></>;
}
