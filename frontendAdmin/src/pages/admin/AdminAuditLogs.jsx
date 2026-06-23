import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import "./admin-tokens.css";
import "./AdminAuditLogs.css";

/**
 * AdminAuditLogs
 * System-wide activity monitoring for enterprise compliance and security.
 * Matches Stitch screen: audit_logs
 */

const LOGS = [
  {
    id: "L-1",
    timestamp: "Oct 24, 2026\n14:22:15",
    initials: "JW",
    admin: "James Wilson",
    role: "Admin Level 2",
    action: "Approved high-value Purchase Order",
    target: "PO-2026-8842",
    ip: "192.168.1.45",
    status: "success",
  },
  {
    id: "L-2",
    timestamp: "Oct 24, 2026\n13:58:02",
    initials: "SC",
    admin: "Sarah Chen",
    role: "System Auditor",
    action: "Updated KYC documents for Vendor",
    target: "Luminary Events Ltd.",
    ip: "10.0.4.122",
    status: "success",
  },
  {
    id: "L-3",
    timestamp: "Oct 24, 2026\n12:15:33",
    initials: "JW",
    admin: "James Wilson",
    role: "Admin Level 2",
    action: "Manual override of payment threshold",
    target: "Global Logistics",
    ip: "192.168.1.45",
    status: "flagged",
  },
  {
    id: "L-4",
    timestamp: "Oct 24, 2026\n11:45:01",
    initials: "AM",
    admin: "Auto-Manager",
    role: "System Script",
    action: "Scheduled invoice generation",
    target: "Multi-Target",
    ip: "Internal (Loopback)",
    status: "success",
  },
];

const ACTIVITY_BARS = [40, 70, 30, 90, 55, 80, 35, 60];

const columns = [
  {
    key: "timestamp",
    header: "Timestamp",
    render: (r) => <span className="admin-audit__timestamp">{r.timestamp}</span>,
  },
  {
    key: "admin",
    header: "Admin",
    render: (r) => (
      <div className="admin-audit__admin">
        <span className="admin-audit__avatar">{r.initials}</span>
        <div>
          <p className="admin-audit__admin-name">{r.admin}</p>
          <p className="admin-audit__admin-role">{r.role}</p>
        </div>
      </div>
    ),
  },
  { key: "action", header: "Action Description" },
  {
    key: "target",
    header: "Target Vendor/PO",
    render: (r) => <strong className="admin-audit__target">{r.target}</strong>,
  },
  { key: "ip", header: "IP Address", render: (r) => <span className="admin-audit__ip">{r.ip}</span> },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);

  return (
    <AdminLayout searchPlaceholder="Search audit trail or filters...">
      <div className="admin-page admin-audit-page">
        <PageHeader
          title="Audit Logs"
          subtitle="System-wide activity monitoring for enterprise compliance and security."
          actions={
            <>
              <button className="admin-btn admin-btn--outline">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
                Filters
              </button>
              <button className="admin-btn admin-btn--primary">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>file_download</span>
                Export Report
              </button>
            </>
          }
        />

        <div className="admin-audit__stats">
          <StatCard label="Total Activities" value="1,284" subValue="+12% vs last mo" subValueType="success" />
          <StatCard label="Security Alerts" value="0" subValue="Stable" subValueType="default" />
          <div className="admin-card admin-audit__live">
            <span className="font-label-sm admin-audit__live-label">Live Stream Activity</span>
            <div className="admin-audit__live-row">
              <span className="admin-audit__live-dot" />
              <span className="font-body-md">Monitoring Active</span>
            </div>
            <div className="admin-audit__live-bars">
              {ACTIVITY_BARS.map((h, i) => (
                <div key={i} className="admin-audit__live-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="admin-card admin-audit__table-card">
          <div className="admin-audit__panel-head">
            <div className="admin-audit__panel-head-left">
              <h3 className="admin-section-title">Log Entries</h3>
              <span className="admin-audit__live-tag">Real-time update</span>
            </div>
            <button className="admin-audit__range">
              Last 24 Hours
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
            </button>
          </div>
          <DataTable
            columns={columns}
            data={LOGS}
            footer={
              <>
                <span className="admin-audit__footer-text">Showing 1-25 of 1,284 logs</span>
                <div className="admin-vendor-dir__pagination">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
                  <button onClick={() => setPage((p) => p + 1)}>›</button>
                </div>
              </>
            }
          />
        </div>

        <div className="admin-audit__bottom">
          <div className="admin-card admin-audit__filters">
            <div className="admin-audit__panel-head">
              <h3 className="admin-section-title">Advanced Filtering</h3>
              <button className="admin-btn admin-btn--ghost">Clear All</button>
            </div>
            <div className="admin-audit__filters-grid">
              <div>
                <span className="admin-label">Action Category</span>
                <select className="admin-select">
                  <option>All Actions</option>
                  <option>Approvals</option>
                  <option>Edits</option>
                  <option>Overrides</option>
                </select>
              </div>
              <div>
                <span className="admin-label">Risk Profile</span>
                <select className="admin-select">
                  <option>All Risks</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <span className="admin-label">Module</span>
                <select className="admin-select">
                  <option>All Modules</option>
                  <option>Purchase Orders</option>
                  <option>KYC</option>
                  <option>Payments</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-audit__compliance">
            <h3 className="font-headline-sm">Compliance Health</h3>
            <p className="font-body-md">
              Your enterprise audit coverage is currently at 100% for the Q4 cycle.
            </p>
            <div className="admin-audit__compliance-bar">
              <div className="admin-audit__compliance-bar-fill" style={{ width: "100%" }} />
            </div>
            <span className="font-label-sm admin-audit__compliance-tag">Verified</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
