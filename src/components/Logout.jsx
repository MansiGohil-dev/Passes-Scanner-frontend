import React from 'react';
import { Navigate } from 'react-router-dom';

function Logout() {
  sessionStorage.removeItem('team420');
  return <Navigate to="/" replace />;
}

export default Logout;
