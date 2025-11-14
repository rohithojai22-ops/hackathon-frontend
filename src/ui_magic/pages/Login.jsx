import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role || 'team');
        setMsg('✅ Logged in successfully!');
        navigate(data.role === 'admin' ? '/superadmin' : '/dashboard');
      } else {
        setMsg('Unexpected response from server.');
      }
    } catch (e) {
      setMsg(e?.response?.data?.message || '❌ Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Login</h2>
        {msg && <div className={msg.includes('✅') ? 'ok' : 'error'}>{msg}</div>}

        <form onSubmit={submit} className="grid gap">
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
          />
          <button className="btn primary" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
