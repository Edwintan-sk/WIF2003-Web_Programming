import React from 'react';
import Sidebar from '../component/Sidebar';
import '../styles/theme.css';

const StaffSubmitProgress = () => {
  return (
    <div className="d-flex">
      <Sidebar role="staff" />
      
      <main style={{ 
        marginLeft: 'var(--sidebar-width)', 
        flex: 1, 
        padding: '40px 60px',
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh'
      }}>
        <h2 className="serif-font">Submit Progress</h2>
        <p className="text-muted">This page is currently under development.</p>
      </main>
    </div>
  );
};

export default StaffSubmitProgress;
