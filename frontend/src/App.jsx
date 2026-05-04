import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import StaffDashboard from './pages/staff-dashboard';
import NotificationDashboard from './pages/notification-dashboard';
import FeedbackPage from './pages/feedback';

function App() {
  return (
    <Router>
      <Sidebar />

      <div className="main-content">
        <Routes>
          {/* Index page */}
          <Route path="/" element={<Navigate to="/staff-dashboard" replace />} />
          {/* Insert other pages here */}
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/notification-dashboard" element={<NotificationDashboard />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;