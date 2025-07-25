// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import AdminSalesTable from './AdminSalesTable';


// function AdminDashboardPage() {
//   const [showUserTable, setShowUserTable] = useState(false);
//   const openUserTable = () => setShowUserTable(true);
//   const closeUserTable = () => setShowUserTable(false);

//   const [summary, setSummary] = useState({ total: 0, available: 0, sold: 0 });
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState('');
//   const [count, setCount] = useState('');
//   const [currentPass, setCurrentPass] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [message, setMessage] = useState('');
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [shareMobile, setShareMobile] = useState("");
//   const [shareName, setShareName] = useState("");
//   const [shareCount, setShareCount] = useState(1);
//   const [shareMessage, setShareMessage] = useState("");
//   const [whatsAppLink, setWhatsAppLink] = useState("");
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [pendingShare, setPendingShare] = useState(null);
//   const [demoOtp, setDemoOtp] = useState("");
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   // Fetch current pass and summary on mount
//   useEffect(() => {
//     fetchCurrentPass();
//     fetchSummary();
//   }, []);

//   const fetchSummary = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/passes/summary`);
//       setSummary(res.data);

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   setImage(file);
  //   setImagePreview(URL.createObjectURL(file));
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setMessage('');
  //   const formData = new FormData();
  //   formData.append('count', count);
  //   if (image) formData.append('image', image);
//       setCurrentPass(res.data);
//       setCount(res.data.count);
//       setImagePreview(getImageUrl(res.data.imageUrl));
//       setLoading(false);
//     } catch (err) {
//       setCurrentPass(null);
//       setLoading(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setImage(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');
//     const formData = new FormData();
//     formData.append('count', count);
//     if (image) formData.append('image', image);

//     try {
//       let res;
//       if (currentPass && editMode) {
//         res = await axios.put(`${API_BASE_URL}/api/passes`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       } else {
//         res = await axios.post(`${API_BASE_URL}/api/passes`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }
//       setMessage('Pass saved!');
//       setEditMode(false);
//       fetchCurrentPass();
//     } catch (err) {
//       setMessage('Error saving pass');
//     }
//     setLoading(false);
//   };

//   const handleEdit = () => {
//     setEditMode(true);
//     setImage(null);
//     setMessage('');
//     if (currentPass) {
//       setCount(currentPass.count);
//       setImagePreview(getImageUrl(currentPass.imageUrl)); // Use the helper here!
//     }
//   };

