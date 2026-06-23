import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

/* Navbar spec: search (pill) + notifications + avatar ONLY.
 * Removed: chat icon, New Booking button, user info section, nav links.
 *
 * UPDATED: notifications icon now opens an inline dropdown preview instead
 * of redirecting immediately; avatar is now a real account menu trigger.
 * Both close on outside click, on Escape, and when a row inside is chosen. */

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    icon: 'receipt_long',
    accent: 'secondary',
    unread: true,
    title: 'New Invoice Pending Review',
    body: 'Invoice #INV-2024-089 from Luxury Linens Ltd requires your approval.',
    time: '2 min ago',
  },
  {
    id: 'n2',
    icon: 'verified_user',
    accent: 'success',
    unread: true,
    title: 'KYC Documentation Verified',
    body: 'Vendor Grand Atrium Catering passed Tier 2 security clearance.',
    time: '1 hour ago',
  },
  {
    id: 'n3',
    icon: 'shopping_cart',
    accent: 'muted',
    unread: false,
    title: 'Purchase Order Modified',
    body: 'PO-2241 quantities were updated by the procurement team.',
    time: 'Yesterday',
  },
];

export default function Navbar({
  searchPlaceholder = 'Search...',
  showSearch = true,
  avatarInitials = 'AU',
  adminName = 'Admin User',
  adminRole = 'Vendor Operations Admin',
  notificationsPath = '/admin/notifications',
  settingsPath = '/admin/settings',
  logoutPath = '/admin/logout',
}) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const goToNotifications = () => {
    setNotifOpen(false);
    navigate(notificationsPath);
  };

  return (
    <header className="navbar">
      {/* Left: Search */}
      <div className="navbar__left">
        {showSearch && (
          <div className="navbar__search-wrap">
            <span className="material-symbols-outlined navbar__search-icon">search</span>
            <input
              className="navbar__search font-body-md"
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="navbar__right">
        {/* Notifications */}
        <div className="navbar__menu-wrap" ref={notifRef}>
          <button
            type="button"
            className="navbar__icon-btn"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && <span className="navbar__badge"></span>}
          </button>

          {notifOpen && (
            <div className="navbar__dropdown navbar__dropdown--notifications" role="menu">
              <div className="navbar__dropdown-header">
                <span className="font-label-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="navbar__dropdown-count">{unreadCount} new</span>
                )}
              </div>

              <div className="navbar__dropdown-list">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <button
                    type="button"
                    key={n.id}
                    className="navbar__notification-item"
                    onClick={goToNotifications}
                  >
                    <span className={`navbar__notification-icon navbar__notification-icon--${n.accent}`}>
                      <span className="material-symbols-outlined">{n.icon}</span>
                    </span>
                    <span className="navbar__notification-text">
                      <span className="navbar__notification-title">{n.title}</span>
                      <span className="navbar__notification-body">{n.body}</span>
                      <span className="navbar__notification-time">{n.time}</span>
                    </span>
                    {n.unread && <span className="navbar__notification-dot" aria-hidden="true" />}
                  </button>
                ))}
              </div>

              <button type="button" className="navbar__dropdown-footer" onClick={goToNotifications}>
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Avatar / account menu */}
        <div className="navbar__menu-wrap" ref={profileRef}>
          <button
            type="button"
            className="navbar__avatar"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="Account menu"
          >
            <span className="font-label-sm">{avatarInitials}</span>
          </button>

          {profileOpen && (
            <div className="navbar__dropdown navbar__dropdown--profile" role="menu">
              <div className="navbar__profile-header">
                <div className="navbar__avatar navbar__avatar--lg" aria-hidden="true">
                  <span className="font-label-sm">{avatarInitials}</span>
                </div>
                <div className="navbar__profile-info">
                  <span className="navbar__profile-name">{adminName}</span>
                  <span className="navbar__profile-role">{adminRole}</span>
                </div>
              </div>

              <div className="navbar__dropdown-divider" />

              <button
                type="button"
                className="navbar__dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  navigate(settingsPath);
                }}
              >
                <span className="material-symbols-outlined">settings</span>
                Account Settings
              </button>

              <button
                type="button"
                className="navbar__dropdown-item navbar__dropdown-item--danger"
                onClick={() => {
                  setProfileOpen(false);
                  navigate(logoutPath);
                }}
              >
                <span className="material-symbols-outlined">logout</span>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}