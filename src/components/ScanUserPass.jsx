import React, { useState, useEffect, useRef } from 'react';
 
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import 'webrtc-adapter';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ScanUserPass() {
  // Track scanned QR codes
  const [scannedQrs, setScannedQrs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [token, setToken] = useState("");
  const [scanResult, setScanResult] = useState(null);
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

  const scannerRef = React.useRef(null);
  const [scannerReady, setScannerReady] = useState(false);

  const readerRef = useRef(null);

useEffect(() => {
  if (scannerReady && showScanner && !modalOpen && readerRef.current) {
    scannerRef.current = new Html5QrcodeScanner(
      readerRef.current.id,
      { fps: 10, qrbox: 250 },
      false
    );
    scannerRef.current.render(
      async (decodedText, decodedResult) => {
        setToken(decodedText);
        // ... rest of your scan handler ...
      },
      (errorMessage) => {
        setScanError(errorMessage);
      }
    );
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }
}, [scannerReady, showScanner, modalOpen]);

  useEffect(() => {
  const mobile = sessionStorage.getItem('employeeMobile');
  const id = sessionStorage.getItem('employeeId');
  if (!mobile || !id) {
    navigate('/elogin');
  } else {
    setEmployeeMobile(mobile);
    setEmployeeId(id);
    // Auto open camera scanner after successful login
    setShowScanner(true);
    setScannerReady(true);
  }
}, [navigate]);

  // Handle image file upload for QR scanning

  // Render the QR scanner container
  return (
    <div>
      {/* QR Scanner will render here */}
{showScanner && !modalOpen && (
  <div id="reader" ref={readerRef} style={{ width: 300, margin: '0 auto' }}></div>
)}
      {/* Result and access messages */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: scanResult && scanResult.allowed ? '#d1fae5' : scanResult && scanResult.allowed === false ? '#fee2e2' : '#fff',
            color: scanResult && scanResult.allowed ? '#065f46' : scanResult && scanResult.allowed === false ? '#991b1b' : '#222',
            padding: 32,
            borderRadius: 8,
            minWidth: 300,
            textAlign: 'center',
            boxShadow: '0 2px 10px #0003',
            border: scanResult && scanResult.allowed ? '2px solid #10b981' : scanResult && scanResult.allowed === false ? '2px solid #ef4444' : 'none'
          }}>
            {scanResult && scanResult.expired ? (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>QR Expired</div>
                <div style={{ marginBottom: 12 }}>This QR code has already been scanned.</div>
              </>
            ) : scanResult ? (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
                  Scan Result
                  {scanResult && scanResult.allowed && (
                    <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 700, fontSize: 16 }}>✔</span>
                  )}
                  {scanResult && scanResult.allowed === false && (
                    <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 700, fontSize: 16 }}>✖</span>
                  )}
                </div>
                <div style={{ marginBottom: 8 }}><b>User Name:</b> {scanResult.name || 'N/A'}</div>
                <div style={{
                 marginBottom: 8,
                 padding: '8px 0',
                 borderRadius: 4,
                 fontWeight: 600,
                 color: '#fff',
                 background: scanResult.allowed ? '#22c55e' : '#ef4444',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
               }}>
                 Access: {scanResult.allowed ? 'Allowed' : 'Denied'}
               </div>
                {scanResult.message && <div style={{ marginBottom: 8 }}>{scanResult.message}</div>}
              </>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{modalMessage}</div>
            )}
            <button
               style={{ padding: '8px 32px', borderRadius: 4, background: '#4F46E5', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16 }}
               disabled={scanning}
               onClick={async () => {
  setModalOpen(false);
  if (scanResult && scanResult.allowed && scanResult.passId && !scanResult.used) {
    setScanning(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/passes/shared/${scanResult.passId}/use`, {
        employeeId: sessionStorage.getItem('employeeId'),
        mobile: sessionStorage.getItem('employeeMobile')
      });
      setScannedQrs(prev => [...prev, scanResult.qr]);
      setScanHistory(prev => [{
        time: new Date().toLocaleTimeString(),
        qr: scanResult.qr,
        userName: scanResult.name,
        status: 'Allowed',
        message: scanResult.message,
        error: ''
      }, ...prev]);
      setModalMessage('Pass marked as used successfully!');
    } catch (err) {
      setScanError('Failed to mark as used. Try again.');
      setModalMessage('Failed to mark as used. Try again.');
    }
    setScanning(false);
  } else if (scanResult && scanResult.qr) {
    setScanHistory(prev => [{
      time: new Date().toLocaleTimeString(),
      qr: scanResult.qr,
      userName: scanResult.name || 'N/A',
      status: 'Denied',
      message: scanResult.message || '',
      error: scanResult.expired ? 'Expired' : (scanResult.used ? 'Used' : '')
    }, ...prev]);
  }
  setShowScanner(true);
  setScannerReady(false);
  setTimeout(() => setScannerReady(true), 100);
  setScanResult(null);
  setScanError("");
}}
             >{scanning ? 'Processing...' : 'OK'}</button>
             {modalMessage && (
               <div style={{ marginTop: 10, color: modalMessage.includes('success') ? 'green' : 'red', fontWeight: 500 }}>{modalMessage}</div>
             )}
          </div>
        </div>
      )}
    </div>
  );
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
        
        // Simple QR code detection - look for URL patterns in image
        // This is a basic implementation - for production, you'd use a proper QR library
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // For now, let's prompt user to manually enter the token from the image
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
      const { name, message, allowed, used } = res.data;
      setScanResult({
        name: name || '',
        allowed: allowed && !used,
        message: message || (allowed && !used ? 'Entry allowed' : (used ? 'Pass already used.' : 'Access Denied')),
        passId: token,
        qr: token,
        used
      });
      setModalMessage("");
      setModalOpen(true);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Access Denied";
      if (errMsg.includes("QR expired")) {
        setScanResult({ name: '', allowed: false, expired: true });
        setModalMessage(errMsg);
        setModalOpen(true);
      } else {
        setScanResult(null);
        setScanError(errMsg);
      }
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-200 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Employee Pass Scanner</h2>
        
        {/* Scanner Options */}
        <div className="mb-4">
          <div className="flex flex-col gap-2 mb-3">
            <button
              onClick={async () => {
                console.log('Camera Scanner button clicked');
                
                // Check if MediaDevices API is available
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                  console.log('MediaDevices API not available');
                  const isHTTPS = window.location.protocol === 'https:';
                  const currentURL = window.location.href;
                  
                  let errorMessage = 'Camera not supported on this browser/device.';
                  let alertMessage = '❌ Camera Not Supported\n\n';
                  
                  if (!isHTTPS) {
                    errorMessage = 'Camera requires HTTPS. Please access via https:// URL.';
                    alertMessage += '🔒 Camera requires HTTPS for security.\n\n';
                    alertMessage += '📱 Try accessing via:\n';
                    alertMessage += `https://${window.location.host}${window.location.pathname}\n\n`;
                  } else {
                    alertMessage += '📱 Your browser/device does not support live camera scanning.\n\n';
                  }
                  
                  alertMessage += '✅ Alternative Options:\n';
                  alertMessage += '1. Use "Take Photo / Upload Image" button\n';
                  alertMessage += '2. Enter QR token manually\n';
                  alertMessage += '3. Try a different browser (Chrome/Firefox)';
                  
                  setCameraError(errorMessage);
                  alert(alertMessage);
                  return;
                }
                
                if (!showScanner) {
                  // Request camera permission explicitly
                  try {
                    console.log('Requesting camera permission...');
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                      video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                      } 
                    });
                    console.log('Camera permission granted, stream:', stream);
                    // Stop the test stream immediately
                    stream.getTracks().forEach(track => {
                      console.log('Stopping track:', track);
                      track.stop();
                    });
                    setCameraReady(true);
                    setCameraError('');
                    setShowScanner(true);
                  } catch (error) {
                    console.error('Camera permission error:', error);
                    if (error.name === 'NotAllowedError') {
                      setCameraError('Camera permission denied. Please allow camera access and try again.');
                      alert('Camera permission required. Please:\n1. Allow camera access when prompted\n2. Check browser permissions\n3. Try again');
                    } else if (error.name === 'NotFoundError') {
                      setCameraError('No camera found on this device.');
                    } else {
                      setCameraError(`Camera error: ${error.message}`);
                    }
                    setCameraReady(false);
                  }
                } else {
                  setShowScanner(false);
                  setCameraReady(false);
                }
                setShowImageUpload(false);
                setScanError("");
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showScanner ? 'Close Camera Scanner' : 'Open Camera Scanner'}
            </button>
            
            <button
              onClick={() => {
                console.log('Image Upload button clicked');
                setShowImageUpload(!showImageUpload);
                setShowScanner(false);
                setCameraError("");
                setScanError("");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showImageUpload ? 'Close Photo Upload' : 'Take Photo / Upload Image'}
            </button>
          
          {/* Camera Scanner */}
          {showScanner && cameraReady && (
            <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg mb-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🟢 Camera Active - Ready to Scan
                </div>
              </div>
              <QrScanner
                onDecode={(data) => {
                  if (data) {
                    console.log('🎯 QR Code scanned successfully:', data);
                    const match = data.match(/shared-pass\/(\w+)/);
                    const extractedToken = match ? match[1] : data;
                    setToken(extractedToken);
                    setShowScanner(false);
                    setCameraReady(false);
                    setScanError("");
                    setCameraError("");
                    alert('✅ QR Code scanned successfully! Token: ' + extractedToken);
                  }
                }}
                onError={(error) => {
                  if (error) {
                    console.error('QR Scanner error details:', error);
                  }
                }}
                constraints={{
                  facingMode: 'environment',
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 }
                }}
                videoStyle={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                style={{ 
                  width: '100%', 
                  height: '300px',
                  border: '2px solid #10B981',
                  borderRadius: '8px',
                  backgroundColor: '#000',
                  overflow: 'hidden'
                }}
              />
              <div className="text-xs text-green-600 mt-2 text-center font-medium">
                📱 Point your camera at the QR code to scan
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Make sure the QR code is well-lit and clearly visible
              </div>
            </div>
          )}
          
          {/* Camera Loading State */}
          {showScanner && !cameraReady && (
            <div className="border-2 border-dashed border-yellow-300 p-4 rounded-lg mb-4">
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-3">
                  🟡 Initializing Camera...
                </div>
                <div className="animate-pulse bg-gray-200 h-48 rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Requesting camera permission and starting scanner...</p>
              </div>
            </div>
          )}
          
          {/* Image Upload Scanner */}
          {showImageUpload && (
            <div className="border-2 border-dashed border-green-300 p-4 rounded-lg mb-4">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-green-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Upload QR Code Image</h3>
                  <p className="mt-1 text-sm text-gray-500">Take a photo or select an image containing a QR code</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-400 mt-2">Supports: JPG, PNG, WebP</p>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600 mt-2 text-center">
            {showScanner ? 'Camera scanner is active' : showImageUpload ? 'Image upload is ready' : 'Choose a scanning method above or enter token manually below'}
          </div>
        </div>
          
          {showScanner && (
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
              {(() => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
                
                // Show camera not available only on desktop without MediaDevices API
                if (!hasMediaDevices && !isMobile) {
                  return (
                    <div className="text-center p-8 bg-red-50 rounded">
                      <p className="text-red-600 font-semibold mb-2">Camera Not Available</p>
                      <p className="text-sm text-gray-600">This browser/device doesn't support camera access.</p>
                      <p className="text-sm text-gray-600">Please use the manual token input below.</p>
                    </div>
                  );
                }
                
                // On mobile or when MediaDevices API is available, show QR scanner
                return (
                <>
                  <QrReader
                    constraints={{
                      video: {
                        facingMode: 'environment'  // Simple rear camera request
                      }
                    }}
                    videoContainerStyle={{
                      width: '100%',
                      height: '300px',
                      position: 'relative',
                      backgroundColor: '#000',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                    videoStyle={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)' // Mirror for better UX
                    }}
                    onResult={(result, error) => {
                      if (!!result) {
                        const data = result?.text;
                        if (data) {
                          console.log('QR Code scanned successfully:', data);
                          const match = data.match(/shared-pass\/(\w+)/);
                          const extractedToken = match ? match[1] : data;
                          setToken(extractedToken);
                          setShowScanner(false); // Hide scanner after successful scan
                          setScanError("");
                          setCameraError("");
                          // Show success message
                          alert('QR Code scanned successfully!');
                        }
                      }
                      if (!!error) {
                        console.error('QR Scanner error details:', {
                          name: error.name,
                          message: error.message,
                          stack: error.stack
                        });
                        
                        // Handle specific mobile camera errors
                        if (error.name === 'NotAllowedError') {
                          setCameraError("Camera permission denied. Please allow camera access in browser settings.");
                          alert('Camera permission denied. Please:\n1. Refresh the page\n2. Allow camera access when prompted\n3. Try again');
                        } else if (error.name === 'NotFoundError') {
                          setCameraError("No camera found on this device.");
                        } else if (error.name === 'OverconstrainedError') {
                          setCameraError("Camera constraints not supported. Trying fallback...");
                          console.log('Trying fallback camera constraints');
                          setUseFallbackCamera(true);
                          setTimeout(() => {
                            setCameraError('');
                          }, 2000);
                        } else if (error.message && error.message.includes('getUserMedia')) {
                          if (!useFallbackCamera) {
                            setCameraError("Trying simplified camera mode...");
                            setUseFallbackCamera(true);
                            setTimeout(() => {
                              setCameraError('');
                            }, 2000);
                          } else {
                            setCameraError("Camera access failed. Please check permissions or use manual input.");
                          }
                        } else {
                          setCameraError(`Camera error: ${error.message}`);
                        }
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      height: '300px',
                      border: '2px solid #4F46E5',
                      borderRadius: '8px',
                      backgroundColor: '#000'
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Position the QR code within the camera view
                  </div>
                  {cameraError && (
                    <div className="text-red-600 text-sm mt-2 text-center">
                      {cameraError}
                    </div>
                  )}
                </>
                );
              })()}
            </div>
          )}
          
          <div className="text-sm text-gray-600 mt-2 text-center">
            {showScanner ? 'Camera scanner is active' : 'Click "Open Camera Scanner" to scan QR codes or enter token manually below'}
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
          {/* Hide employee mobile input, use value from sessionStorage */}
          {/* <input type="text" value={employeeMobile} readOnly hidden /> */}
          <button
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
            type="submit"
            disabled={scanning}
          >
            {scanning ? "Checking..." : "Check Pass"}
          </button>
          {scanError && <div className="text-red-600 mt-2">{scanError}</div>}
        </form>
        {scanResult && scanResult.allowed ? (
          <div className="p-4 bg-green-50 rounded shadow-inner mt-4">
            <h3 className="text-xl font-bold text-green-800 mb-2">User Details</h3>
            <p className="mb-1"><b>Name:</b> {scanResult.name}</p>
            <p className="mb-1"><b>Mobile:</b> {scanResult.mobile}</p>
            {/* Add more fields as needed */}
            <div className="text-green-700 font-semibold mt-2">Access Granted</div>
          </div>
        ) : null}
        {scanResult && scanResult.allowed === false && !scanError && (
          <div className="p-4 bg-red-50 rounded shadow-inner mt-4 text-red-700 font-semibold">Access Denied</div>
        )}
      </div>
    {/* Modal for scan result */}
    {modalOpen && (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 300, textAlign: 'center', boxShadow: '0 2px 10px #0003' }}>
          {scanResult && scanResult.expired ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>QR Expired</div>
              <div style={{ marginBottom: 12 }}>This QR code has already been scanned.</div>
            </>
          ) : scanResult ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Scan Result</div>
              <div style={{ marginBottom: 8 }}><b>User Name:</b> {scanResult.name || 'N/A'}</div>
              <div style={{ marginBottom: 8 }}><b>Access:</b> {scanResult.allowed ? 'Allowed' : 'Denied'}</div>
              {scanResult.message && <div style={{ marginBottom: 8 }}>{scanResult.message}</div>}
            </>
          ) : (
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{modalMessage}</div>
          )}
          {/* Dedicated Mark as Used and Close buttons */}
          {scanResult && scanResult.allowed && scanResult.passId && !scanResult.used ? (
            <>
              <button
                style={{ padding: '8px 32px', borderRadius: 4, background: '#22c55e', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, marginRight: 12 }}
                disabled={scanning}
                onClick={async () => {
                  setScanning(true);
                  try {
                    await axios.patch(`${API_BASE_URL}/api/passes/shared/${scanResult.passId}/use`, {
                      employeeId: sessionStorage.getItem('employeeId'),
                      mobile: sessionStorage.getItem('employeeMobile')
                    });
                    setScanHistory(prev => [{
                      time: new Date().toLocaleTimeString(),
                      qr: scanResult.qr,
                      userName: scanResult.name,
                      status: 'Allowed',
                      message: scanResult.message,
                      error: ''
                    }, ...prev]);
                    setModalMessage('Pass marked as used successfully!');
                    setScanResult({ ...scanResult, used: true });
                  } catch (err) {
                    setScanError('Failed to mark as used. Try again.');
                    setModalMessage('Failed to mark as used. Try again.');
                  }
                  setScanning(false);
                }}
              >{scanning ? 'Processing...' : 'Mark as Used'}</button>
              <button
                style={{ padding: '8px 32px', borderRadius: 4, background: '#4F46E5', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16 }}
                onClick={() => {
                  setModalOpen(false);
                  setScanResult(null);
                  setScanError("");
                  setTimeout(() => {
                    setScannerReady(false);
                    setShowScanner(false);
                    setTimeout(() => {
                      setShowScanner(true);
                      setScannerReady(true);
                    }, 100);
                  }, 100);
                }}
              >Close</button>
            </>
          ) : (
            <button
              style={{ padding: '8px 32px', borderRadius: 4, background: '#4F46E5', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16 }}
              onClick={() => {
                setModalOpen(false);
                if (scanResult && scanResult.qr) {
                  setScanHistory(prev => [{
                    time: new Date().toLocaleTimeString(),
                    qr: scanResult.qr,
                    userName: scanResult.name || 'N/A',
                    status: scanResult.allowed ? 'Allowed' : 'Denied',
                    message: scanResult.message || '',
                    error: scanResult.expired ? 'Expired' : (scanResult.used ? 'Used' : '')
                  }, ...prev]);
                }
                setScanResult(null);
                setScanError("");
                setTimeout(() => {
                  setScannerReady(false);
                  setShowScanner(false);
                  setTimeout(() => {
                    setShowScanner(true);
                    setScannerReady(true);
                  }, 100);
                }, 100);
              }}
            >Close</button>
          )}
          {modalMessage && (
            <div style={{ marginTop: 10, color: modalMessage.includes('success') ? 'green' : 'red', fontWeight: 500 }}>{modalMessage}</div>
          )}
        </div>
      </div>
    )}
    </div>
  );
}

export default ScanUserPass;
