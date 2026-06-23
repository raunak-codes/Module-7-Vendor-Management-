import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import "./admin-tokens.css";
import "./AdminNotificationCenter.css";

/**
 * AdminNotificationCenter
 * Timeline of system alerts grouped by day, with category filters and
 * active/archived tabs. Matches Stitch screen: notification_center
 */

const CATEGORIES = [
  { key: "all", label: "All Alerts", icon: "grid_view" },
  { key: "approval", label: "Approval", icon: "verified" },
  { key: "kyc", label: "KYC", icon: "verified_user" },
  { key: "po", label: "PO", icon: "shopping_cart" },
  { key: "invoice", label: "Invoice", icon: "receipt_long" },
  { key: "payment", label: "Payment", icon: "payments" },
];

function NotificationCard({ item, onArchive, onMarkRead, archived = false }) {
  return (
    <div className={`admin-card admin-notif__card admin-notif__card--primary`}>
      <div className="admin-notif__card-icon">
        <span className="material-symbols-outlined">notifications</span>
      </div>
      <div className="admin-notif__card-body">
        <div className="admin-notif__card-title-row">
          <h4 className="font-body-lg admin-notif__card-title">{item.title}</h4>
          {!item.isRead && <span className="admin-notif__unread-dot" />}
        </div>
        <p className="font-body-md admin-notif__card-text">{item.message}</p>
        <div className="admin-notif__card-foot">
          <span className="font-label-sm admin-notif__time-pill">{new Date(item.createdAt).toLocaleString()}</span>
        </div>
      </div>
      {!archived && (
        <div className="admin-notif__card-actions">
          {!item.isRead && (
            <button
              type="button"
              className="admin-notif__icon-btn"
              title="Mark as read"
              onClick={() => onMarkRead(item)}
            >
              <span className="material-symbols-outlined">done_all</span>
            </button>
          )}
          <button
            type="button"
            className="admin-notif__icon-btn"
            title="Archive"
            onClick={() => onArchive(item)}
          >
            <span className="material-symbols-outlined">archive</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminNotificationCenter() {
  const [tab, setTab] = useState("active");
  const [category, setCategory] = useState("all");

  const [notifications, setNotifications] = useState([]);
  const [archivedIds, setArchivedIds] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setNotifications(data.notifications ?? data.items ?? data ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleArchive = (item) => {
    setArchivedIds(prev => new Set(prev).add(item.id));
  };

  const handleMarkRead = async (item) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/v1/notifications/${item.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const notifArray = Array.isArray(notifications) ? notifications : (notifications?.items ?? []);
  const activeItems = notifArray.filter(n => !archivedIds.has(n.id));
  const archivedItems = notifArray.filter(n => archivedIds.has(n.id));

  return (
    <AdminLayout searchPlaceholder="Search notifications...">
      <div className="admin-page admin-notif-page">
        <PageHeader
          title="Notification Center"
          subtitle="Stay updated with critical alerts and operational status."
          actions={
            <div className="admin-notif__tabs">
              <button
                className={`admin-notif__tab${tab === "active" ? " admin-notif__tab--active" : ""}`}
                onClick={() => setTab("active")}
              >
                Active ({activeItems.length})
              </button>
              <button
                className={`admin-notif__tab${tab === "archived" ? " admin-notif__tab--active" : ""}`}
                onClick={() => setTab("archived")}
              >
                Archived ({archivedItems.length})
              </button>
            </div>
          }
        />

        <div className="admin-notif__categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`admin-notif__chip${category === cat.key ? " admin-notif__chip--active" : ""}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {tab === "active" ? (
          <div className="admin-notif__timeline">
            {activeItems.length > 0 && (
              <div className="admin-notif__group">
                <div className="admin-notif__group-head">
                  <div className="admin-notif__group-icon admin-notif__group-icon--secondary">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <h3 className="admin-section-title">Recent</h3>
                </div>
                <div className="admin-notif__group-items">
                  {activeItems.map((item) => (
                    <NotificationCard
                      key={item.id}
                      item={item}
                      onArchive={handleArchive}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeItems.length === 0 && (
              <div className="admin-card admin-notif__empty">
                <span className="material-symbols-outlined admin-notif__empty-icon">inventory_2</span>
                <h3 className="admin-section-title">You're all caught up</h3>
                <p className="font-body-md admin-notif__muted">No active notifications right now.</p>
              </div>
            )}
          </div>
        ) : archivedItems.length > 0 ? (
          <div className="admin-notif__timeline">
            <div className="admin-notif__group">
              <div className="admin-notif__group-items">
                {archivedItems.map((item) => (
                  <NotificationCard key={item.id} item={item} archived />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-card admin-notif__empty">
            <span className="material-symbols-outlined admin-notif__empty-icon">inventory_2</span>
            <h3 className="admin-section-title">No archived notifications</h3>
            <p className="font-body-md admin-notif__muted">Notifications you archive will appear here.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}