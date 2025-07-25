import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminSalesTable() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDetailClick = (sale) => {
    setSelected(sale);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const [sales, setSales] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/passes/sales`);
      setSales(res.data);
    } catch (err) {
      setSales([]);
    }
  };

  // Filter sales by search
  const filteredSales = sales.filter(s =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.mobile || "").toLowerCase().includes(search.toLowerCase())
  );

  const [showAddEmployee, setShowAddEmployee] = useState(false);
const [empName, setEmpName] = useState("");
const [empMobile, setEmpMobile] = useState("");
const [empPassword, setEmpPassword] = useState("");
const [empMsg, setEmpMsg] = useState("");
const [employees, setEmployees] = useState([]);

useEffect(() => {
  fetchEmployees();
}, []);

const fetchEmployees = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/employees`);
    setEmployees(res.data);
  } catch {
    setEmployees([]);
  }
};

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
        {sales.length === 0 ? (
          <tr><td colSpan="3" className="text-center py-8 text-gray-500 text-xl">No user passes found.</td></tr>
        ) : (
          sales.map((s, idx) => (
            <tr
              key={idx}
              className={
                `transition-all duration-200 ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 hover:shadow-lg`
              }
            >
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-800">{s.name || '-'}</td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-blue-700">{s.mobile}</td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-purple-700">{s.count}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
}

export default AdminSalesTable;
