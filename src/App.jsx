import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboardPage from './components/AdminDashboardPage';
import AdminCrudPage from './components/AdminCrudPage';
import Logout from './components/Logout';
import AdminForm from './components/AdminForm';
import AdminTable from './components/AdminTable';
import SharedPass from './components/SharedPass';
import ScanPass from './components/ScanPass';
import ScanUserPass from './components/ScanUserPass';
import EmployeeLogin from './components/EmployeeLogin';


function App() {
  const isAuthenticated = sessionStorage.getItem('team420') === 'true';

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <AdminCrudPage /> : <Login />}
      />
      <Route
        path="/admin-dashboard"
        element={
         
            <AdminDashboardPage />
         
        }
      />
      <Route
        path="/admin-crud"
        element={
             <AdminCrudPage />
         }
      />
      <Route path="/logout" element={<Logout />} />
      <Route path="/elogin" element={<EmployeeLogin />} />
      <Route path="/shared-pass/:token" element={<SharedPass />} />
      <Route path="/scan-pass/:token" element={<ScanPass />} />
      <Route path="/scan-user-pass" element={<ScanUserPass />} />
    </Routes>
  );
}

export default App;