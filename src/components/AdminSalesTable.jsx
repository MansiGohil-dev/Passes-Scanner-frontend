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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-8 border-2 border-blue-200 flex flex-col">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center text-blue-700 tracking-wide">User Passes Detail</h2>
{/* Employee List */}
<div className="mb-4">
  <h3 className="text-lg font-bold mb-2 text-blue-700">Employees</h3>
  {employees.length === 0 ? (
    <div className="text-gray-500">No employees added yet.</div>
  ) : (
    <table className="min-w-[300px] text-base border border-blue-200 rounded-lg">
      <thead>
        <tr className="bg-blue-100">
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Mobile</th>
        </tr>
      </thead>
      <tbody>
        {employees.map(emp => (
          <tr key={emp._id} className="even:bg-blue-50">
            <td className="px-4 py-2">{emp.name}</td>
            <td className="px-4 py-2 font-mono">{emp.mobile}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
<div className="flex justify-end mb-4">
  <button
    className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
    onClick={() => setShowAddEmployee(true)}
  >
    Add Employee
  </button>
</div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or mobile..."
            className="w-full sm:w-72 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />
        </div>
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

              {filteredSales.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-8 text-gray-500 text-xl">No user passes found.</td></tr>
              ) : (
                filteredSales.map((s, idx) => (
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
      </div>
      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button onClick={() => setShowAddEmployee(false)} className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl">&times;</button>
            <h3 className="text-lg font-bold mb-4 text-green-700">Add Employee</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              setEmpMsg("");
              
              // Validation
              if (!empName.trim()) {
                setEmpMsg("Name is required");
                return;
              }
              if (!empMobile.trim()) {
                setEmpMsg("Mobile is required");
                return;
              }
              if (!empPassword.trim()) {
                setEmpMsg("Password is required");
                return;
              }
              
              try {
                await axios.post(`${API_BASE_URL}/api/employees`, { name: empName, mobile: empMobile, password: empPassword });
                setEmpMsg("Employee added successfully!");
                setEmpName("");
                setEmpMobile("");
                setEmpPassword("");
                fetchEmployees();
              } catch (err) {
                let msg = "Failed to add employee";
                if (err.response && err.response.data && err.response.data.message) {
                  msg = err.response.data.message;
                }
                setEmpMsg(msg);
              }
            }} className="flex flex-col gap-3">
              <input value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Name" className="border px-3 py-2 rounded" required />
              <input value={empMobile} onChange={e => setEmpMobile(e.target.value)} placeholder="Mobile" className="border px-3 py-2 rounded" required />
              <input value={empPassword} onChange={e => setEmpPassword(e.target.value)} placeholder="Password" type="password" className="border px-3 py-2 rounded" required />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
              {empMsg && <div className="text-center text-green-700 font-semibold mt-2">{empMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSalesTable;
