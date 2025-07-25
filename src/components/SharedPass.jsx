import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import ShareExtraPass from './ShareExtraPass';

function SharedPass() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientMobile, setRecipientMobile] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleShareClick = async () => {
    setOtpError("");
    setOtp("");
    setShowOtp(true);
    try {
      await axios.post(`${API_BASE_URL}/api/send-otp`, { mobile: info.mobile });
      setOtpSent(true);
    } catch {
      setOtpError("Failed to send OTP. Try again.");
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    setSuccessMsg("");
    if (loadingOtp) return;
    setLoadingOtp(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/verify-otp`, { mobile: info.mobile, otp });
      if (res.data.success) {
        setOtpVerified(true);
        setShowOtp(false);
        setSuccessMsg('OTP verified successfully!');
        // Strict WhatsApp mobile validation
        let cleanMobile = info.mobile.replace(/\D/g, ''); // Remove all non-digits
        if (cleanMobile.length === 10) {
          cleanMobile = '91' + cleanMobile;
        } else if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
          // already correct
        } else {
          alert('Invalid mobile number format for WhatsApp!\nIt must be a 10-digit Indian mobile or 12 digits starting with 91.');
          return;
        }
        // Log for debugging
        console.log('WhatsApp number being sent:', cleanMobile);
        // WhatsApp will still show an error if the number is not registered on WhatsApp, even if the format is correct.
        const websiteLink = `${window.location.origin}/#/shared-pass/${info.token}`;
        const message = `Here is your event pass: ${websiteLink}`;
        // Open WhatsApp Web (desktop) or WhatsApp app (mobile)
        const waUrl = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
          ? `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(message)}`
          : `https://web.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      } else {
        setOtpError("Invalid OTP");
      }
      setLoadingOtp(false);
    } catch {
      setOtpError("OTP verification failed.");
      setLoadingOtp(false);
    }
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/passes/shared/${token}`);
        setInfo(res.data);
      } catch (err) {
        setError("Invalid or expired link");
      }
      setLoading(false);
    };
    fetchInfo();
  }, [token, API_BASE_URL]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  // Handler for sharing pass (with name and mobile)
  const handleSharePass = async () => {
    setShareError("");
    setSuccessMsg("");
    if (shareLoading) return;
    if (!recipientName.trim()) {
      setShareError("Enter recipient name");
      return;
    }
    const cleanMobile = recipientMobile.replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanMobile)) {
      setShareError("Enter a valid 10-digit mobile number");
      return;
    }
    setShareLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/passes/share`, {
        mobile: cleanMobile,
        name: recipientName.trim(),
        count: 1,
        parentToken: token
      });
      if (res.data && res.data.tokens && res.data.tokens.length > 0) {
        setSuccessMsg("Pass shared successfully!");
        setRecipientName("");
        setRecipientMobile("");
      } else {
        setSuccessMsg("Pass shared!");
        setRecipientName("");
        setRecipientMobile("");
      }
    } catch (err) {
      setShareError(err.response?.data?.message || "Share failed");
    }
    setShareLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-200 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Your Passes</h2>
        {/* Pass Image */}
        {info.imageUrl && (
          <img
            src={`${API_BASE_URL.replace(/\/api.*/, '')}/${info.imageUrl.replace(/\\/g, '/')}`}
            alt="Pass"
            className="mx-auto mb-4 rounded shadow max-h-48"
          />
        )}
        <div className="mb-4 flex flex-col items-center">
          <span className="font-semibold text-gray-700 mb-1">Your Pass</span>
          <QRCodeSVG
            value={`${window.location.origin}/#/shared-pass/${info.token}`}
            size={150}
            className="mx-auto mb-2"
          />
        </div>
        <div className="mb-2 text-lg">Name: <span className="font-bold">{info.name}</span></div>
        <div className="mb-2 text-lg">Mobile: <span className="font-mono">{info.mobile}</span></div>
        <div className="mb-2 text-lg">Number of Passes: <span className="font-bold">{info.count}</span></div>
        <div className="mb-2 text-lg">Passes you can share: <span className="font-bold">{info.remaining}</span></div>
        {/* Section for sharing extra passes */}
        {info.remaining > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-inner">
            <ShareExtraPass token={info.token} total={info.count} remaining={info.remaining} />
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4">Show this QR code at the event or to the admin for verification. Share extra passes with others using the copy button.</p>
      </div>
      {/* OTP Modal */}
      {showOtp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h3 className="mb-2 text-lg font-bold">Enter OTP sent to {info.mobile}</h3>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => { setOtp(e.target.value); setOtpError(""); setSuccessMsg(""); setLoadingOtp(false); }}
              className="border px-2 py-1 rounded"
              maxLength={6}
            />
            <button
              className={`bg-blue-600 text-white px-4 py-2 rounded ml-2 ${loadingOtp ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleVerifyOtp}
              disabled={loadingOtp}
            >
              {loadingOtp ? 'Verifying...' : 'Verify'}
            </button>
            <button onClick={() => setShowOtp(false)} className="ml-2 px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
            {otpError && <div className="text-red-600 mt-2">{otpError}</div>}
            {!otpSent && <div className="text-gray-500 mt-2">Sending OTP...</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedPass;