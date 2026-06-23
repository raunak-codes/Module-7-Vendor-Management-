import { useState, useEffect } from "react";
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
  { key: "id", header: "Invoice/Payment ID", render: (r) => <span className="admin-payments__id">{r.invoiceNumber}</span> },
  {
    key: "vendor",
    header: "Vendor",
    render: (r) => (
      <div className="admin-payments__vendor">
        <span className="admin-payments__avatar">{(r.vendor?.businessName || '?').substring(0, 2).toUpperCase()}</span>
        <div>
          <p className="admin-payments__vendor-name">{r.vendor?.businessName}</p>
        </div>
      </div>
    ),
  },
  { key: "amount", header: "Amount", render: (r) => <strong>{r.currency} {parseFloat(r.totalAmount).toLocaleString()}</strong> },
  { key: "date", header: "Date", render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A' },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} label={r.status} /> },
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
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/v1/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setTransactions(data?.items ?? data ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotal = (status) => {
    return transactions.filter(t => t.status === status).reduce((acc, t) => acc + parseFloat(t.totalAmount), 0).toLocaleString();
  };

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
          <StatCard label="Pending Settlements" value={`INR ${calculateTotal('APPROVED')}`} subValue="Ready to Pay" subValueType="warning" icon="pending_actions" accentLeft />
          <StatCard label="Successfully Disbursed" value={`INR ${calculateTotal('PAID')}`} subValue="Completed" subValueType="success" icon="check_circle" accentLeft />
          <StatCard label="Payment Failures" value={`INR ${calculateTotal('REJECTED')}`} subValue="Action Required" subValueType="error" icon="report" accentLeft />
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
            data={transactions}
            footer={
              <>
                <span className="admin-payments__footer-text">Showing {transactions.length} transactions</span>
                <div className="admin-vendor-dir__pagination">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
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
