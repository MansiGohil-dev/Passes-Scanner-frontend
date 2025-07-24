import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * ShareExtraPass
 * Props:
 *   token: main pass token
 *   total: number of extra passes to share
 *
 * Allows user to enter a friend's mobile number, generates a unique share link and QR for each friend.
 */
function ShareExtraPass({ token, total, remaining }) {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [sharedLinks, setSharedLinks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [numPasses, setNumPasses] = useState(1);

  // Use backend API base URL
  const API_BASE_URL = 'http://192.168.1.12:5000';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/employees`).then(res => res.json()).then(() => {}).catch(() => {});
  }, []);

  // Share pass via backend, send WhatsApp
  const handleShare = async () => {
    setError('');
    setSuccessMsg('');
    if (loading) return;
    setLoading(true);
    if (!name.trim()) {
      setError('Enter recipient name');
      setLoading(false);
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanMobile)) {
      setError('Enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }
    if (!numPasses || isNaN(numPasses) || numPasses < 1) {
      setError('Enter a valid number of passes (at least 1)');
      setLoading(false);
      return;
    }
    // Only allow sharing up to total passes
    if (numPasses > remaining) {
      setError(`You can only share up to ${remaining} pass${remaining === 1 ? '' : 'es'}.`);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/passes/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile, name: name.trim(), count: numPasses, parentToken: token })
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid server response');
      }
      if (!res.ok) throw new Error(data.message || 'Share failed');
      // Backend may return token or tokens (array)
      let links = [];
      if (data.token) {
        links = [`${window.location.origin}/#/scan-pass/${data.token}`];
      } else if (data.tokens && Array.isArray(data.tokens)) {
        links = data.tokens.map(token => `${window.location.origin}/#/scan-pass/${token}`);
      } else {
        setError('No valid pass link received from server.');
        setLoading(false);
        return;
      }
      // Add all links to sharedLinks state
      setSharedLinks([...sharedLinks, ...links.map(link => ({ mobile: cleanMobile, link }))]);
      setMobile('');
      setName('');
      setNumPasses(1);
      setSuccessMsg('Pass shared successfully!');
      // Open WhatsApp for each link
      let waMobile = cleanMobile;
      if (waMobile.startsWith('+91')) waMobile = waMobile.slice(1);
      else if (waMobile.startsWith('91')) waMobile = waMobile;
      else if (waMobile.length === 10) waMobile = '91' + waMobile;
      links.forEach(link => {
        const waUrl =
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            ? `https://api.whatsapp.com/send?phone=${waMobile}&text=${encodeURIComponent('Here is your event pass: ' + link)}`
            : `https://web.whatsapp.com/send?phone=${waMobile}&text=${encodeURIComponent('Here is your event pass: ' + link)}`;
        window.open(waUrl, '_blank');
      });
    } catch (err) {
      setError(err.message || 'Share failed');
      setLoading(false);
    }
  };

  const canShare = total > 0 && sharedLinks.length < total;

  return (
    <div>
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-bold text-green-700 mb-4 text-center">Share Extra Passes</h2>
        <div className="flex flex-col md:flex-row md:justify-between mb-3 text-center md:text-left">
          {/* <div className="text-gray-700 text-base md:text-lg font-semibold">Number of Passes: <span className="font-bold">{total + 1}</span></div> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Recipient Name</label>
            <input
              type="text"
              placeholder="Enter recipient name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-green-300"
              maxLength={30}
            />
          </div>
          {/* <div className="mb-2 text-green-800 text-sm font-semibold">All employees can scan all passes by default.</div> */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Friend's Mobile</label>
            <input
              type="text"
              placeholder="10-digit mobile"
              value={mobile}
              onChange={e => { setMobile(e.target.value); setError(''); setSuccessMsg(''); setLoading(false); }}
              className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-green-300"
              maxLength={13}
            />
          </div>
        </div>
        <div className="flex items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Number of Passes</label>
            <input
              type="number"
              min={1}
              max={remaining}
              placeholder="How many passes?"
              value={numPasses}
              onChange={e => setNumPasses(Number(e.target.value))}
              className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-green-300"

            />
          </div>
          <button
            className={`bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handleShare}
            disabled={loading}
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mb-2 text-center font-semibold">{error}</div>}
        {successMsg && <div className="text-green-600 text-sm mb-2 text-center font-semibold">{successMsg}</div>}

      </div>
      {/* List of shared links with QR codes */}
      {sharedLinks.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg shadow-inner p-4">
          <h3 className="text-lg font-bold text-green-800 mb-2">Shared Passes</h3>
          <ul className="space-y-4">
            {sharedLinks.map((item, idx) => (
              <li key={idx} className="flex items-center gap-4 bg-white p-3 rounded shadow">
                <QRCodeSVG value={item.link} size={64} className="border rounded" />
                <div>
                  <div className="font-mono text-blue-700 text-sm">{item.link}</div>
                  <div className="text-gray-700 text-xs">Mobile: {item.mobile}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ShareExtraPass;
