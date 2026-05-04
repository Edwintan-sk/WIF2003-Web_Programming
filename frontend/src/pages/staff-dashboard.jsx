import Sidebar from '../component/Sidebar';

const StaffDashboard = () => {
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
        <h1 className="mb-4">Dashboard</h1>
        <div className="p-4" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <p>Analytics content goes here.</p>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;