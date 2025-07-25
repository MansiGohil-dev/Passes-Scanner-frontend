

import { useEffect, useState } from "react"
import { getImageUrl } from "../utils/getImageUrl"
import axios from "axios"
import AdminSalesTable from "./AdminSalesTable"

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
      fetchSummary() // Refresh summary after updating passes
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
        fetchSummary() // Refresh summary after sharing
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
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Passes</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold">{summary.available}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Sold</p>
                <p className="text-2xl font-bold">{summary.sold}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pass Management */}
          <div className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Pass Management</h2>
                <p className="text-slate-600 text-sm">Create and manage your event passes</p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
                      onError={(e) => console.error("Image load error:", e, "URL:", getImageUrl(currentPass.imageUrl))}
                    />
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Available Passes</p>
                    <p className="text-2xl font-bold text-slate-800">{currentPass.count}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Pass
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Share Pass
                  </button>
                </div>
              </div>
            )}

            {(editMode || !currentPass) && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Pass Image</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="mx-auto rounded-lg shadow-sm max-h-40"
                        />
                      ) : (
                        <div className="space-y-2">
                          <svg
                            className="w-8 h-8 mx-auto text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-slate-600">Click to upload image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Number of Passes</label>
                  <input
                    type="number"
                    value={count}
                    min={1}
                    onChange={(e) => setCount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {currentPass ? "Update Pass" : "Create Pass"}
                  </button>
                  {currentPass && (
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {message && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  message.includes("Error") || message.includes("Failed")
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-green-50 border border-green-200 text-green-700"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Employee Management */}
          <EmployeeSection API_BASE_URL={API_BASE_URL} />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 rounded-lg p-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">System Overview</h2>
              <p className="text-slate-600 text-sm">Monitor user activity and pass distribution</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={openUserTable}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              View User Passes Detail
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Share Pass</h3>
                <p className="text-sm text-slate-600">Send passes to recipients via WhatsApp</p>
              </div>
            </div>
            <form onSubmit={handleShare} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Recipient Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={shareName}
                    onChange={(e) => setShareName(e.target.value)}
                    required
                    maxLength={30}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter recipient name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={shareMobile}
                    onChange={(e) => setShareMobile(e.target.value)}
                    required
                    pattern="[0-9]{10,15}"
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Number of Passes</label>
                <input
                  type="number"
                  value={shareCount}
                  min={1}
                  max={currentPass?.count || 1}
                  onChange={(e) => setShareCount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {shareMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{shareMessage}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Verify OTP</h3>
            </div>
            {otpSent ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    {isDemoMode ? (
                      <>
                        OTP sent to {pendingShare?.mobile}
                        {demoOtp && (
                          <div className="mt-2 p-2 bg-green-100 rounded text-green-700 font-mono font-bold">
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
                  <label className="block text-sm font-medium text-slate-700">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verify & Share
                  </button>
                  <button
                    onClick={() => {
                      setShowOtpModal(false)
                      setPendingShare(null)
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {otpError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{otpError}</div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 mb-4">Sending OTP...</p>
                <button
                  onClick={() => {
                    setShowOtpModal(false)
                    setPendingShare(null)
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Table Modal */}
      {showUserTable && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">All User Passes</h3>
                  <p className="text-sm text-slate-600">Complete overview of user pass activity</p>
                </div>
              </div>
              <button
                onClick={closeUserTable}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AdminSalesTable />
            </div>
          </div>
        </div>
      )}
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
    <div className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 rounded-lg p-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Employee Management</h2>
          <p className="text-slate-600 text-sm">Add and manage employee accounts</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Employee name"
                required
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Mobile</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile number"
                required
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              type="password"
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
          Add Employee
        </button>
      </form>

      {msg && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            msg.includes("successfully")
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="border-t border-slate-200 pt-4">
        <h4 className="font-semibold text-slate-800 mb-3">Current Employees</h4>
        {employees.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No employees added yet</p>
        ) : (
          <div className="space-y-3">
            {employees.map((emp) => (
              <div key={emp._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800">{emp.name}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {emp.mobile}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        emp.password ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.password ? (
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {emp.password ? "Active" : "No Password"}
                    </span>
                    {emp.password && <p className="text-xs text-slate-500 mt-1">{emp.password.length} chars</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
