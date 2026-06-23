import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import "./admin-tokens.css";
import "./AdminPaymentManagement.css";

/**
 * AdminPaymentManagement
 * Oversee enterprise-wide financial distributions and settlement status.
 * Matches Stitch screen: payment_management
 */

const TRANSACTIONS = [
  { id: "#PMT-99281", initials: "LS", vendor: "Luxe Soundscapes", category: "Audio/Visual", amount: "$12,500.00", date: "Oct 24, 2026", status: "paid" },
  { id: "#PMT-99275", initials: "RC", vendor: "Ritz Catering Co.", category: "Food & Beverage", amount: "$45,000.00", date: "Oct 22, 2026", status: "pending" },
  { id: "#PMT-99264", initials: "VF", vendor: "Velvet Floral Designs", category: "Decor", amount: "$3,400.00", date: "Oct 20, 2026", status: "failed" },
  { id: "#PMT-99250", initials: "SM", vendor: "Securitas Mgmt", category: "Logistics", amount: "$8,200.00", date: "Oct 18, 2026", status: "paid" },
];

const TIMELINE = [
  { month: "May", actual: 60, projected: 75 },
  { month: "Jun", actual: 65, projected: 80 },
  { month: "Jul", actual: 85, projected: 90 },
  { month: "Aug", actual: 50, projected: 70 },
  { month: "Sep", actual: 45, projected: 60 },
  { month: "Oct", actual: 70, projected: 85 },
  { month: "Nov", actual: 0, projected: 95 },
];

const columns = [
  { key: "id", header: "Payment ID", render: (r) => <span className="admin-payments__id">{r.id}</span> },
  {
    key: "vendor",
    header: "Vendor",
    render: (r) => (
      <div className="admin-payments__vendor">
        <span className="admin-payments__avatar">{r.initials}</span>
        <div>
          <p className="admin-payments__vendor-name">{r.vendor}</p>
          <p className="admin-payments__vendor-cat">{r.category}</p>
        </div>
      </div>
    ),
  },
  { key: "amount", header: "Amount", render: (r) => <strong>{r.amount}</strong> },
  { key: "date", header: "Date" },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  {
    key: "action",
    header: "Action",
    align: "right",
    render: () => (
      <button className="admin-btn admin-btn--ghost" aria-label="View payment">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
      </button>
    ),
  },
];

export default function AdminPaymentManagement() {
  const [page, setPage] = useState(1);

  return (
    <AdminLayout searchPlaceholder="Search transactions, vendors or payment IDs...">
      <div className="admin-page admin-payments">
        <PageHeader
          title="Payment Management"
          subtitle="Oversee enterprise-wide financial distributions and settlement status."
          actions={
            <>
              <button className="admin-btn admin-btn--outline">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>file_download</span>
                Export Payments
              </button>
              <button className="admin-btn admin-btn--danger">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock_open</span>
                Release Payment
              </button>
            </>
          }
        />

        <div className="admin-payments__stats">
          <StatCard label="Pending Settlements" value="$248,930.00" subValue="+12% vs last month" subValueType="warning" icon="pending_actions" accentLeft />
          <StatCard label="Successfully Disbursed" value="$1,102,450.50" subValue="On Schedule" subValueType="success" icon="check_circle" accentLeft />
          <StatCard label="Payment Failures" value="$12,400.00" subValue="Action Required" subValueType="error" icon="report" accentLeft />
        </div>

        <div className="admin-card admin-payments__table-card">
          <div className="admin-payments__panel-head">
            <h3 className="admin-section-title">Recent Transactions</h3>
            <div className="admin-payments__panel-actions">
              <button className="admin-btn admin-btn--ghost" aria-label="Filter">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
              </button>
              <button className="admin-btn admin-btn--ghost" aria-label="More">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
              </button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={TRANSACTIONS}
            footer={
              <>
                <span className="admin-payments__footer-text">Showing 4 of 248 transactions</span>
                <div className="admin-vendor-dir__pagination">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      className={p === page ? "admin-vendor-dir__page--active" : ""}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(3, p + 1))}>Next</button>
                </div>
              </>
            }
          />
        </div>

        <div className="admin-card admin-payments__timeline">
          <div className="admin-payments__panel-head">
            <h3 className="admin-section-title">Payment Timeline</h3>
            <div className="admin-payments__legend">
              <span><span className="admin-payments__legend-dot admin-payments__legend-dot--actual" /> Actual Paid</span>
              <span><span className="admin-payments__legend-dot admin-payments__legend-dot--projected" /> Projected</span>
            </div>
          </div>
          <div className="admin-payments__bars">
            {TIMELINE.map((t) => (
              <div className="admin-payments__bar-col" key={t.month}>
                <div className="admin-payments__bar-track">
                  <div className="admin-payments__bar-projected" style={{ height: `${t.projected}%` }} />
                  <div className="admin-payments__bar-actual" style={{ height: `${t.actual}%` }} />
                </div>
                <span className="font-label-sm">{t.month}</span>
              </div>
            ))}
          </div>
          <div className="admin-payments__timeline-footer">
            <p className="font-body-md">
              Note: Historical data reflects combined disbursements across all vendor categories.
              Projections for November are based on current work orders and service agreements.
            </p>
            <button className="admin-btn admin-btn--ghost">
              Detailed Forecast
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>
        </div>

        <button className="admin-fab" aria-label="New payment">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </AdminLayout>
  );
}