//   const handleShare = async (e) => {
//     e.preventDefault();
//     setShareMessage("");
//     if (!shareName.trim()) {
//       setShareMessage("Recipient name is required.");
//       return;
//     }
//     if (!/^\d{10,15}$/.test(shareMobile.replace(/\D/g, ''))) {
//       setShareMessage("Enter a valid mobile number.");
//       return;
//     }
//     // Store pending share data and show OTP modal
//     setPendingShare({ mobile: shareMobile, name: shareName, count: shareCount });
//     setShowShareModal(false);
//     setShowOtpModal(true);
//     setOtpSent(false);
//     setOtp("");
//     setOtpError("");
//     // Send OTP
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/passes/send-otp`, { mobile: shareMobile });
//       setOtpSent(true);
//       if (response.data.demo || response.data.smsError || response.data.otp) {
//         setIsDemoMode(true);
//         setDemoOtp(response.data.otp || "");
//       } else {
//         setIsDemoMode(false);
//         setDemoOtp("");
//       }
//     } catch (err) {
//       setOtpError("Failed to send OTP. Please try again.");
//     }
//   };

//   const handleVerifyOtp = async () => {
//     setOtpError("");
//     try {
//       const verifyRes = await axios.post(`${API_BASE_URL}/api/passes/verify-otp`, {
//         mobile: pendingShare.mobile,
//         otp
//       });
//       if (verifyRes.data.success) {
//         // OTP verified, now share the pass
//         const shareRes = await axios.post(`${API_BASE_URL}/api/passes/share`, {
//           mobile: pendingShare.mobile,
//           name: pendingShare.name,
//           count: pendingShare.count,
//         });
//         // Generate WhatsApp link
//         const shareUrl = `${window.location.origin}/#/shared-pass/${shareRes.data.token}`;
//         // Ensure mobile is in E.164 format (no +, just country code and number)
//         let cleanMobile = pendingShare.mobile.replace(/\D/g, '');
//         if (cleanMobile.length === 10) {
//           cleanMobile = '91' + cleanMobile;
//         } else if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
//           // already correct
//         } else {
//           alert('Invalid mobile number format for WhatsApp!');
//           return;
//         }
//         // WhatsApp message with plain link
//         const message = `You have been shared ${pendingShare.count} pass(es)! Click here to view your pass: ${shareUrl}`;
//         const waLink = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
//         // Open WhatsApp directly
//         window.open(waLink, '_blank');
//         setShareMessage(shareRes.data.message);
//         setShowOtpModal(false);
//         setShareMobile("");
//         setShareName("");
//         setShareCount(1);
//         setPendingShare(null);
//         fetchCurrentPass();
//       } else {
//         setOtpError("Invalid OTP");
//       }
//     } catch (err) {
//       setOtpError(err.response?.data?.message || "OTP verification failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
//       <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
//         <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Admin Dashboard</h2>
//         <div className="mb-4 text-center">
//           <p><b>Total Passes:</b> {summary.total}</p>
//           <p><b>Available Passes:</b> {summary.available}</p>
//           <p><b>Sold Passes:</b> {summary.sold}</p>
//         </div>
//         {loading && <p className="text-blue-500 text-center">Loading...</p>}
//         {currentPass && !editMode && (
//           <div className="mb-6 text-center">
//             <h3 className="text-xl font-semibold mb-2">Current Pass</h3>
//             <img
//               src={getImageUrl(currentPass.imageUrl)}
//               alt="Pass"
//               className="mx-auto mb-4 rounded shadow max-h-48"
//             />
//             <p className="mb-2">Available Passes: <span className="font-bold">{currentPass.count}</span></p>
//             <button
//               onClick={handleEdit}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition mr-2"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => setShowShareModal(true)}
//               className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
//             >
//               Share Pass
//             </button>
//           </div>
//         )}

//         {(editMode || !currentPass) && (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block font-medium mb-1">Pass Image:</label>
//               <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
//               {imagePreview && (
//                 <img
//                   src={imagePreview}
//                   alt="Preview"
//                   className="mt-3 rounded shadow max-h-40 mx-auto"
//                 />
//               )}
//             </div>
//             <div>
//               <label className="block font-medium mb-1">Number of Passes:</label>
//               <input
//                 type="number"
//                 value={count}
//                 min={1}
//                 onChange={(e) => setCount(e.target.value)}
//                 required
//                 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
//               />
//             </div>
//             <div className="flex gap-3 justify-center">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
//               >
//                 {currentPass ? 'Update Pass' : 'Create Pass'}
//               </button>
//               {currentPass && (
//                 <button
//                   type="button"
//                   onClick={() => setEditMode(false)}
//                   className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>
//         )}
//         {message && <p className="mt-4 text-center text-green-600 font-medium">{message}</p>}
//       </div>
//       {showShareModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
//             <h3 className="text-lg font-bold mb-4 text-center">Share Pass</h3>
//             <form onSubmit={handleShare} className="space-y-4">
//               <div>
//                 <label className="block mb-1 font-medium">Recipient Name</label>
//                 <input
//                   type="text"
//                   value={shareName}
//                   onChange={e => setShareName(e.target.value)}
//                   required
//                   maxLength={30}
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
//                   placeholder="Enter recipient name"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1 font-medium">Mobile Number</label>
//                 <input
//                   type="tel"
//                   value={shareMobile}
//                   onChange={e => setShareMobile(e.target.value)}
//                   required
//                   pattern="[0-9]{10,15}"
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
//                   placeholder="Enter mobile number"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1 font-medium">Number of Passes</label>
//                 <input
//                   type="number"
//                   value={shareCount}
//                   min={1}
//                   max={currentPass?.count || 1}
//                   onChange={e => setShareCount(e.target.value)}
//                   required
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
//                 />
//               </div>
//               <div className="flex gap-2 justify-center">
//                 <button
//                   type="submit"
//                   className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
//                 >
//                   Share
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowShareModal(false)}
//                   className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//             {shareMessage && <p className="mt-3 text-center text-red-600">{shareMessage}</p>}
//           </div>
//         </div>
//       )}
//       {showOtpModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
//             <h3 className="text-lg font-bold mb-4 text-center">Verify OTP</h3>
//             {otpSent ? (
//               <div className="space-y-4">
//                 <p className="text-sm text-gray-600 text-center">
//                   {isDemoMode ? (
//                     <>
//                       OTP sent to {pendingShare?.mobile}.<br/>
//                       {demoOtp && (
//                         <span className="font-bold text-green-600">
//                           Demo OTP: {demoOtp}
//                         </span>
//                       )}
//                     </>
//                   ) : (
//                     `OTP sent to ${pendingShare?.mobile} via SMS.`
//                   )}
//                 </p>
//                 <div>
//                   <label className="block mb-1 font-medium">Enter OTP</label>
//                   <input
//                     type="text"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     maxLength={6}
//                     className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
//                     placeholder="Enter 6-digit OTP"
//                   />
//                 </div>
//                 <div className="flex gap-2 justify-center">
//                   <button
//                     onClick={handleVerifyOtp}
//                     disabled={otp.length !== 6}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
//                   >
//                     Verify & Share
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowOtpModal(false);
//                       setPendingShare(null);
//                     }}
//                     className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//                 {otpError && <p className="mt-3 text-center text-red-600 text-sm">{otpError}</p>}
//               </div>
//             ) : (
//               <div className="text-center">
//                 <p className="text-gray-600 mb-4">Sending OTP...</p>
//                 <button
//                   onClick={() => {
//                     setShowOtpModal(false);
//                     setPendingShare(null);
//                   }}
//                   className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       <button
//         className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 mt-4"
//         onClick={openUserTable}
//       >
//         Show User Passes Detail
//       </button>

//       {showUserTable && (
//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
//           <div className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] relative">
//             <button
//               className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//               onClick={closeUserTable}
//             >
//               &times;
//             </button>
//             <h2 className="text-xl font-bold mb-4">All User Passes</h2>
//             <AdminSalesTable />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // --- Employee Management ---
// function EmployeeSection({ API_BASE_URL }) {
//   const [employees, setEmployees] = useState([]);
//   const [name, setName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [msg, setMsg] = useState("");
//   const [password, setPassword] = useState("");

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/employees`);
//       setEmployees(res.data);
//     } catch (err) {
//       setMsg("Failed to fetch employees");
//     }
//   };
//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setMsg("");
    
//     // Validation
//     if (!name.trim()) {
//       setMsg("Name is required");
//       return;
//     }
//     if (!mobile.trim()) {
//       setMsg("Mobile is required");
//       return;
//     }
//     if (!password.trim()) {
//       setMsg("Password is required");
//       return;
//     }
    
//     console.log('Creating employee with data:', { name, mobile, password: '***' });
    
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/employees`, { name, mobile, password });
//       console.log('Employee created successfully:', response.data);
//       setName(""); setMobile(""); setPassword(""); setMsg("Employee added successfully!");
//       fetchEmployees();
//     } catch (err) {
//       console.error('Error creating employee:', err.response?.data || err.message);
//       const errorMsg = err.response?.data?.message || "Failed to add employee";
//       setMsg(`Error: ${errorMsg}`);
//     }
//   };
//   return (
//     <div style={{border:'1px solid #ccc', padding:16, margin:'16px 0'}}>
//       <h3>Employees</h3>
//       <form onSubmit={handleCreate} style={{display:'flex',gap:8}}>
//         <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required />
//         <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile" required />
//         <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required type="password" />
//         <button type="submit">Add</button>
//       </form>
//       {msg && <div>{msg}</div>}
//       <ul>
//         {employees.map(emp => (
//           <li key={emp._id} style={{marginBottom: '8px', padding: '4px', border: '1px solid #eee'}}>
//             <strong>{emp.name}</strong> - {emp.mobile}
//             <br />
//             <small style={{color: emp.password ? 'green' : 'red'}}>
//               Password: {emp.password ? '✓ Stored' : '✗ Missing'}
//               {emp.password && ` (${emp.password.length} chars)`}
//             </small>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// // ...inside AdminDashboardPage render...
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// <EmployeeSection API_BASE_URL={API_BASE_URL} />

