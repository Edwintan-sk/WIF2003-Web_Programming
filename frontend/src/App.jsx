import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import StaffDashboard from './pages/staff-dashboard';
import StaffAssignedKPI from './pages/staff-assigned-kpi';
import StaffSubmitProgress from './pages/staff-submit-progress';
import VerificationInbox from './pages/verification-inbox';

const AppLayout = () => {
  const location = useLocation();
  const isManager = location.pathname.startsWith('/manager');

  return (
    <>
      <Sidebar role={isManager ? 'manager' : 'staff'} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/staff-dashboard" replace />} /> 
          
          {/* Staff Pages */}
          <Route path="/staff-dashboard" element={<StaffDashboard/>} />
          <Route path="/staff-assigned-kpi" element={<StaffAssignedKPI/>} />
          <Route path="/staff-submit-progress" element={<StaffSubmitProgress/>} />

          {/* Manager Pages */}
          <Route path="/manager/verification-inbox" element={<VerificationInbox/>} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;