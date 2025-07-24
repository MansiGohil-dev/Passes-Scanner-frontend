import React, { useState } from 'react';

function AdminForm({ team420 }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    const res = await fetch(`${API_BASE_URL}/api/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, team420 }),
    });
    if (res.ok) {
      setMsg('Admin registered!');
      setEmail('');
      setPassword('');
      window.dispatchEvent(new Event('admin-updated'));
    } else {
      const data = await res.json();
      setMsg(data.message || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">Register Admin</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Register</button>
      {msg && <div className="mt-3 text-center text-green-600 font-semibold">{msg}</div>}
    </form>
  );
}

export default AdminForm; 