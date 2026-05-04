import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import StaffDashboard from './pages/staff-dashboard';
import StaffAssignedKPI from './pages/staff-assigned-kpi';
import StaffSubmitProgress from './pages/staff-submit-progress';

function App() {
  return (
    <Router>
        <Sidebar />

        <div className="main-content">
          <Routes>
            {/* Index page */}
            <Route path="/" element={<Navigate to="/staff-dashboard" replace />} /> 
            {/* Insert other pages here */}
            <Route path="/staff-dashboard" element={<StaffDashboard/>} />
            <Route path="/staff-assigned-kpi" element={<StaffAssignedKPI/>} />
            <Route path="/staff-submit-progress" element={<StaffSubmitProgress/>} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;