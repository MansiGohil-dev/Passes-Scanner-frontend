import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Invalid email format');
      return;
    }
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // sessionStorage.setItem('team420', 'true');
        navigate('/admin-dashboard');
      } else {
        setError(res.status === 401 ? 'Invalid email or password' : data.message || 'Login failed');
      }
    } catch {
      setError('Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-pink-300 to-purple-400">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-tight">Admin Login</h2>
        {error && <p className="text-red-500 text-center mb-4 text-sm font-medium">{error}</p>}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="login-email" className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 bg-white/90 placeholder-gray-400"
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 bg-white/90 placeholder-gray-400"
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          <button
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold shadow-md hover:from-pink-500 hover:to-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed text-lg mt-2"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
