import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StaffDashboard from './pages/staff-dashboard';
import ManagerDashboard from './pages/manager-dashboard';
import AllKPIs from './pages/all-kpis';
import VerificationInbox from './pages/verification-inbox';
import EvidenceDetailView from './pages/evidence-detail-view';
import StaffAssignedKPI from './pages/staff-assigned-kpi';
import StaffSubmitProgress from './pages/staff-submit-progress';
import CreateEditKpi from './pages/create-edit-kpi';
import AssignmentCenter from './pages/assignment-center';
import Login from './pages/login';
import Register from './pages/register';
import NotificationDashboard from './pages/notification-dashboard';
import Feedback from './pages/feedback';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-mark">K</div>
            <div className="brand-name">KP EYE</div>
          </div>
          <p className="auth-subtitle mb-0">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === 'manager' ? '/manager' : '/staff'}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Staff Routes */}
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/staff" element={<ProtectedRoute allowedRole="staff"><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/kpis" element={<ProtectedRoute allowedRole="staff"><StaffAssignedKPI /></ProtectedRoute>} />
        <Route path="/staff/submit" element={<ProtectedRoute allowedRole="staff"><StaffSubmitProgress /></ProtectedRoute>} />
        <Route path="/staff/archive" element={<ProtectedRoute allowedRole="staff"><StaffDashboard /></ProtectedRoute>} />
        
        {/* Staff Individual Communication Routes */}
        <Route path="/staff/notifications" element={<ProtectedRoute allowedRole="staff"><NotificationDashboard /></ProtectedRoute>} />
        <Route path="/staff/feedback" element={<ProtectedRoute allowedRole="staff"><Feedback /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute allowedRole="staff"><StaffDashboard /></ProtectedRoute>} />

        {/* Manager Routes */}
        <Route path="/manager" element={<ProtectedRoute allowedRole="manager"><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/all-kpis" element={<ProtectedRoute allowedRole="manager"><AllKPIs /></ProtectedRoute>} />
        <Route path="/manager/all-kpis/new" element={<ProtectedRoute allowedRole="manager"><CreateEditKpi /></ProtectedRoute>} />
        <Route path="/manager/all-kpis/edit/:kpiId" element={<ProtectedRoute allowedRole="manager"><CreateEditKpi /></ProtectedRoute>} />
        <Route path="/manager/assign" element={<ProtectedRoute allowedRole="manager"><AssignmentCenter /></ProtectedRoute>} />
        <Route path="/manager/verification-inbox" element={<ProtectedRoute allowedRole="manager"><VerificationInbox /></ProtectedRoute>} />
        <Route path="/manager/evidence-detail/:id" element={<ProtectedRoute allowedRole="manager"><EvidenceDetailView /></ProtectedRoute>} />

        {/* Manager Individual Communication Routes */}
        <Route path="/manager/notifications" element={<ProtectedRoute allowedRole="manager"><NotificationDashboard /></ProtectedRoute>} />
        <Route path="/manager/feedback" element={<ProtectedRoute allowedRole="manager"><Feedback /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRole="manager"><ManagerDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