// export default AdminDashboardPage;


import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSalesTable from "./AdminSalesTable";

function AdminDashboardPage() {
  const [showUserTable, setShowUserTable] = useState(false);
  const [summary, setSummary] = useState({ total: 0, available: 0, sold: 0 });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [count, setCount] = useState("");
  const [currentPass, setCurrentPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMobile, setShareMobile] = useState("");
  const [shareName, setShareName] = useState("");
  const [shareCount, setShareCount] = useState(1);
  const [shareMessage, setShareMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [pendingShare, setPendingShare] = useState(null);
  const [demoOtp, setDemoOtp] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const openUserTable = () => setShowUserTable(true);
  const closeUserTable = () => setShowUserTable(false);

  useEffect(() => {
    fetchCurrentPass();
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/passes/summary`);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setMessage("Failed to fetch summary");
    }
  };

  const fetchCurrentPass = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/passes`);
      setCurrentPass(res.data);
      setCount(res.data.count);
      setImagePreview(getImageUrl(res.data.imageUrl));
    } catch (err) {
      console.error("Error fetching pass:", err);
      setCurrentPass(null);
      setMessage("Failed to fetch current pass");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("count", count);
    if (image) formData.append("image", image);

    try {
      let res;
      if (currentPass && editMode) {
        res = await axios.put(`${API_BASE_URL}/api/passes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(`${API_BASE_URL}/api/passes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setMessage("Pass saved successfully!");
      setEditMode(false);
      setImage(null);
      fetchCurrentPass();
    } catch (err) {
      console.error("Error saving pass:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Error saving pass");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setImage(null);
    setMessage("");
    if (currentPass) {
      setCount(currentPass.count);
      setImagePreview(getImageUrl(currentPass.imageUrl));
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareMessage("");
    if (!shareName.trim()) {
      setShareMessage("Recipient name is required.");
      return;
    }
    if (!/^\d{10,15}$/.test(shareMobile.replace(/\D/g, ""))) {
      setShareMessage("Enter a valid mobile number.");
      return;
    }
    setPendingShare({ mobile: shareMobile, name: shareName, count: shareCount });
    setShowShareModal(false);
    setShowOtpModal(true);
    setOtpSent(false);
    setOtp("");
    setOtpError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/passes/send-otp`, { mobile: shareMobile });
      setOtpSent(true);
      if (response.data.demo || response.data.smsError || response.data.otp) {
        setIsDemoMode(true);
        setDemoOtp(response.data.otp || "");
      } else {
        setIsDemoMode(false);
        setDemoOtp("");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setOtpError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    try {
      const verifyRes = await axios.post(`${API_BASE_URL}/api/passes/verify-otp`, {
        mobile: pendingShare.mobile,
        otp,
      });
      if (verifyRes.data.success) {
        const shareRes = await axios.post(`${API_BASE_URL}/api/passes/share`, {
          mobile: pendingShare.mobile,
          name: pendingShare.name,
          count: pendingShare.count,
        });
        const shareUrl = `${window.location.origin}/#/shared-pass/${shareRes.data.token}`;
        let cleanMobile = pendingShare.mobile.replace(/\D/g, "");
        if (cleanMobile.length === 10) {
          cleanMobile = "91" + cleanMobile;
        } else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
          // Already correct
        } else {
          setShareMessage("Invalid mobile number format for WhatsApp!");
          return;
        }
        const message = `You have been shared ${pendingShare.count} pass(es)! Click here to view your pass: ${shareUrl}`;
        const waLink = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
        window.open(waLink, "_blank");
        setShareMessage(shareRes.data.message);
        setShowOtpModal(false);
        setShareMobile("");
        setShareName("");
        setShareCount(1);
        setPendingShare(null);
        fetchCurrentPass();
      } else {
        setOtpError("Invalid OTP");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setOtpError(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Admin Dashboard</h2>
        <div className="mb-4 text-center">
          <p><b>Total Passes:</b> {summary.total}</p>
          <p><b>Available Passes:</b> {summary.available}</p>
          <p><b>Sold Passes:</b> {summary.sold}</p>
        </div>
        {loading && <p className="text-blue-500 text-center">Loading...</p>}
        {currentPass && !editMode && (
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Current Pass</h3>
            <img
              src={getImageUrl(currentPass.imageUrl)}
              alt="Pass"
              className="mx-auto mb-4 rounded shadow max-h-48"
              onError={(e) => console.error("Image load error:", e, "URL:", getImageUrl(currentPass.imageUrl))}
            />
            <p className="mb-2">Available Passes: <span className="font-bold">{currentPass.count}</span></p>
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
            >
              Share Pass
            </button>
          </div>
        )}
        {(editMode || !currentPass) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Pass Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 rounded shadow max-h-40 mx-auto"
                />
              )}
            </div>
            <div>
              <label className="block font-medium mb-1">Number of Passes:</label>
              <input
                type="number"
                value={count}
                min={1}
                onChange={(e) => setCount(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
              >
                {currentPass ? "Update Pass" : "Create Pass"}
              </button>
              {currentPass && (
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
        {message && <p className="mt-4 text-center text-green-600 font-medium">{message}</p>}
      </div>
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4 text-center">Share Pass</h3>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Recipient Name</label>
                <input
                  type="text"
                  value={shareName}
                  onChange={(e) => setShareName(e.target.value)}
                  required
                  maxLength={30}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="Enter recipient name"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Mobile Number</label>
                <input
                  type="tel"
                  value={shareMobile}
                  onChange={(e) => setShareMobile(e.target.value)}
                  required
                  pattern="[0-9]{10,15}"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Number of Passes</label>
                <input
                  type="number"
                  value={shareCount}
                  min={1}
                  max={currentPass?.count || 1}
                  onChange={(e) => setShareCount(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
            {shareMessage && <p className="mt-3 text-center text-red-600">{shareMessage}</p>}
          </div>
        </div>
      )}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4 text-center">Verify OTP</h3>
            {otpSent ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  {isDemoMode ? (
                    <>
                      OTP sent to {pendingShare?.mobile}.<br />
                      {demoOtp && (
                        <span className="font-bold text-green-600">
                          Demo OTP: {demoOtp}
                        </span>
                      )}
                    </>
                  ) : (
                    `OTP sent to ${pendingShare?.mobile} via SMS.`
                  )}
                </p>
                <div>
                  <label className="block mb-1 font-medium">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    Verify & Share
                  </button>
                  <button
                    onClick={() => {
                      setShowOtpModal(false);
                      setPendingShare(null);
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
                {otpError && <p className="mt-3 text-center text-red-600 text-sm">{otpError}</p>}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Sending OTP...</p>
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setPendingShare(null);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 mt-4"
        onClick={openUserTable}
      >
        Show User Passes Detail
      </button>
      {showUserTable && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeUserTable}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">All User Passes</h2>
            <AdminSalesTable />
          </div>
        </div>
      )}
      <EmployeeSection API_BASE_URL={API_BASE_URL} />
    </div>
  );
}

function EmployeeSection({ API_BASE_URL }) {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [msg, setMsg] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setMsg("Failed to fetch employees");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!name.trim()) {
      setMsg("Name is required");
      return;
    }
    if (!mobile.trim()) {
      setMsg("Mobile is required");
      return;
    }
    if (!password.trim()) {
      setMsg("Password is required");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/employees`, { name, mobile, password });
      setMsg("Employee added successfully!");
      setName("");
      setMobile("");
      setPassword("");
      fetchEmployees();
    } catch (err) {
      console.error("Error creating employee:", err.response?.data || err.message);
      setMsg(err.response?.data?.message || "Failed to add employee");
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, margin: "16px 0" }}>
      <h3>Employees</h3>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          type="password"
        />
        <button type="submit">Add</button>
      </form>
      {msg && <div>{msg}</div>}
      <ul>
        {employees.map((emp) => (
          <li key={emp._id} style={{ marginBottom: "8px", padding: "4px", border: "1px solid #eee" }}>
            <strong>{emp.name}</strong> - {emp.mobile}
            <br />
            <small style={{ color: emp.password ? "green" : "red" }}>
              Password: {emp.password ? "✓ Stored" : "✗ Missing"}
              {emp.password && ` (${emp.password.length} chars)`}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboardPage;