import React from 'react';
import AdminForm from './AdminForm';
import AdminTable from './AdminTable';

function AdminCrudPage() {
  return (
    <div className="crud-container">
      <h2>Admin CRUD Operations</h2>
      <div style={{ margin: '40px 0' }}>
        <AdminForm team420={true} />
        <AdminTable />
      </div>
    </div>
  );
}

export default AdminCrudPage;
