import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import "./admin-tokens.css";
import "./AdminNotificationCenter.css";

/**
 * AdminNotificationCenter
 * Timeline of system alerts grouped by day, with category filters and
 * active/archived tabs. Matches Stitch screen: notification_center
 *
 * UPDATED: the Archive button previously had no onClick (decorative only)
 * and the Archived tab was hardcoded to an empty state no matter what.
 * Today/Yesterday notifications now live in state; archiving an item
 * removes it from its group and adds it to the Archived tab for real.
 */

const CATEGORIES = [
  { key: "all", label: "All Alerts", icon: "grid_view" },
  { key: "approval", label: "Approval", icon: "verified" },
  { key: "kyc", label: "KYC", icon: "verified_user" },
  { key: "po", label: "PO", icon: "shopping_cart" },
  { key: "invoice", label: "Invoice", icon: "receipt_long" },
  { key: "payment", label: "Payment", icon: "payments" },
];

const TODAY_NOTIFICATIONS = [
  {
    id: "n1",
    icon: "receipt_long",
    accent: "secondary",
    unread: true,
    title: "New Invoice Pending Review",
    body: (
      <>
        Invoice #INV-2024-089 from <strong>Luxury Linens Ltd</strong> requires your immediate approval for
        processing.
      </>
    ),
    time: "2 min ago",
    action: "View Invoice",
  },
  {
    id: "n2",
    icon: "verified_user",
    accent: "success",
    title: "KYC Documentation Verified",
    body: (
      <>
        Vendor <strong>Grand Atrium Catering</strong> has successfully passed the Tier 2 security clearance.
      </>
    ),
    time: "1 hour ago",
    action: "View Profile",
  },
  {
    id: "n3",
    icon: "verified",
    accent: "primary",
    title: "Work Order Assigned",
    body: (
      <>
        A new work order for the <strong>Summer Gala Audio Setup</strong> has been assigned to your queue.
      </>
    ),
    time: "3 hours ago",
    action: "Accept Task",
  },
];

const YESTERDAY_NOTIFICATIONS = [
  {
    id: "n4",
    icon: "payments",
    accent: "muted",
    title: "Payment Disbursed",
    body: "Batch payment #PAY-00921 has been successfully processed for 12 vendors.",
    time: "May 14, 4:45 PM",
    action: "View Report",
  },
  {
    id: "n5",
    icon: "shopping_cart",
    accent: "muted",
    title: "Purchase Order Modified",
    body: (
      <>
        PO-2024-551 (Venue Rental) was updated by <strong>Elena Rodriguez</strong>.
      </>
    ),
    time: "May 14, 11:20 AM",
    action: "See Changes",
  },
];

function NotificationCard({ item, onArchive, onMarkRead, archived = false }) {
  return (
    <div className={`admin-card admin-notif__card admin-notif__card--${item.accent}`}>
      <div className="admin-notif__card-icon">
        <span className="material-symbols-outlined">{item.icon}</span>
      </div>
      <div className="admin-notif__card-body">
        <div className="admin-notif__card-title-row">
          <h4 className="font-body-lg admin-notif__card-title">{item.title}</h4>
          {item.unread && <span className="admin-notif__unread-dot" />}
        </div>
        <p className="font-body-md admin-notif__card-text">{item.body}</p>
        <div className="admin-notif__card-foot">
          <span className="font-label-sm admin-notif__time-pill">{item.time}</span>
          <button className="admin-btn admin-btn--ghost">{item.action}</button>
        </div>
      </div>
      {!archived && (
        <div className="admin-notif__card-actions">
          {item.unread && (
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

  const [todayItems, setTodayItems] = useState(TODAY_NOTIFICATIONS);
  const [yesterdayItems, setYesterdayItems] = useState(YESTERDAY_NOTIFICATIONS);
  const [archivedItems, setArchivedItems] = useState([]);

  const handleArchive = (item) => {
    setTodayItems((prev) => prev.filter((n) => n.id !== item.id));
    setYesterdayItems((prev) => prev.filter((n) => n.id !== item.id));
    setArchivedItems((prev) => [{ ...item, unread: false }, ...prev]);
  };

  const handleMarkRead = (item) => {
    setTodayItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
    setYesterdayItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
  };

  const activeCount = todayItems.length + yesterdayItems.length;

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
                Active ({activeCount})
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
            {todayItems.length > 0 && (
              <div className="admin-notif__group">
                <div className="admin-notif__group-head">
                  <div className="admin-notif__group-icon admin-notif__group-icon--secondary">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <h3 className="admin-section-title">Today</h3>
                </div>
                <div className="admin-notif__group-items">
                  {todayItems.map((item) => (
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

            {yesterdayItems.length > 0 && (
              <div className="admin-notif__group">
                <div className="admin-notif__group-head">
                  <div className="admin-notif__group-icon">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  <h3 className="admin-section-title admin-notif__muted-title">Yesterday</h3>
                </div>
                <div className="admin-notif__group-items admin-notif__group-items--muted">
                  {yesterdayItems.map((item) => (
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

            {activeCount === 0 && (
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