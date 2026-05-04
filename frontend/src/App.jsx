import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StaffDashboard from './pages/staff-dashboard';
import ManagerDashboard from './pages/manager-dashboard';
import AllKPIs from './pages/all-kpis';

function App() {
  return (
    <Router>
      <Routes>
        {/* Staff Routes */}
        <Route path="/" element={<StaffDashboard />} />
        <Route path="/staff/kpis" element={<StaffDashboard />} />
        <Route path="/staff/submit" element={<StaffDashboard />} />
        <Route path="/staff/archive" element={<StaffDashboard />} />

        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/all-kpis" element={<AllKPIs />} />
        <Route path="/manager/assign" element={<ManagerDashboard />} />
        <Route path="/manager/verify" element={<ManagerDashboard />} />

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