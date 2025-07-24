import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import 'webrtc-adapter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Scan Result Component for the new page
function ScanResult() {
  const navigate = useNavigate();
  const location = useLocation(); // Import from react-router-dom
  const { state } = location;
  const scanResult = state?.scanResult;
  const modalMessage = state?.modalMessage;

  const handleClose = () => {
    navigate('/scan'); // Return to scanner page
  };

  if (!scanResult && !modalMessage) {
    return <div>No result available. Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-200 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Scan Result</h2>
        {scanResult && scanResult.expired ? (
          <>
            <div className="text-xl font-semibold mb-3">QR Expired</div>
            <div className="mb-3">This QR code has already been scanned.</div>
          </>
        ) : scanResult ? (
          <>
            <div className="mb-2"><span className="font-medium">User Name:</span> {scanResult.name || 'N/A'}</div>
            <div className="mb-2"><span className="font-medium">Access:</span> {scanResult.allowed ? 'Allowed' : 'Denied'}</div>
            {scanResult.message && <div className="mb-2">{scanResult.message}</div>}
          </>
        ) : (
          <div className="text-xl font-semibold mb-3">{modalMessage}</div>
        )}
        <button
          className="px-8 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          onClick={handleClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function ScanUserPass() {
  const [scannedQrs, setScannedQrs] = useState([]);
  const [token, setToken] = useState("");
  const [scanError, setScanError] = useState("");
  const [scanHistory, setScanHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [employeeMobile, setEmployeeMobile] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const navigate = useNavigate();

  const scannerRef = useRef(null);

  useEffect(() => {
    const mobile = sessionStorage.getItem('employeeMobile');
    const id = sessionStorage.getItem('employeeId');
    if (!mobile || !id) {
      navigate('/elogin');
    } else {
      setEmployeeMobile(mobile);
      setEmployeeId(id);
      setShowScanner(true); // Auto-open scanner after login
      initializeScanner();
    }
  }, [navigate]);

  const initializeScanner = () => {
    if (scannerRef.current) return;

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      async (decodedText) => {
        setToken(decodedText);
        if (scannedQrs.includes(decodedText)) {
          navigate('/scan-result', { state: { modalMessage: "QR Expired: This QR code has already been scanned." } });
          return;
        }

        const match = decodedText.match(/shared-pass\/(\w+)/);
        if (match) {
          const passId = match[1];
          try {
            const response = await axios.post(`${API_BASE_URL}/api/passes/shared/${passId}/scan`, {
              employeeId: sessionStorage.getItem('employeeId'),
              mobile: sessionStorage.getItem('employeeMobile')
            });
            const { name, message: backendMessage, allowed } = response.data;
            const result = { name: name || "N/A", allowed, message: backendMessage || (allowed ? "Entry allowed" : "Access Denied") };
            setScanResult(result);
            setScannedQrs(prev => [...prev, decodedText]);
            setScanHistory(prev => {
              if (prev.some(item => item.qr === decodedText)) return prev;
              return [{
                time: new Date().toLocaleTimeString(),
                qr: decodedText,
                userName: result.name,
                status: result.allowed ? "Allowed" : "Denied",
                message: result.message,
                error: ""
              }, ...prev];
            });
            navigate('/scan-result', { state: { scanResult: result } });
          } catch (err) {
            const error = err.response?.data?.message || "Access Denied";
            navigate('/scan-result', { state: { modalMessage: error } });
            setScanError(error);
            setScanHistory(prev => {
              if (prev.some(item => item.qr === decodedText)) return prev;
              return [{
                time: new Date().toLocaleTimeString(),
                qr: decodedText,
                userName: "N/A",
                status: "Denied",
                message: "",
                error
              }, ...prev];
            });
          }
        } else {
          navigate('/scan-result', { state: { modalMessage: "Invalid QR code format." } });
          setScanError("Invalid QR code format.");
          setScanHistory(prev => [{
            time: new Date().toLocaleTimeString(),
            qr: decodedText,
            userName: "N/A",
            status: "Denied",
            message: "",
            error: "Invalid QR code format."
          }, ...prev]);
        }
        if (scannerRef.current) scannerRef.current.clear();
      },
      (errorMessage) => {
        setCameraError(`Camera error: ${errorMessage}`);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        alert('QR code detected in image! Please manually enter the token from the QR code.');
        setCameraError('Image uploaded successfully. Please enter the token manually.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setScanError("");
    setScanResult(null);
    if (!token) {
      setScanError("Enter or scan a valid token");
      return;
    }
    setScanning(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/passes/shared/${token}/scan`, {
        employeeId: sessionStorage.getItem('employeeId'),
        mobile: sessionStorage.getItem('employeeMobile')
      });
      navigate('/scan-result', { state: { scanResult: res.data } });
    } catch (err) {
      navigate('/scan-result', { state: { modalMessage: err.response?.data?.message || "Access Denied" } });
      setScanError(err.response?.data?.message || "Access Denied");
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-200 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Employee Pass Scanner</h2>
        <div id="reader" className="w-[300px] mx-auto mb-4" style={{ minHeight: '300px' }}></div>
        {cameraError && <div className="text-red-600 mt-2">{cameraError}</div>}
        <div className="mb-4">
          <div className="flex flex-col gap-2 mb-3">
            <button
              onClick={async () => {
                if (!showScanner) {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    stream.getTracks().forEach(track => track.stop());
                    setCameraReady(true);
                    setCameraError('');
                    setShowScanner(true);
                  } catch (error) {
                    setCameraError(`Camera error: ${error.message}`);
                    setCameraReady(false);
                  }
                } else {
                  setShowScanner(false);
                  setCameraReady(false);
                }
                setShowImageUpload(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showScanner ? 'Close Camera Scanner' : 'Open Camera Scanner'}
            </button>
            <button
              onClick={() => {
                setShowImageUpload(!showImageUpload);
                setShowScanner(false);
                setCameraError("");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showImageUpload ? 'Close Photo Upload' : 'Take Photo / Upload Image'}
            </button>
          </div>
          {showScanner && cameraReady && (
            <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg mb-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🟢 Camera Active - Ready to Scan
                </div>
              </div>
              <div className="text-xs text-green-600 mt-2 text-center font-medium">
                📱 Point your camera at the QR code to scan
              </div>
            </div>
          )}
          {showImageUpload && (
            <div className="border-2 border-dashed border-green-300 p-4 rounded-lg mb-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
          )}
          <div className="text-sm text-gray-600 mt-2 text-center">
            {showScanner ? 'Camera scanner is active' : showImageUpload ? 'Image upload is ready' : 'Choose a scanning method or enter token manually below'}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            placeholder="Paste or scan user QR token"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-2"
            maxLength={64}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
            type="submit"
            disabled={scanning}
          >
            {scanning ? "Checking..." : "Check Pass"}
          </button>
          {scanError && <div className="text-red-600 mt-2">{scanError}</div>}
        </form>
        {scanHistory.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Scan History</h3>
            <ul className="list-none p-0">
              {scanHistory.map((entry, idx) => (
                <li key={idx} className={`p-2 mb-2 rounded ${entry.status === 'Allowed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>{entry.time}:</strong> {entry.status === 'Allowed' ? 'Access Allowed' : 'Access Denied'}
                  <br />User Name: <span className="font-medium">{entry.userName}</span>
                  <br />QR: <span className="text-gray-600 text-sm">{entry.qr}</span>
                  {entry.error && <div className="text-orange-600 text-sm">{entry.error}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanUserPass;