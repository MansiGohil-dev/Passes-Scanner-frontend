import React, { useEffect, useState } from "react";
import axios from "axios";

function UserPassesTable({ API_BASE_URL }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");
  const [search, setSearch] = useState("");

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/passes/sales`);
      setPasses(res.data);
    } catch (err) {
      setError("Failed to fetch user passes");
      setPasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [API_BASE_URL]);

  const handleDelete = async (mobile) => {
    if (!window.confirm("Are you sure you want to delete this user's pass?")) return;
    setDeleting(mobile);
    try {
      await axios.delete(`${API_BASE_URL}/api/passes/sales/${mobile}`);
      setPasses(passes.filter((p) => p.mobile !== mobile));
    } catch (err) {
      alert("Failed to delete pass: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting("");
    }
  };

  // Filter passes by search
  const filteredPasses = passes.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.mobile && p.mobile.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh] w-full">
        <span className="text-xl text-blue-600 animate-pulse">Loading...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-[70vh] w-full">
        <span className="text-xl text-red-600">{error}</span>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col px-2 sm:px-8 py-8 overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-800 tracking-tight">All User Passes</h2>
        <input
          type="text"
          placeholder="Search by name or mobile..."
          className="w-full sm:w-80 px-4 py-2 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search user passes"
        />
      </div>
      <div className="flex-1 overflow-auto rounded-2xl shadow-lg bg-white border border-blue-100">
        <table className="min-w-full text-base sm:text-lg border-separate border-spacing-y-2">
          <thead className="bg-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl text-left">Name</th>
              <th className="px-6 py-4 text-left">Mobile</th>
              <th className="px-6 py-4 text-left">Pass Count</th>
              <th className="px-6 py-4 rounded-tr-2xl text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {filteredPasses.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12 text-gray-400 text-xl font-semibold">
                  No results found.
                </td>
              </tr>
            ) : (
              filteredPasses.map((u, idx) => (
                <tr
                  key={u.token || idx}
                  className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 hover:shadow-lg`}
                >
                  <td className="px-6 py-4 font-semibold text-gray-800">{u.name || '-'}</td>
                  <td className="px-6 py-4 font-mono text-blue-700">{u.mobile}</td>
                  <td className="px-6 py-4 font-bold text-purple-700">{u.count}</td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 transition"
                      onClick={() => handleDelete(u.mobile)}
                      disabled={deleting === u.mobile}
                    >
                      {deleting === u.mobile ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserPassesTable;