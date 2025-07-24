import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

/**
 * ScanPass UI: Allows an employee to enter their mobile and a pass token to validate scanning.
 * Shows access denied if not an employee, or success if allowed.
 * Intended for use at event entry or by scanning QR and entering mobile.
 */
function ScanPass() {
  const { token: tokenFromUrl } = useParams();
  const [mobile, setMobile] = useState('');
  const [token, setToken] = useState(tokenFromUrl || '');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  const handleScan = async (e) => {
    e.preventDefault();
    setResult('');
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/passes/shared/${token}/scan`, { mobile });
      setResult(res.data.message || 'Entry allowed');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Access Denied: You are not authorized to scan this pass.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Scan failed.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Scan Pass QR</h2>
        <form onSubmit={handleScan} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            maxLength={15}
            required
          />
          <input
            type="text"
            placeholder="Enter pass token (from QR)"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full font-semibold"
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Scan & Validate'}
          </button>
        </form>
        {result && <div className="mt-4 text-green-700 font-bold">{result}</div>}
        {error && <div className="mt-4 text-red-600 font-bold">{error}</div>}
        <div className="mt-6 text-xs text-gray-500">
          Employees: Enter your mobile and scan or paste the pass token from the QR code. Only authorized employees will be allowed.
        </div>
      </div>
    </div>
  );
}

export default ScanPass;
