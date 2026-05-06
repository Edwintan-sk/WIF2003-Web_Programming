import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StaffDashboard from './pages/staff-dashboard';
import ManagerDashboard from './pages/manager-dashboard';
import AllKPIs from './pages/all-kpis';
import Login from './pages/login';
import Register from './pages/register';
import NotificationDashboard from './pages/notification-dashboard';
import Feedback from './pages/feedback';
import VerificationInbox from './pages/verification-inbox';
import EvidenceDetailView from './pages/evidence-detail-view';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Staff Routes */}
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/staff" element={<StaffDashboard />} />
        {/* Placeholder for uncompleted Staff pages */}
        <Route path="/staff/kpis" element={<StaffDashboard />} />
        <Route path="/staff/submit" element={<StaffDashboard />} />
        <Route path="/staff/archive" element={<StaffDashboard />} />
        
        {/* Staff Individual Communication Routes */}
        <Route path="/staff/notifications" element={<NotificationDashboard />} />
        <Route path="/staff/feedback" element={<Feedback />} />
        <Route path="/help" element={<StaffDashboard />} />

        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/all-kpis" element={<AllKPIs />} />
        {/* Placeholder for uncompleted Manager pages */}
        <Route path="/manager/assign" element={<ManagerDashboard />} />
        <Route path="/manager/verify" element={<VerificationInbox />} />
        <Route path="/manager/verification-inbox" element={<VerificationInbox />} />
        <Route path="/manager/evidence-detail/:id" element={<EvidenceDetailView />} />

        {/* Manager Individual Communication Routes */}
        <Route path="/manager/notifications" element={<NotificationDashboard />} />
        <Route path="/manager/feedback" element={<Feedback />} />
        <Route path="/reports" element={<ManagerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;