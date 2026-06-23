import { useState, useEffect } from "react";
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

const ACTIVITY_BARS = [40, 70, 30, 90, 55, 80, 35, 60];

const columns = [
  {
    key: "timestamp",
    header: "Timestamp",
    render: (r) => <span className="admin-audit__timestamp">{new Date(r.createdAt).toLocaleString()}</span>,
  },
  {
    key: "admin",
    header: "User",
    render: (r) => (
      <div className="admin-audit__admin">
        <span className="admin-audit__avatar">{(r.user?.email || '?').substring(0,2).toUpperCase()}</span>
        <div>
          <p className="admin-audit__admin-name">{r.user?.email || 'System'}</p>
          <p className="admin-audit__admin-role">{r.user?.role || 'SYSTEM'}</p>
        </div>
      </div>
    ),
  },
  { key: "action", header: "Action" },
  {
    key: "entity",
    header: "Entity",
    render: (r) => <span className="admin-audit__target">{r.entity}</span>,
  },
  {
    key: "entityId",
    header: "Entity ID",
    render: (r) => <strong className="admin-audit__target">{r.entityId?.slice(0, 8) || 'N/A'}...</strong>,
  },
];

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/v1/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setLogs(data.items ?? data ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
          <StatCard label="Total Activities" value={logs.length.toString()} subValue="+12% vs last mo" subValueType="success" />
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
            data={logs}
            footer={
              <>
                <span className="admin-audit__footer-text">Showing {logs.length} logs</span>
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
