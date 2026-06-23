import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import "./admin-tokens.css";
import "./AdminDashboard.css";

/**
 * AdminDashboard
 * Executive overview: KPIs, vendor performance, category mix, recent
 * transactions, and quick actions. Matches Stitch screen: admin_dashboard
 */

const CATEGORY_MIX = [
  { label: "Hospitality", pct: 45, color: "#610000" },
  { label: "Tech", pct: 25, color: "#b51b1e" },
  { label: "Facilities", pct: 20, color: "#8e706b" },
  { label: "Others", pct: 10, color: "#e3beb8" },
];

const VENDOR_PERFORMANCE = [
  { label: "Catering", value: 92 },
  { label: "AV", value: 78 },
  { label: "Logistics", value: 85 },
  { label: "Security", value: 95 },
  { label: "Decor", value: 70 },
  { label: "Venue", value: 88 },
];

const TRANSACTIONS = [
  { id: "TXN-1", vendor: "Grand Hyatt Paris", service: "Venue Hire", amount: "$12,500", date: "Oct 24, 2025", status: "completed" },
  { id: "TXN-2", vendor: "Elite Catering Co.", service: "Premium Gala Dinner", amount: "$8,200", date: "Oct 23, 2025", status: "pending" },
  { id: "TXN-3", vendor: "Luxe Florals", service: "Flower Arrangement", amount: "$1,500", date: "Oct 23, 2025", status: "completed" },
  { id: "TXN-4", vendor: "Visionary AV Systems", service: "Main Stage Setup", amount: "$45,000", date: "Oct 22, 2025", status: "flagged" },
];

const columns = [
  { key: "vendor", header: "Vendor", render: (r) => <strong>{r.vendor}</strong> },
  { key: "service", header: "Service" },
  { key: "amount", header: "Amount", align: "right", render: (r) => <strong>{r.amount}</strong> },
  { key: "date", header: "Date" },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

function CategoryRing() {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="admin-dashboard__ring-wrap">
      <svg viewBox="0 0 180 180" className="category-mix-ring">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--admin-surface-container)" strokeWidth="20" />
        {CATEGORY_MIX.map((c, i) => {
          const dash = (c.pct / 100) * circumference;
          const circle = (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={c.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 90 90)"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="admin-dashboard__ring-center">
        <span className="font-headline-md">12</span>
        <span className="font-label-sm">Categories</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AdminLayout searchPlaceholder="Search vendors, orders, or invoices...">
      <div className="admin-page admin-dashboard-page">
        <PageHeader
          title="Executive Dashboard"
          subtitle="Overview of enterprise operations and vendor life-cycles."
        />

        {/* KPI row */}
        <div className="admin-dashboard__stats">
          <StatCard label="Total Vendors" value="1,248" subValue="+12%" subValueType="success" accentLeft />
          <StatCard label="Pending KYC" value="42" subValue="Urgent" subValueType="warning" accentLeft />
          <StatCard label="Active POs" value="186" subValue="Value: $2.4M" accentLeft />
          <StatCard label="Pending Payments" value="$420k" subValue="Due this week" accentLeft />
          <StatCard label="Upcoming Events" value="14" subValue="Next: Gala 2026" accentLeft />
        </div>

        {/* Charts row */}
        <div className="admin-dashboard__charts">
          <div className="admin-card admin-dashboard__chart-card">
            <div className="admin-dashboard__chart-header">
              <h2 className="admin-section-title">Vendor Performance Index</h2>
              <div className="admin-dashboard__toggle">
                <button className="admin-dashboard__toggle-btn admin-dashboard__toggle-btn--active">Weekly</button>
                <button className="admin-dashboard__toggle-btn">Monthly</button>
              </div>
            </div>
            <div className="admin-dashboard__bars">
              {VENDOR_PERFORMANCE.map((b) => (
                <div className="admin-dashboard__bar-col" key={b.label}>
                  <div
                    className="vendor-performance-bar"
                    style={{ height: `${b.value}%`, backgroundColor: "var(--admin-primary)" }}
                  />
                  <span className="font-label-sm">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card admin-dashboard__category-card">
            <h2 className="admin-section-title">Category Mix</h2>
            <CategoryRing />
            <div className="admin-dashboard__legend">
              {CATEGORY_MIX.map((c) => (
                <div className="admin-dashboard__legend-item font-body-md" key={c.label}>
                  <span className="admin-dashboard__legend-dot" style={{ backgroundColor: c.color }} />
                  {c.label} ({c.pct}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions + Quick actions row */}
        <div className="admin-dashboard__bottom">
          <div className="admin-card admin-dashboard__transactions-card">
            <div className="admin-dashboard__chart-header">
              <h2 className="admin-section-title">Recent Transactions</h2>
              <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/admin/payments")}>
                View All
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
              </button>
            </div>
            <DataTable columns={columns} data={TRANSACTIONS} />
          </div>

          <div className="admin-dashboard__side">
            <div className="admin-card">
              <h2 className="admin-section-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
              <div className="admin-dashboard__quick-actions">
                <button className="admin-btn admin-btn--primary admin-dashboard__quick-action" onClick={() => navigate("/admin/purchase-orders")}>
                  <span className="material-symbols-outlined">add</span>
                  New Purchase Order
                </button>
                <button className="admin-btn admin-btn--outline admin-dashboard__quick-action quick-action-btn" onClick={() => navigate("/admin/vendors")}>
                  <span className="material-symbols-outlined">person_add</span>
                  Onboard Vendor
                </button>
                <button className="admin-btn admin-btn--outline admin-dashboard__quick-action quick-action-btn" onClick={() => navigate("/admin/kyc")}>
                  <span className="material-symbols-outlined">verified_user</span>
                  Run KYC Batch
                </button>
              </div>
            </div>

            <div className="admin-dashboard__goal-card">
              <p className="font-label-sm">Quarterly Goal</p>
              <p className="font-body-lg admin-dashboard__goal-title">Vendor Compliance Reach 95%</p>
              <p className="font-display-lg admin-dashboard__goal-value">88%</p>
              <div className="admin-dashboard__goal-bar">
                <div className="admin-dashboard__goal-bar-fill" style={{ width: "88%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
