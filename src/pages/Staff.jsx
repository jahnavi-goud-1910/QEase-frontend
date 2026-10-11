import { useState } from 'react'; import { api, errMsg, get } from '../api'; import { Alert, Badge, Stat, usePoll } from '../ui';
export default function Staff() {
  const [d, err, reload] = usePoll(() => get('/api/staff/queue'), 3000), [msg, setMsg] = useState('');
  const act = async (path, ask) => { if (ask && !confirm(ask)) return; setMsg('');
    try { await api.post('/api/staff/queue/' + path); } catch (e) { setMsg(errMsg(e)); } reload(); };
  if (err) return <><h1>Counter console</h1><Alert bad={err} /></>;
  if (!d) return <p>Loading...</p>;
  const c = d.current;
  return <><h1>{d.counter} <span className="muted">- {d.service}</span></h1><Alert bad={msg} />
    <div className="grid3"><Stat label="Waiting" value={d.stats.waiting} /><Stat label="Completed today" value={d.stats.completedToday} /><Stat label="Skipped today" value={d.stats.skippedToday} /></div>
    <div className="card tokencard"><div className="muted">Current token</div>
      {c ? <><div className="token">{c.label}</div><p>{c.student} <Badge s={c.status} /></p>
        <div className="row">{c.status === 'CALLED' && <button className="btn" onClick={() => act(c.id + '/serve')}>Start serving</button>}
          {c.status === 'SERVING' && <button className="btn" onClick={() => act(c.id + '/complete')}>Complete</button>}
          <button className="btn danger" onClick={() => act(c.id + '/skip', 'Skip this student?')}>Skip</button></div></>
        : <><p className="muted">No student at your counter.</p><button className="btn" onClick={() => act('next')}>Call next</button></>}</div>
    <h3>Waiting queue (first come, first served)</h3><div className="card tablewrap"><table><thead><tr><th>#</th><th>Token</th><th>Student</th><th>Est. wait</th></tr></thead>
      <tbody>{d.waiting.map((w, i) => <tr key={w.id}><td>{i + 1}</td><td>{w.label}</td><td>{w.student}</td><td>{w.estimatedMinutes} min</td></tr>)}
        {!d.waiting.length && <tr><td colSpan="4" className="muted">The queue is empty.</td></tr>}</tbody></table></div></>;
}
