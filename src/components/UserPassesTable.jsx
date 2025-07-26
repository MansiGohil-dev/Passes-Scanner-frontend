import React, { useEffect, useState } from "react";
import axios from "axios";

function UserPassesTable({ API_BASE_URL }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");

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

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto rounded-xl w-full">
      <table className="min-w-full text-base sm:text-lg border-separate border-spacing-y-2">
        <thead className="bg-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th className="px-4 sm:px-6 py-3 sm:py-4 rounded-tl-xl">Name</th>
            <th className="px-4 sm:px-6 py-3 sm:py-4">Mobile</th>
            <th className="px-4 sm:px-6 py-3 sm:py-4">Actions</th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 rounded-tr-xl">Pass Count</th>
          </tr>
        </thead>
        <tbody className="mt-4 align-top">
          {passes.length === 0 ? (
            <tr><td colSpan="3" className="text-center py-8 text-gray-500 text-xl">No user passes found.</td></tr>
          ) : (
            passes.map((u, idx) => (
              <tr
                key={u.token || idx}
                className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 hover:shadow-lg`}
              >
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm disabled:opacity-50"
                    onClick={() => handleDelete(u.mobile)}
                    disabled={deleting === u.mobile}
                  >
                    {deleting === u.mobile ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-800">{u.name || '-'}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-blue-700">{u.mobile}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-purple-700">{u.count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserPassesTable;