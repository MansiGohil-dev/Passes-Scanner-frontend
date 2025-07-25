// import React, { useEffect, useState } from "react";
// import { getImageUrl } from '../utils/getImageUrl';
// import axios from "axios";
// import AdminSalesTable from "./AdminSalesTable";

// function AdminDashboardPage() {
//   const [showUserTable, setShowUserTable] = useState(false);
//   const [summary, setSummary] = useState({ total: 0, available: 0, sold: 0 });
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [count, setCount] = useState("");
//   const [currentPass, setCurrentPass] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [message, setMessage] = useState("");
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [shareMobile, setShareMobile] = useState("");
//   const [shareName, setShareName] = useState("");
//   const [shareCount, setShareCount] = useState(1);
//   const [shareMessage, setShareMessage] = useState("");
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [pendingShare, setPendingShare] = useState(null);
//   const [demoOtp, setDemoOtp] = useState("");
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   const openUserTable = () => setShowUserTable(true);
//   const closeUserTable = () => setShowUserTable(false);

//   useEffect(() => {
//     fetchCurrentPass();
//     fetchSummary();
//   }, []);

//   const fetchSummary = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/passes/summary`);
//       setSummary(res.data);
//     } catch (err) {
//       console.error("Error fetching summary:", err);
//       setMessage("Failed to fetch summary");
//     }
//   };

//   const fetchCurrentPass = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API_BASE_URL}/api/passes`);
//       setCurrentPass(res.data);
//       setCount(res.data.count);
//       setImagePreview(getImageUrl(res.data.imageUrl));
//     } catch (err) {
//       console.error("Error fetching pass:", err);
//       setCurrentPass(null);
//       setMessage("Failed to fetch current pass");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     const formData = new FormData();
//     formData.append("count", count);
//     if (image) formData.append("image", image);

//     try {
//       let res;
//       if (currentPass && editMode) {
//         res = await axios.put(`${API_BASE_URL}/api/passes`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       } else {
//         res = await axios.post(`${API_BASE_URL}/api/passes`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//       setMessage("Pass saved successfully!");
//       setEditMode(false);
//       setImage(null);
//       fetchCurrentPass();
//     } catch (err) {
//       console.error("Error saving pass:", err.response?.data || err.message);
//       setMessage(err.response?.data?.message || "Error saving pass");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = () => {
//     setEditMode(true);
//     setImage(null);
//     setMessage("");
//     if (currentPass) {
//       setCount(currentPass.count);
//       setImagePreview(getImageUrl(currentPass.imageUrl));
//     }
//   };

//   const handleShare = async (e) => {
//     e.preventDefault();
//     setShareMessage("");
//     if (!shareName.trim()) {
//       setShareMessage("Recipient name is required.");
//       return;
//     }
//     if (!/^\d{10,15}$/.test(shareMobile.replace(/\D/g, ""))) {
//       setShareMessage("Enter a valid mobile number.");
//       return;
//     }
//     setPendingShare({ mobile: shareMobile, name: shareName, count: shareCount });
//     setShowShareModal(false);
//     setShowOtpModal(true);
//     setOtpSent(false);
//     setOtp("");
//     setOtpError("");
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
//       console.error("Error sending OTP:", err);
//       setOtpError("Failed to send OTP. Please try again.");
//     }
//   };

//   const handleVerifyOtp = async () => {
//     setOtpError("");
//     try {
//       const verifyRes = await axios.post(`${API_BASE_URL}/api/passes/verify-otp`, {
//         mobile: pendingShare.mobile,
//         otp,
//       });
//       if (verifyRes.data.success) {
//         const shareRes = await axios.post(`${API_BASE_URL}/api/passes/share`, {
//           mobile: pendingShare.mobile,
//           name: pendingShare.name,
//           count: pendingShare.count,
//         });
//         const shareUrl = `${window.location.origin}/#/shared-pass/${shareRes.data.token}`;
//         let cleanMobile = pendingShare.mobile.replace(/\D/g, "");
//         if (cleanMobile.length === 10) {
//           cleanMobile = "91" + cleanMobile;
//         } else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
//           // Already correct
//         } else {
//           setShareMessage("Invalid mobile number format for WhatsApp!");
//           return;
//         }
//         const message = `You have been shared ${pendingShare.count} pass(es)! Click here to view your pass: ${shareUrl}`;
//         const waLink = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
//         window.open(waLink, "_blank");
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
//       console.error("Error verifying OTP:", err);
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
//               onError={(e) => console.error("Image load error:", e, "URL:", getImageUrl(currentPass.imageUrl))}
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
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
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
//                 {currentPass ? "Update Pass" : "Create Pass"}
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
//                   onChange={(e) => setShareName(e.target.value)}
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
//                   onChange={(e) => setShareMobile(e.target.value)}
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
//                   onChange={(e) => setShareCount(e.target.value)}
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
//                       OTP sent to {pendingShare?.mobile}.<br />
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
//               ×
//             </button>
//             <h2 className="text-xl font-bold mb-4">All User Passes</h2>
//             <AdminSalesTable />
//           </div>
//         </div>
//       )}
//       <EmployeeSection API_BASE_URL={API_BASE_URL} />
//     </div>
//   );
// }

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
//       console.error("Error fetching employees:", err);
//       setMsg("Failed to fetch employees");
//     }
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setMsg("");
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
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/employees`, { name, mobile, password });
//       setMsg("Employee added successfully!");
//       setName("");
//       setMobile("");
//       setPassword("");
//       fetchEmployees();
//     } catch (err) {
//       console.error("Error creating employee:", err.response?.data || err.message);
//       setMsg(err.response?.data?.message || "Failed to add employee");
//     }
//   };

//   return (
//     <div style={{ border: "1px solid #ccc", padding: 16, margin: "16px 0" }}>
//       <h3>Employees</h3>
//       <form onSubmit={handleCreate} style={{ display: "flex", gap: 8 }}>
//         <input
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Name"
//           required
//         />
//         <input
//           value={mobile}
//           onChange={(e) => setMobile(e.target.value)}
//           placeholder="Mobile"
//           required
//         />
//         <input
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           required
//           type="password"
//         />
//         <button type="submit">Add</button>
//       </form>
//       {msg && <div>{msg}</div>}
//       <ul>
//         {employees.map((emp) => (
//           <li key={emp._id} style={{ marginBottom: "8px", padding: "4px", border: "1px solid #eee" }}>
//             <strong>{emp.name}</strong> - {emp.mobile}
//             <br />
//             <small style={{ color: emp.password ? "green" : "red" }}>
//               Password: {emp.password ? "✓ Stored" : "✗ Missing"}
//               {emp.password && ` (${emp.password.length} chars)`}
//             </small>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default AdminDashboardPage;

 

import { useEffect, useState } from "react"
import { getImageUrl } from "../utils/getImageUrl"
import axios from "axios"
import AdminSalesTable from "./AdminSalesTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Share2,
  Edit3,
  Plus,
  Upload,
  Eye,
  UserPlus,
  BarChart3,
  Ticket,
  Phone,
  User,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

function AdminDashboardPage() {
  const [showUserTable, setShowUserTable] = useState(false)
  const [summary, setSummary] = useState({ total: 0, available: 0, sold: 0 })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [count, setCount] = useState("")
  const [currentPass, setCurrentPass] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState("")
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMobile, setShareMobile] = useState("")
  const [shareName, setShareName] = useState("")
  const [shareCount, setShareCount] = useState(1)
  const [shareMessage, setShareMessage] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [pendingShare, setPendingShare] = useState(null)
  const [demoOtp, setDemoOtp] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const openUserTable = () => setShowUserTable(true)
  const closeUserTable = () => setShowUserTable(false)

  useEffect(() => {
    fetchCurrentPass()
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/passes/summary`)
      setSummary(res.data)
    } catch (err) {
      console.error("Error fetching summary:", err)
      setMessage("Failed to fetch summary")
    }
  }

  const fetchCurrentPass = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/api/passes`)
      setCurrentPass(res.data)
      setCount(res.data.count)
      setImagePreview(getImageUrl(res.data.imageUrl))
    } catch (err) {
      console.error("Error fetching pass:", err)
      setCurrentPass(null)
      setMessage("Failed to fetch current pass")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("count", count)
    if (image) formData.append("image", image)

    try {
      let res
      if (currentPass && editMode) {
        res = await axios.put(`${API_BASE_URL}/api/passes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        res = await axios.post(`${API_BASE_URL}/api/passes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }
      setMessage("Pass saved successfully!")
      setEditMode(false)
      setImage(null)
      fetchCurrentPass()
    } catch (err) {
      console.error("Error saving pass:", err.response?.data || err.message)
      setMessage(err.response?.data?.message || "Error saving pass")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditMode(true)
    setImage(null)
    setMessage("")
    if (currentPass) {
      setCount(currentPass.count)
      setImagePreview(getImageUrl(currentPass.imageUrl))
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()
    setShareMessage("")

    if (!shareName.trim()) {
      setShareMessage("Recipient name is required.")
      return
    }

    if (!/^\d{10,15}$/.test(shareMobile.replace(/\D/g, ""))) {
      setShareMessage("Enter a valid mobile number.")
      return
    }

    setPendingShare({ mobile: shareMobile, name: shareName, count: shareCount })
    setShowShareModal(false)
    setShowOtpModal(true)
    setOtpSent(false)
    setOtp("")
    setOtpError("")

    try {
      const response = await axios.post(`${API_BASE_URL}/api/passes/send-otp`, { mobile: shareMobile })
      setOtpSent(true)
      if (response.data.demo || response.data.smsError || response.data.otp) {
        setIsDemoMode(true)
        setDemoOtp(response.data.otp || "")
      } else {
        setIsDemoMode(false)
        setDemoOtp("")
      }
    } catch (err) {
      console.error("Error sending OTP:", err)
      setOtpError("Failed to send OTP. Please try again.")
    }
  }

  const handleVerifyOtp = async () => {
    setOtpError("")
    try {
      const verifyRes = await axios.post(`${API_BASE_URL}/api/passes/verify-otp`, {
        mobile: pendingShare.mobile,
        otp,
      })

      if (verifyRes.data.success) {
        const shareRes = await axios.post(`${API_BASE_URL}/api/passes/share`, {
          mobile: pendingShare.mobile,
          name: pendingShare.name,
          count: pendingShare.count,
        })

        const shareUrl = `${window.location.origin}/#/shared-pass/${shareRes.data.token}`
        let cleanMobile = pendingShare.mobile.replace(/\D/g, "")
        if (cleanMobile.length === 10) {
          cleanMobile = "91" + cleanMobile
        } else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
          // Already correct
        } else {
          setShareMessage("Invalid mobile number format for WhatsApp!")
          return
        }

        const message = `You have been shared ${pendingShare.count} pass(es)! Click here to view your pass: ${shareUrl}`
        const waLink = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`
        window.open(waLink, "_blank")

        setShareMessage(shareRes.data.message)
        setShowOtpModal(false)
        setShareMobile("")
        setShareName("")
        setShareCount(1)
        setPendingShare(null)
        fetchCurrentPass()
      } else {
        setOtpError("Invalid OTP")
      }
    } catch (err) {
      console.error("Error verifying OTP:", err)
      setOtpError(err.response?.data?.message || "OTP verification failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Manage passes and monitor system activity</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Passes</CardTitle>
              <BarChart3 className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Available</CardTitle>
              <Ticket className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.available}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Sold</CardTitle>
              <Users className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.sold}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pass Management */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                Pass Management
              </CardTitle>
              <CardDescription>Create and manage your event passes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-600">Loading...</span>
                </div>
              )}

              {currentPass && !editMode && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-3">Current Pass</h3>
                    <div className="relative inline-block">
                      <img
                        src={getImageUrl(currentPass.imageUrl) || "/placeholder.svg"}
                        alt="Pass"
                        className="mx-auto rounded-lg shadow-md max-h-48 w-auto"
                        onError={(e) =>
                          console.error("Image load error:", e, "URL:", getImageUrl(currentPass.imageUrl))
                        }
                      />
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">Available Passes</p>
                      <p className="text-2xl font-bold text-slate-800">{currentPass.count}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleEdit} className="flex-1 bg-transparent" variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Pass
                    </Button>
                    <Button
                      onClick={() => setShowShareModal(true)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Pass
                    </Button>
                  </div>
                </div>
              )}

              {(editMode || !currentPass) && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="image">Pass Image</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                      <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <label htmlFor="image" className="cursor-pointer">
                        {imagePreview ? (
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="mx-auto rounded-lg shadow-sm max-h-40"
                          />
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 mx-auto text-slate-400" />
                            <p className="text-sm text-slate-600">Click to upload image</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="count">Number of Passes</Label>
                    <Input
                      id="count"
                      type="number"
                      value={count}
                      min={1}
                      onChange={(e) => setCount(e.target.value)}
                      required
                      className="text-center text-lg font-semibold"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {currentPass ? "Update Pass" : "Create Pass"}
                    </Button>
                    {currentPass && (
                      <Button type="button" onClick={() => setEditMode(false)} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}

              {message && (
                <Alert
                  className={
                    message.includes("Error") || message.includes("Failed")
                      ? "border-red-200 bg-red-50"
                      : "border-green-200 bg-green-50"
                  }
                >
                  <AlertDescription
                    className={
                      message.includes("Error") || message.includes("Failed") ? "text-red-700" : "text-green-700"
                    }
                  >
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Employee Management */}
          <EmployeeSection API_BASE_URL={API_BASE_URL} />
        </div>

        {/* Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={openUserTable} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <Users className="h-4 w-4 mr-2" />
              View User Passes Detail
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              Share Pass
            </DialogTitle>
            <DialogDescription>Send passes to recipients via WhatsApp</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleShare} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="recipientName"
                  type="text"
                  value={shareName}
                  onChange={(e) => setShareName(e.target.value)}
                  required
                  maxLength={30}
                  className="pl-10"
                  placeholder="Enter recipient name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="mobile"
                  type="tel"
                  value={shareMobile}
                  onChange={(e) => setShareMobile(e.target.value)}
                  required
                  pattern="[0-9]{10,15}"
                  className="pl-10"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passCount">Number of Passes</Label>
              <Input
                id="passCount"
                type="number"
                value={shareCount}
                min={1}
                max={currentPass?.count || 1}
                onChange={(e) => setShareCount(e.target.value)}
                required
                className="text-center"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button type="button" onClick={() => setShowShareModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>

            {shareMessage && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{shareMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Verify OTP
            </DialogTitle>
          </DialogHeader>
          {otpSent ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  {isDemoMode ? (
                    <>
                      OTP sent to {pendingShare?.mobile}
                      {demoOtp && (
                        <div className="mt-2 p-2 bg-green-100 rounded text-green-700 font-mono">
                          Demo OTP: {demoOtp}
                        </div>
                      )}
                    </>
                  ) : (
                    `OTP sent to ${pendingShare?.mobile} via SMS.`
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                  placeholder="000000"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify & Share
                </Button>
                <Button
                  onClick={() => {
                    setShowOtpModal(false)
                    setPendingShare(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {otpError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{otpError}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-slate-600 mb-4">Sending OTP...</p>
              <Button
                onClick={() => {
                  setShowOtpModal(false)
                  setPendingShare(null)
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Table Modal */}
      <Dialog open={showUserTable} onOpenChange={setShowUserTable}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              All User Passes
            </DialogTitle>
          </DialogHeader>
          <AdminSalesTable />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmployeeSection({ API_BASE_URL }) {
  const [employees, setEmployees] = useState([])
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [msg, setMsg] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees`)
      setEmployees(res.data)
    } catch (err) {
      console.error("Error fetching employees:", err)
      setMsg("Failed to fetch employees")
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setMsg("")
    setLoading(true)

    if (!name.trim()) {
      setMsg("Name is required")
      setLoading(false)
      return
    }
    if (!mobile.trim()) {
      setMsg("Mobile is required")
      setLoading(false)
      return
    }
    if (!password.trim()) {
      setMsg("Password is required")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/employees`, { name, mobile, password })
      setMsg("Employee added successfully!")
      setName("")
      setMobile("")
      setPassword("")
      fetchEmployees()
    } catch (err) {
      console.error("Error creating employee:", err.response?.data || err.message)
      setMsg(err.response?.data?.message || "Failed to add employee")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-indigo-600" />
          Employee Management
        </CardTitle>
        <CardDescription>Add and manage employee accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empName">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="empName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Employee name"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empMobile">Mobile</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="empMobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile number"
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empPassword">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="empPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                type="password"
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Employee
          </Button>
        </form>

        {msg && (
          <Alert className={msg.includes("successfully") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={msg.includes("successfully") ? "text-green-700" : "text-red-700"}>
              {msg}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800">Current Employees</h4>
          {employees.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No employees added yet</p>
          ) : (
            <div className="space-y-3">
              {employees.map((emp) => (
                <Card key={emp._id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-800">{emp.name}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {emp.mobile}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={emp.password ? "default" : "destructive"}
                          className={emp.password ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                        >
                          {emp.password ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {emp.password ? "Active" : "No Password"}
                        </Badge>
                        {emp.password && <p className="text-xs text-slate-500 mt-1">{emp.password.length} chars</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AdminDashboardPage
