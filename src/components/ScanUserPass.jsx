import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import 'webrtc-adapter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ScanUserPass() {
  const [scannedQrs, setScannedQrs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [token, setToken] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [employeeMobile, setEmployeeMobile] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    const mobile = sessionStorage.getItem('employeeMobile');
    const id = sessionStorage.getItem('employeeId');
    if (!mobile || !id) {
      navigate('/elogin');
    } else {
      setEmployeeMobile(mobile);
      setEmployeeId(id);
      setScannerReady(true); // Auto-open scanner after login
    }
  }, [navigate]);

  useEffect(() => {
  if (!scannerReady || scannerRef.current) return;

  scannerRef.current = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: { width: 250, height: 250 } },
    false
  );

  scannerRef.current.render(
    async (decodedText) => {
      setToken(decodedText);
      if (scannedQrs.includes(decodedText)) {
        setModalMessage("QR Expired: This QR code has already been scanned.");
        setScanResult({ name: '', allowed: false, expired: true });
        setModalOpen(true);
        scannerRef.current.clear();
        setScannerReady(false);
        return;
      }

      const match = decodedText.match(/shared-pass\/(\w+)/);
      let userName = "N/A";
      let status = "Denied";
      let message = "";
      let error = "";

      if (match) {
        const passId = match[1];
        try {
          const response = await axios.post(`${API_BASE_URL}/api/passes/shared/${passId}/scan`, {
            employeeId: sessionStorage.getItem('employeeId'),
            mobile: sessionStorage.getItem('employeeMobile')
          });
          const { name, message: backendMessage, allowed } = response.data;
          userName = name || "N/A";
          status = allowed ? "Allowed" : "Denied";
          message = backendMessage || (allowed ? "Entry allowed" : "Access Denied");
          setScanResult({ name: userName, allowed, message });
          setModalMessage("");
          setModalOpen(true);
          setScannedQrs(prev => [...prev, decodedText]);
          scannerRef.current.clear();
          setScannerReady(false);
          setScanError("");
        } catch (err) {
          error = err.response?.data?.message || "Access Denied";
          setScanResult({ name: "N/A", allowed: false, message: error });
          setModalMessage("");
          setModalOpen(true);
          scannerRef.current.clear();
          setScannerReady(false);
          setScanError(error);
        }
      } else {
        error = "Invalid QR code format.";
        setScanResult(null);
        setScanError(error);
        setModalMessage(error);
        setModalOpen(true);
        scannerRef.current.clear();
        setScannerReady(false);
      }
    },
    (errorMessage) => {
      // Enhanced error handling for camera/video issues
      let userMessage = errorMessage;
      if (errorMessage.includes("NotReadableError")) {
        userMessage = "Camera could not be started. Please ensure no other app is using the camera and grant permission.";
      } else if (errorMessage.includes("NotAllowedError")) {
        userMessage = "Camera access was denied. Please allow camera permissions in your browser settings.";
      } else if (errorMessage.includes("OverconstrainedError")) {
        userMessage = "No suitable camera found on this device.";
      } else if (errorMessage.includes("NotFoundError")) {
        userMessage = "No camera device found. Please connect a camera and try again.";
      }
      setScanError(userMessage);
      setModalMessage(userMessage);
      setModalOpen(true);
      setScannerReady(false);
    }
  );

  return () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };
}, [scannerReady, scannedQrs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setScanError("");
    setScanResult(null);
    if (!token) {
      setScanError("Enter or scan a valid token");
      setModalMessage("Enter or scan a valid token");
      setModalOpen(true);
      return;
    }
    setScanning(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/passes/shared/${token}/scan`, {
        employeeId: sessionStorage.getItem('employeeId'),
        mobile: sessionStorage.getItem('employeeMobile')
      });
      setScanResult(res.data);
      setModalOpen(true);
    } catch (err) {
      setScanResult(null);
      setScanError(err.response?.data?.message || "Access Denied");
      setModalMessage(err.response?.data?.message || "Access Denied");
      setModalOpen(true);
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-200 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Employee Pass Scanner</h2>
        <div id="reader" className="w-[300px] mx-auto mb-4"></div>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            placeholder="Paste or scan user QR token"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            maxLength={64}
          />
          <button
            className={`bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={scanning}
          >
            {scanning ? "Checking..." : "Check Pass"}
          </button>
          {scanError && <div className="text-red-600 mt-2 text-sm">{scanError}</div>}
        </form>
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
            <div className="bg-white p-8 rounded-lg min-w-[300px] text-center shadow-lg">
              {scanResult && scanResult.expired ? (
                <>
                  <div className="text-xl font-semibold mb-3">QR Expired</div>
                  <div className="mb-3">This QR code has already been scanned.</div>
                </>
              ) : scanResult ? (
                <>
                  <div className="text-xl font-semibold mb-3">Scan Result</div>
                  <div className="mb-2"><span className="font-medium">User Name:</span> {scanResult.name || 'N/A'}</div>
                  <div className="mb-2"><span className="font-medium">Access:</span> {scanResult.allowed ? 'Allowed' : 'Denied'}</div>
                  {scanResult.message && <div className="mb-2">{scanResult.message}</div>}
                </>
              ) : (
                <div className="text-xl font-semibold mb-3">{modalMessage}</div>
              )}
              <button
                className="px-8 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                onClick={() => {
                  setModalOpen(false);
                  setScannerReady(true);
                  setScanResult(null);
                  setScanError("");
                  setModalMessage("");
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanUserPass;