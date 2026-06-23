import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import "./admin-tokens.css";
import "./AdminInvoiceManagement.css";

/**
 * AdminInvoiceManagement
 * List + review vendor invoices. Clicking a row opens the Invoice
 * Verification modal (reconciliation against the PO / work order).
 * Matches Stitch screens: invoice_management + invoice_verification
 */

const INVOICES = [
  { id: "INV-2026-001", vendor: "Luxury Linens Ltd", event: "The Ritz Gala 2026", amount: "$12,450.00", due: "Oct 25, 2026", status: "pending" },
  { id: "INV-2026-002", vendor: "Grand Atrium Catering", event: "Annual Tech Summit", amount: "$45,800.00", due: "Oct 18, 2026", status: "paid" },
  { id: "INV-2026-003", vendor: "Visionary Audio Visual", event: "Fashion Week Preview", amount: "$22,300.00", due: "Oct 30, 2026", status: "approved" },
  { id: "INV-2026-004", vendor: "Metro Logistics Pro", event: "Quarterly Partners Meet", amount: "$8,900.00", due: "Oct 12, 2026", status: "overdue" },
];

const RECONCILIATION = [
  { item: "LED Wall Panel Installation", status: "matching", poRate: "$5,000.00", invRate: "$5,000.00", variance: "$0.00" },
  { item: "Audio Mixer Console", status: "matching", poRate: "$25,000.00", invRate: "$25,000.00", variance: "$0.00" },
  { item: "Emergency Logistics Fee", status: "manual check", poRate: "$0.00", invRate: "$1,750.00", variance: "+$1,750.00", reason: "Unplanned shipping due to airport delay" },
];

const AdminInvoiceManagement = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");

  const columns = [
    { key: "id", header: "Invoice ID", render: (r) => <span className="admin-invoice-mgmt__id">#{r.id}</span> },
    {
      key: "vendor",
      header: "Vendor Name",
      render: (r) => (
        <div className="admin-invoice-mgmt__vendor">
          <span className="admin-invoice-mgmt__avatar" />
          {r.vendor}
        </div>
      ),
    },
    { key: "event", header: "Event Name" },
    { key: "amount", header: "Amount", render: (r) => <strong>{r.amount}</strong> },
    { key: "due", header: "Due Date" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AdminLayout searchPlaceholder="Search invoices...">
      <div className="admin-page admin-invoice-mgmt">
      <PageHeader
        title="Invoice Management"
        subtitle="Track, review, and process vendor billing across all events."
        actions={
          <button className="admin-btn admin-btn--primary" onClick={() => navigate("/admin/invoices/upload")}>
            📄 Upload New Invoice
          </button>
        }
      />

      <div className="admin-invoice-mgmt__stats">
        <StatCard label="Total Invoiced" value="$1.2M" trend="+8% vs LY" trendDirection="up" accentColor="#b51b1e" />
        <StatCard label="Pending Review" value="24" badge="High Priority" accentColor="#caa802" />
        <StatCard label="Approved / Paid" value="842" accentColor="#1f8b4c" />
        <StatCard label="Disputed" value="3" accentColor="#ba1a1a" />
      </div>

      <div className="admin-card admin-invoice-mgmt__toolbar">
        <input className="admin-input" placeholder="Search Invoice ID or Vendor..." />
        <select className="admin-select">
          <option>All Categories</option>
        </select>
        <select className="admin-select">
          <option>All Status</option>
        </select>
        <button className="admin-btn admin-btn--outline">📅 Oct 01 – Oct 31, 2026</button>
        <button className="admin-btn admin-btn--outline">⚙</button>
      </div>

      <div className="admin-card admin-invoice-mgmt__table-card">
        <DataTable columns={columns} data={INVOICES} onRowClick={(row) => setSelected(row)} />
        <div className="admin-invoice-mgmt__footer">
          <span>Showing 1-4 of 842 invoices</span>
          <div className="admin-vendor-dir__pagination">
            <button>‹</button>
            <button className="admin-vendor-dir__page--active">1</button>
            <button>2</button>
            <button>3</button>
            <span>…</span>
            <button>21</button>
            <button>›</button>
          </div>
        </div>
      </div>

      <div className="admin-invoice-mgmt__info-grid">
        <div className="admin-card admin-invoice-mgmt__info">
          <span className="admin-invoice-mgmt__info-icon">ℹ️</span>
          <div>
            <h4>Billing Guidelines</h4>
            <p>All invoices must be submitted within 30 days of event completion. Ensure tax IDs are visible for faster processing.</p>
          </div>
        </div>
        <div className="admin-card admin-invoice-mgmt__info">
          <span className="admin-invoice-mgmt__info-icon">🎧</span>
          <div>
            <h4>Payment Support</h4>
            <p>Facing issues with a dispute? Our vendor relations team is available 24/7 to assist with reconciliation.</p>
          </div>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Invoice Verification — #${selected.id}` : ""}
        size="lg"
        footer={
          selected && (
            <>
              <button className="admin-btn admin-btn--outline" onClick={() => setSelected(null)}>
                Close
              </button>
              <button className="admin-btn admin-btn--outline">Request Revision</button>
              <button className="admin-btn admin-btn--danger" onClick={() => setSelected(null)}>
                ✓ Approve Invoice
              </button>
            </>
          )
        }
      >
        {selected && (
          <div className="admin-invoice-verify">
            <div className="admin-invoice-verify__stats">
              <div>
                <span className="admin-label">Invoice Amount</span>
                <p>{selected.amount}</p>
              </div>
              <div>
                <span className="admin-label">Vendor</span>
                <p>{selected.vendor}</p>
              </div>
              <div>
                <span className="admin-label">Event</span>
                <p>{selected.event}</p>
              </div>
            </div>

            <h4 className="admin-invoice-verify__section-title">Line-Item Reconciliation</h4>
            <table className="admin-invoice-verify__table">
              <thead>
                <tr>
                  <th>Work Order Item</th>
                  <th>Status</th>
                  <th>PO Rate</th>
                  <th>Invoice Rate</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {RECONCILIATION.map((r) => (
                  <tr key={r.item}>
                    <td>
                      <strong className={r.status === "manual check" ? "admin-invoice-verify__flagged" : ""}>{r.item}</strong>
                      {r.reason && <p className="admin-invoice-verify__reason">Reason: {r.reason}</p>}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>{r.poRate}</td>
                    <td>{r.invRate}</td>
                    <td className={r.variance.startsWith("+") ? "admin-invoice-verify__variance-pos" : ""}>{r.variance}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <span className="admin-label" style={{ marginTop: 18, display: "block" }}>
              Review Notes
            </span>
            <textarea
              className="admin-input"
              rows={3}
              placeholder="Add internal validation notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
    </AdminLayout>
  );
};

export default AdminInvoiceManagement;