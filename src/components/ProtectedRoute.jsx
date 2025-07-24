import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  if (sessionStorage.getItem('team420') !== 'true') {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
