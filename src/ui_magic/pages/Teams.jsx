import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Teams() {
  const [count, setCount] = useState(null);
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [inst, setInst] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/teams');
      setList(data);
      try {
        const c = await api.get('/api/teams/count');
        setCount(c.data.total);
      } catch {
        setCount('admin only');
      }
    } catch {
      setMsg('Failed to load teams');
    }
  };

  useEffect(() => { load(); }, []);

  const createTeam = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/teams', { name, institute: inst });
      setMsg(`✅ Team created: ${data.name} (code: ${data.code})`);
      setName('');
      setInst('');
      load();
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const join = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      await api.post('/api/teams/join', { code });
      setMsg('✅ Joined team successfully!');
      setCode('');
      load();
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Join failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Teams Management</h2>
        <p className="muted">Create or join a team for the Hackathon.</p>

        <div className="mt">Total teams: <b>{count === null ? '…' : count}</b></div>

        {msg && (
          <div className={msg.startsWith('✅') ? 'ok' : 'error'}>{msg}</div>
        )}

        <section className="mt">
          <h3>Create Team</h3>
          <form onSubmit={createTeam} className="grid gap">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
              required
            />
            <input
              className="input"
              value={inst}
              onChange={(e) => setInst(e.target.value)}
              placeholder="Institute (optional)"
            />
            <button className="btn primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Team'}
            </button>
          </form>
        </section>

        <section className="mt">
          <h3>Join Team</h3>
          <form onSubmit={join} className="grid gap">
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. T-CW1234"
              required
            />
            <button className="btn" disabled={loading}>
              {loading ? 'Joining…' : 'Join'}
            </button>
          </form>
        </section>

        <section className="mt">
          <h3>All Teams</h3>
          {list.length === 0 && <p className="muted">No teams yet.</p>}
          <ul className="list small">
            {list.map((t) => (
              <li key={t._id}>
                <b>{t.name}</b> — {t.institute || 'n/a'} <br />
                <span className="muted small">
                  Status: {t.status || 'active'} • Code: {t.code}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
