import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api, errMsg, get } from '../api'; import { Alert, Badge, Stat, usePoll } from '../ui';

const Chart = ({ title, data }) => <div className="card"><h4>{title}</h4>{data?.length
  ? <ResponsiveContainer width="100%" height={210}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#2457d6" /></BarChart></ResponsiveContainer>
  : <p className="muted">No data yet</p>}</div>;

function Overview() {
  const [d] = usePoll(() => get('/api/admin/dashboard'), 8000), [a] = usePoll(() => get('/api/admin/analytics'), 15000);
  return <>{d && <div className="grid4">{Object.entries(d).map(([k, v]) => <Stat key={k} label={k.replace(/([A-Z])/g, ' $1')} value={v} />)}</div>}
    {a && <><div className="grid4"><Stat label="Avg waiting time (min)" value={a.avgWaitMin} /><Stat label="Avg service time (min)" value={a.avgServiceMin} /></div>
      <div className="grid2"><Chart title="Tokens per day" data={a.perDay} /><Chart title="Tokens by service" data={a.perService} /><Chart title="Peak queue hours" data={a.perHour} />
        <Chart title="Completed per counter (utilisation)" data={a.perCounter} /><Chart title="Tokens by status" data={a.byStatus} /></div></>}</>;
}

/** Generic list + add/edit form + activate/deactivate, reused for staff, students, services and counters. */
function Manager({ list, base, fields = [], cols, toggleBase = base }) {
  const empty = Object.fromEntries(fields.map(f => [f.k, '']));
  const [rows, setRows] = useState([]), [form, setForm] = useState(empty), [edit, setEdit] = useState(null), [msg, setMsg] = useState({});
  const load = () => get(list).then(setRows).catch(e => setMsg({ bad: errMsg(e) }));
  useEffect(() => { load(); }, [list]);
  const save = async e => { e.preventDefault();
    const body = Object.fromEntries(fields.map(f => [f.k, f.num ? (form[f.k] === '' || form[f.k] == null ? null : Number(form[f.k])) : form[f.k]]));
    try { edit ? await api.put(`${base}/${edit}`, body) : await api.post(base, body); setMsg({ ok: 'Saved' }); setForm(empty); setEdit(null); load(); }
    catch (x) { setMsg({ bad: errMsg(x) }); } };
  const flip = async r => { if (!confirm(`${r.active ? 'Deactivate' : 'Activate'} "${r.name}"?`)) return;
    try { await api.patch(`${toggleBase}/${r.id}/status`); load(); } catch (x) { setMsg({ bad: errMsg(x) }); } };
  return <><Alert {...msg} />
    {fields.length > 0 && <form className="card form" onSubmit={save}><h4>{edit ? 'Edit' : 'Add new'}</h4><div className="formgrid">{fields.map(f => <label key={f.k}>{f.label}
      {f.options ? <select required={!f.opt} value={form[f.k] ?? ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })}><option value="">{f.opt ? '- none -' : 'Select...'}</option>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        : <input required={!f.opt} type={f.type || 'text'} min={f.num ? 1 : undefined} value={form[f.k] ?? ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />}</label>)}</div>
      <div className="row"><button className="btn">{edit ? 'Update' : 'Add'}</button>{edit && <button type="button" className="btn ghost" onClick={() => { setEdit(null); setForm(empty); }}>Cancel edit</button>}</div></form>}
    <div className="card tablewrap"><table><thead><tr>{cols.map(c => <th key={c[0]}>{c[1]}</th>)}<th>Status</th><th /></tr></thead>
      <tbody>{rows.map(r => <tr key={r.id}>{cols.map(c => <td key={c[0]}>{String(r[c[0]] ?? '-')}</td>)}<td><Badge s={r.active ? 'ACTIVE' : 'INACTIVE'} /></td>
        <td className="row">{fields.length > 0 && <button className="btn small ghost" onClick={() => { setEdit(r.id); setForm(Object.fromEntries(fields.map(f => [f.k, r[f.k] ?? '']))); }}>Edit</button>}
          <button className="btn small" onClick={() => flip(r)}>{r.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}
        {!rows.length && <tr><td colSpan={cols.length + 2} className="muted">Nothing to show.</td></tr>}</tbody></table></div></>;
}

function Queues() {
  const [rows, err] = usePoll(() => get('/api/admin/queues'), 4000);
  return <><Alert bad={err} /><div className="card tablewrap"><table><thead><tr><th>Token</th><th>Service</th><th>Student</th><th>Status</th><th>Counter</th><th>Position</th></tr></thead>
    <tbody>{(rows || []).map(r => <tr key={r.id}><td>{r.label}</td><td>{r.service}</td><td>{r.student}</td><td><Badge s={r.status} /></td><td>{r.counter || '-'}</td><td>{r.position || '-'}</td></tr>)}
      {rows && !rows.length && <tr><td colSpan="6" className="muted">No active tokens.</td></tr>}</tbody></table></div></>;
}

export default function Admin() {
  const [tab, setTab] = useState('Overview'), [svc, setSvc] = useState([]), [staff, setStaff] = useState([]);
  useEffect(() => { get('/api/admin/services').then(setSvc).catch(() => {}); get('/api/admin/users?role=STAFF').then(setStaff).catch(() => {}); }, [tab]);
  const tabs = {
    Overview: <Overview />, Queues: <Queues />,
    Students: <Manager list="/api/admin/users?role=STUDENT" base="/api/admin/users" cols={[['name', 'Name'], ['email', 'Email']]} />,
    Staff: <Manager list="/api/admin/users?role=STAFF" base="/api/admin/staff" cols={[['name', 'Name'], ['email', 'Email']]}
      fields={[{ k: 'name', label: 'Name' }, { k: 'email', label: 'Email', type: 'email' }, { k: 'password', label: 'Password (blank = keep)', type: 'password', opt: true }]} />,
    Services: <Manager list="/api/admin/services" base="/api/admin/services" cols={[['name', 'Service'], ['prefix', 'Prefix'], ['avgMinutes', 'Avg min']]}
      fields={[{ k: 'name', label: 'Name' }, { k: 'prefix', label: 'Prefix (max 8)' }, { k: 'description', label: 'Description', opt: true }, { k: 'avgMinutes', label: 'Avg service minutes', type: 'number', num: true }]} />,
    Counters: <Manager key={svc.length + '-' + staff.length} list="/api/admin/counters" base="/api/admin/counters" cols={[['name', 'Counter'], ['serviceName', 'Service'], ['staffName', 'Staff']]}
      fields={[{ k: 'name', label: 'Name' }, { k: 'serviceId', label: 'Service', num: true, options: svc.map(s => [s.id, s.name]) }, { k: 'staffId', label: 'Staff', num: true, opt: true, options: staff.map(s => [s.id, s.name]) }]} />,
  };
  return <><h1>Admin panel</h1><div className="tabs" role="tablist">{Object.keys(tabs).map(t => <button key={t} role="tab" aria-selected={t === tab} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>{tabs[tab]}</>;
}
