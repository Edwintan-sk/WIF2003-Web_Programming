import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StaffDashboard from './pages/staff-dashboard';
import ManagerDashboard from './pages/manager-dashboard';
import AllKPIs from './pages/all-kpis';
import VerificationInbox from './pages/verification-inbox';
import EvidenceDetailView from './pages/evidence-detail-view';
import StaffAssignedKPI from './pages/staff-assigned-kpi';
import StaffSubmitProgress from './pages/staff-submit-progress';

function App() {
  return (
    <Router>
      <Routes>
        {/* Staff Routes */}
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/kpis" element={<StaffAssignedKPI />} />
        <Route path="/staff/submit" element={<StaffSubmitProgress />} />
        <Route path="/staff/archive" element={<StaffDashboard />} />

        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/all-kpis" element={<AllKPIs />} />
        <Route path="/manager/assign" element={<ManagerDashboard />} />
        <Route path="/manager/verify" element={<VerificationInbox />} />
        <Route path="/manager/verification-inbox" element={<VerificationInbox />} />
        <Route path="/manager/evidence-detail/:id" element={<EvidenceDetailView />} />

        {/* Communication Routes */}
        <Route path="/notifications" element={<ManagerDashboard />} />
        <Route path="/feedback" element={<ManagerDashboard />} />
        <Route path="/reports" element={<ManagerDashboard />} />
        <Route path="/help" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;