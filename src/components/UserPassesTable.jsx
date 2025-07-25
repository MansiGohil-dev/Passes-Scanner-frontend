import React, { useEffect, useState } from "react";
import axios from "axios";

function UserPassesTable({ API_BASE_URL }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchPasses();
  }, [API_BASE_URL]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto rounded-xl w-full">
      <table className="min-w-full text-base sm:text-lg border-separate border-spacing-y-2">
        <thead className="bg-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th className="px-4 sm:px-6 py-3 sm:py-4 rounded-tl-xl">Name</th>
            <th className="px-4 sm:px-6 py-3 sm:py-4">Mobile</th>
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