import React, { useState, useEffect, useCallback } from 'react';
/* React-Bootstrap Components */
import { Button, Badge, ButtonGroup, Spinner } from 'react-bootstrap';
/* React-Bootstrap-Icons: Envelope */
import { Envelope } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import api from '../utils/axiosInstance';
import '../styles/theme.css';

/* Reusable Components */
import SearchBar from '../component/SearchBar';
import NotificationCard from '../component/NotificationCard';

// Filter tab definitions
const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'action', label: 'Action needed' },
  { id: 'deadline', label: 'Deadlines' },
  { id: 'activity', label: 'Activity' },
];

const POLL_INTERVAL_MS = 15000;

const NotificationDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const role = location.pathname.startsWith('/manager') ? 'manager' : 'staff';

  // Fetch notifications from the backend. `silent` skips the loading spinner
  // (used for background polling so the list doesn't flicker).
  const fetchNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const response = await api.get('/api/notifications');
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load notifications.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Compute counts for each filter tab
  const counts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    action: notifications.filter((n) => n.category === 'action').length,
    deadline: notifications.filter((n) => n.category === 'deadline').length,
    activity: notifications.filter((n) => n.category === 'activity').length,
  };

  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter((notification) => {
    let passesTab = true;
    if (activeFilter === 'unread') passesTab = !notification.isRead;
    else if (activeFilter !== 'all') passesTab = notification.category === activeFilter;

    const q = searchQuery.toLowerCase();
    const passesSearch =
      searchQuery === '' ||
      notification.title.toLowerCase().includes(q) ||
      notification.tag.toLowerCase().includes(q) ||
      (notification.description || '').toLowerCase().includes(q);

    return passesTab && passesSearch;
  });

  // Toggle a single notification's read state (optimistic + persisted)
  const handleMarkRead = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;
    const nextRead = !target.isRead;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: nextRead } : n))
    );

    try {
      await api.patch(`/api/notifications/${id}/read`, { isRead: nextRead });
    } catch (err) {
      console.error('Error updating notification:', err);
      // Roll back on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: !nextRead } : n))
      );
    }
  };

  // Mark all as read (optimistic + persisted)
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.patch('/api/notifications/read-all');
    } catch (err) {
      console.error('Error marking all as read:', err);
      fetchNotifications(true);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar role={role} />

      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        padding: '40px 60px',
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh'
      }}>
      {/* Page Header */}
      <header className="d-flex justify-content-between align-items-start mb-5">
        <div>
          <p className="text-secondary fw-bold text-uppercase text-micro mb-1" style={{ letterSpacing: '2px' }}>
            Communication
          </p>
          <h1 className="fw-bold m-0 fs-3 serif-font">Notifications</h1>
        </div>

        <Button
          variant="outline-secondary"
          className="d-flex align-items-center gap-2 rounded-3 px-3 py-2 btn-mark-all-read"
          onClick={handleMarkAllRead}
          disabled={counts.unread === 0}
        >
          <Envelope size={16} />
          <span className="text-sm fw-medium">Mark all as read</span>
        </Button>
      </header>

      <div className="header-divider"></div>

      {/* Filter Tabs */}
      <ButtonGroup className="mb-4 flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.id}
            variant="light"
            className={`filter-btn rounded-pill d-flex align-items-center gap-2 px-3 py-2 border-0 ${
              activeFilter === tab.id ? 'active' : ''
            }`}
            onClick={() => setActiveFilter(tab.id)}
          >
            <span className="text-sm fw-medium">{tab.label}</span>
            <Badge
              pill
              bg={activeFilter === tab.id ? 'light' : 'secondary'}
              text={activeFilter === tab.id ? 'dark' : 'light'}
              className="ms-1"
              style={{ fontSize: '11px' }}
            >
              {counts[tab.id]}
            </Badge>
          </Button>
        ))}
      </ButtonGroup>

      {/* Reusable SearchBar Component */}
      <div className="mb-4">
        <SearchBar
          placeholder="Search by title or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Notification Cards List */}
      <div className="notification-list">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="text-secondary">Loading notifications…</span>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger fw-medium mb-0">{error}</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              tag={notification.tag}
              title={notification.title}
              description={notification.description}
              time={notification.time}
              isRead={notification.isRead}
              onMarkRead={() => handleMarkRead(notification.id)}
            />
          ))
        ) : (
          <div className="text-center py-5">
            <Envelope size={40} className="text-secondary mb-3" />
            <p className="text-secondary fw-medium">No notifications found.</p>
          </div>
        )}
      </div>
      </main>
    </div>
  );
};

export default NotificationDashboard;
