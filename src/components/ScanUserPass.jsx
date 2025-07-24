import { useState, useEffect, useRef } from 'react';
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
  const [cameraError, setCameraError] = useState("");
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    const mobile = sessionStorage.getItem('employeeMobile');
    const id = sessionStorage.getItem('employeeId');
    if (!mobile || !id) {
      navigate('/elogin');
    } else {
      setEmployeeMobile(mobile);
      setEmployeeId(id);
      initializeScanner(); // Auto-open scanner after login
    }
  }, [navigate]);

  const initializeScanner = () => {
    if (scannerRef.current) return;

    // Ensure the reader div is in the DOM and visible before initializing
    if (!readerRef.current) {
      setCameraError("Scanner container not found. Please refresh the page.");
      return;
    }

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      async (decodedText) => {
        setToken(decodedText);
        if (scannedQrs.includes(decodedText)) {
          setModalMessage("QR Expired: This QR code has already been scanned.");
          setScanResult({ name: '', allowed: false, expired: true });
          setModalOpen(true);
          scannerRef.current.clear();
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
            setScanResult({ name: name || "N/A", allowed, message: backendMessage || (allowed ? "Entry allowed" : "Access Denied") });
            setModalOpen(true);
            setScannedQrs(prev => [...prev, decodedText]);
            scannerRef.current.clear();
            setScanError("");
          } catch (err) {
            const error = err.response?.data?.message || "Access Denied";
            setScanResult({ name: "N/A", allowed: false, message: error });
            setModalOpen(true);
            scannerRef.current.clear();
            setScanError(error);
          }
        } else {
          setScanError("Invalid QR code format.");
          setModalMessage("Invalid QR code format.");
          setModalOpen(true);
          scannerRef.current.clear();
        }
      },
      (errorMessage) => {
        setCameraError(`Camera error: ${errorMessage}`);
        if (errorMessage.includes("NotReadableError")) {
          setModalMessage("Could not start video source. Please request camera permissions.");
          setModalOpen(true);
        }
      }
    ).catch((err) => {
      setCameraError(`Failed to initialize scanner: ${err.message}`);
    });

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
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center" ref={readerRef}>
        <h2 className="text-2xl font-bold text-green-700 mb-4">Employee Pass Scanner</h2>
        <div id="reader" className="w-[300px] mx-auto mb-4" style={{ minHeight: '300px' }}></div>
        {cameraError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {cameraError}
            <button
              className="ml-2 text-blue-500 underline"
              onClick={() => {
                navigator.mediaDevices.getUserMedia({ video: true })
                  .then(() => {
                    setCameraError("");
                    initializeScanner();
                  })
                  .catch(err => setCameraError(`Permission denied: ${err.message}`));
              }}
            >
              Request Camera Permissions
            </button>
          </div>
        )}
        <div className="mb-4">
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
            onClick={handleSubmit}
            disabled={scanning}
          >
            {scanning ? "Checking..." : "Check Pass"}
          </button>
          {scanError && <div className="text-red-600 mt-2 text-sm">{scanError}</div>}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-4"
          />
        </div>
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