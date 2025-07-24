import React, { useState, useEffect } from 'react';

function AdminTable() {
  const [admins, setAdmins] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchAdmins = async () => {
    const res = await fetch(`${API_BASE_URL}/api/admins`);
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
    window.addEventListener('admin-updated', fetchAdmins);
    return () => window.removeEventListener('admin-updated', fetchAdmins);
  }, []);

  const handleEdit = admin => {
    setEditId(admin._id);
    setEditEmail(admin.email);
    setEditPassword('');
  };

  const handleUpdate = async id => {
    await fetch(`${API_BASE_URL}/api/admins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: editEmail, password: editPassword }),
    });
    setEditId(null);
    window.dispatchEvent(new Event('admin-updated'));
  };

  const handleDelete = async id => {
    await fetch(`${API_BASE_URL}/api/admins/${id}`, { method: 'DELETE' });
    window.dispatchEvent(new Event('admin-updated'));
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Admins</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin =>
              editId === admin._id ? (
                <tr key={admin._id} className="bg-yellow-50">
                  <td className="py-2 px-4 border-b">
                    <input
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button onClick={() => handleUpdate(admin._id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Save</button>
                    <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{admin.email}</td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button onClick={() => handleEdit(admin)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Edit</button>
                    <button onClick={() => handleDelete(admin._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Delete</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTable; 