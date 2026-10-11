import { useEffect, useRef, useState } from 'react';
import { errMsg } from './api';
export const Alert = ({ bad, ok, info }) => (bad || ok || info) ? <div className={'alert ' + (bad ? 'bad' : ok ? 'ok' : 'info')} role="alert">{bad || ok || info}</div> : null;
export const Stat = ({ label, value }) => <div className="stat"><div className="statv">{value ?? '-'}</div><div className="muted">{label}</div></div>;
export const Badge = ({ s }) => <span className={'badge ' + String(s).toLowerCase()}>{String(s)}</span>;
export const fmt = d => d ? new Date(d).toLocaleString() : '-';
/** Loads data now and re-loads every `ms` milliseconds. Returns [data, error, reload]. */
export function usePoll(fn, ms = 5000) {
  const [data, setData] = useState(null), [err, setErr] = useState(''), f = useRef(fn); f.current = fn;
  const reload = () => f.current().then(d => { setData(d); setErr(''); }).catch(e => setErr(errMsg(e)));
  useEffect(() => { reload(); const id = setInterval(reload, ms); return () => clearInterval(id); }, []);
  return [data, err, reload];
}
