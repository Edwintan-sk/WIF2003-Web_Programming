import React, { useState } from 'react';
/* React-Bootstrap Components: Container, Button, Badge, ButtonGroup */
import { Container, Button, Badge, ButtonGroup } from 'react-bootstrap';
/* React-Bootstrap-Icons: Envelope */
import { Envelope } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import '../styles/theme.css';

/* Reusable Components */
import SearchBar from '../component/SearchBar';
import NotificationCard from '../component/NotificationCard';

// TODO: Replace mock data with database data later
const notificationsData = [
  {
    id: 1,
    tag: 'Decision',
    title: 'Submission rejection',
    description: 'Your evidence submission for community outreach event was rejected, revision is required!',
    time: '2h ago',
    isRead: false,
    category: 'action',
  },
  {
    id: 2,
    tag: 'KPI',
    title: 'New assigned KPI',
    description: "A new KPI 'Host 4 community outreach events' has been assigned to you",
    time: '3h ago',
    isRead: false,
    category: 'activity',
  },
  {
    id: 3,
    tag: 'Deadline',
    title: 'Deadline reminder',
    description: 'Audit due in 5 days',
    time: '1d ago',
    isRead: false,
    category: 'deadline',
  },
  {
    id: 4,
    tag: 'Decision',
    title: 'Submission approval',
    description: 'Your evidence submission for community outreach event was approved!',
    time: '5d ago',
    isRead: true,
    category: 'action',
  },
  {
    id: 5,
    tag: 'KPI',
    title: 'New assigned KPI',
    description: "A new KPI 'Host 4 community outreach events' has been assigned to you!",
    time: '1w ago',
    isRead: true,
    category: 'activity',
  },
];

// Filter tab definitions with counts
const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'action', label: 'Action needed' },
  { id: 'deadline', label: 'Deadlines' },
  { id: 'activity', label: 'Activity' },
];

const NotificationDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(notificationsData);

  // Compute counts for each filter tab
  const getCounts = () => ({
    all: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    action: notifications.filter((n) => n.category === 'action').length,
    deadline: notifications.filter((n) => n.category === 'deadline').length,
    activity: notifications.filter((n) => n.category === 'activity').length,
  });

  const counts = getCounts();

  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter((notification) => {
    // Tab filter
    let passesTab = true;
    if (activeFilter === 'unread') passesTab = !notification.isRead;
    else if (activeFilter !== 'all') passesTab = notification.category === activeFilter;

    // Search filter
    const passesSearch =
      searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase());

    return passesTab && passesSearch;
  });

  // Mark a single notification as read
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Determine role based on current URL path
  const location = useLocation();
  const role = location.pathname.startsWith('/manager') ? 'manager' : 'staff';

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

        {/* React-Bootstrap: Button - "Mark all as read" action */}
        <Button
          variant="outline-secondary"
         
          className="d-flex align-items-center gap-2 rounded-3 px-3 py-2 btn-mark-all-read"
          onClick={handleMarkAllRead}
        >
          {/* React-Bootstrap-Icons: Envelope */}
          <Envelope size={16} />
          <span className="text-sm fw-medium">Mark all as read</span>
        </Button>
      </header>

      <div className="header-divider"></div>

      {/* Filter Tabs */}
      {/* React-Bootstrap: ButtonGroup - groups the filter tab buttons */}
      <ButtonGroup className="mb-4 flex-wrap gap-2">
        {filterTabs.map((tab) => (
          /* React-Bootstrap: Button - individual filter tab */
          <Button
            key={tab.id}
            variant="light"
            className={`filter-btn rounded-pill d-flex align-items-center gap-2 px-3 py-2 border-0 ${
              activeFilter === tab.id ? 'active' : ''
            }`}
            onClick={() => setActiveFilter(tab.id)}
          >
            <span className="text-sm fw-medium">{tab.label}</span>
            {/* React-Bootstrap: Badge - count pill inside filter tab */}
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
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            /* Reusable NotificationCard Component */
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
          /* React-Bootstrap: Container (implicit) - empty state */
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