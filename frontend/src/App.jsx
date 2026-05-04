import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StaffDashboard from './pages/staff-dashboard';
import ManagerDashboard from './pages/manager-dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Simulate different logins by visiting /staff or /manager */}
        <Route path="/" element={<StaffDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;