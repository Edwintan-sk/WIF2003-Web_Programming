import { Nav } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import { getAssetUrl } from '../utils/assetUrl';
import '../styles/theme.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role = "manager", onSwitch = () => {} }) => {
  const { user, logout } = useAuth();
  const isManager = role === "manager";
  const location = useLocation();
  const navigate = useNavigate();

  const [kpiCount, setKpiCount] = useState(0);
  const [managerKpiCount, setManagerKpiCount] = useState(0);
  const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const displayName = user?.englishName || fullName || 'User';
  const initials =
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const jobTitle =
    user?.positionTitle ||
    user?.roleAtShop ||
    (user?.role === 'manager' ? 'Manager' : 'Staff');
  const profilePhotoUrl = getAssetUrl(user?.photoUrl);

  useEffect(() => {
    if (!isManager) {
      api.get('/api/kpi/assigned')
        .then(res => {
          const kpis = res.data?.data || res.data || [];
          if (Array.isArray(kpis)) {
            setKpiCount(
              kpis.filter(kpi => (kpi.status || '').toLowerCase() !== 'completed').length
            );
          }
        })
        .catch(err => console.error("Error fetching KPI count for sidebar", err));
    } else {
      api.get('/api/kpi/manager/dashboard')
        .then(res => {
          setManagerKpiCount(res.data?.kpisAssigned?.value || 0);
          setPendingSubmissionsCount(res.data?.pendingReview?.value || 0);
        })
        .catch(err => console.error("Error fetching manager stats for sidebar", err));
    }
  }, [isManager]);

  // Poll the unread notification count for the Notifications badge.
  useEffect(() => {
    const fetchUnread = () => {
      api.get('/api/notifications/unread-count')
        .then(res => setUnreadCount(res.data?.unread || 0))
        .catch(err => console.error('Error fetching unread count', err));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // Define link arrays based on role
  const managerLinks = [
    { label: "Team dashboard", path: "/manager", icon: true },
    { label: "All KPIs", path: "/manager/all-kpis", icon: true, badge: managerKpiCount > 0 ? String(managerKpiCount) : null },
    { label: "Assignment center", path: "/manager/assign", icon: true },
    { label: "Verification inbox", path: "/manager/verification-inbox", icon: true, badge: pendingSubmissionsCount > 0 ? String(pendingSubmissionsCount) : null },
  ];

  const staffLinks = [
    { label: "Dashboard", path: "/staff", icon: true },
    { label: "My KPIs", path: "/staff/kpis", icon: true, badge: kpiCount > 0 ? String(kpiCount) : null },
    { label: "Submit progress", path: "/staff/submit", icon: true },
  ];

  const workspaceLinks = isManager ? managerLinks : staffLinks;

  const communicationLinks = [
    { label: "Notifications", path: isManager ? "/manager/notifications" : "/staff/notifications", icon: true, badge: unreadCount > 0 ? String(unreadCount) : null },
    { label: "Feedback", path: isManager ? "/manager/feedback" : "/staff/feedback", icon: true },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column vh-100 p-4 shadow-lg z-1 sidebar-container">
      
      {/* Brand Logo Area */}
      <div className="mb-5 d-flex flex-column px-2">
        <div className="d-flex align-items-center">
          <div className="me-3 brand-logo-box">K</div>
          <h4 className="m-0 lh-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>KP EYE</h4>
        </div>
        {isManager && (
          <span 
            className="badge border text-uppercase mt-2 text-micro" 
            style={{ color: 'var(--sidebar-tag)', width: 'fit-content' }}
          >
            Manager
          </span>
        )}
      </div>

      <div className="d-flex flex-column gap-5 flex-grow-1 overflow-auto overflow-x-hidden">
          {/* Workspace Section */}
          <div>
            <p className="sidebar-header small mb-3">Workspace</p>
            <Nav className="flex-column gap-1">
              {workspaceLinks.map((link, index) => {
                const active = isActive(link.path);
                return (
                  <Nav.Link 
                    key={index}
                    onClick={() => handleNavigation(link.path)}
                    className={`px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link ${active ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`menu-square ${active ? 'active-square' : ''}`}></div>
                      <span className="fw-normal">{link.label}</span>
                    </div>
                    {link.badge && <span className="badge rounded-pill sidebar-badge">{link.badge}</span>}
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>

          {/* Communication Section */}
          <div>
            <p className="sidebar-header small mb-3">Communication</p>
            <Nav className="flex-column gap-1">
              {communicationLinks.map((link, index) => {
                const active = isActive(link.path);
                return (
                  <Nav.Link 
                    key={index}
                    onClick={() => handleNavigation(link.path)}
                    className={`px-3 py-2 d-flex justify-content-between align-items-center rounded-3 sidebar-link ${active ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`menu-square ${active ? 'active-square' : ''}`}></div>
                      <span className="fw-normal">{link.label}</span>
                    </div>
                    {link.badge && <span className="badge rounded-pill sidebar-badge">{link.badge}</span>}
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>
        </div>

        {/* Profile Section - Swaps based on Manager UI */}
        <div className="mt-auto pt-3">
          <button
            type="button"
            className={`d-flex align-items-center gap-3 p-3 rounded-4 mb-3 profile-container profile-nav-button ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => handleNavigation('/profile')}
            aria-label="Open profile management"
          >
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold profile-avatar">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={`${displayName} profile`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className="small fw-bold text-white">{displayName}</div>
              <div style={{ fontSize: '11px', color: 'var(--sidebar-tag)' }}>{jobTitle}</div>
            </div>
          </button>

          <Nav.Link onClick={handleLogout} className="d-flex align-items-center gap-2 px-3 py-2 sidebar-link rounded-3 fw-normal" style={{ cursor: 'pointer' }}>
            <BoxArrowRight size={18} /> Logout
          </Nav.Link>
        </div>
    </div>
  );
};

export default Sidebar;
