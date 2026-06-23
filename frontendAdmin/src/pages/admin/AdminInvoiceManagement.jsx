import React, { useState, useEffect } from "react";
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

const AdminInvoiceManagement = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/v1/invoices", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const { data } = await res.json();
      setInvoices(data.items ?? data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/v1/invoices/${selected.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error(`Failed to update status`);
      setInvoices(prev => prev.map(inv => inv.id === selected.id ? { ...inv, status: newStatus } : inv));
      setSelected({ ...selected, status: newStatus });
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { key: "invoiceNumber", header: "Invoice ID", render: (r) => <span className="admin-invoice-mgmt__id">#{r.invoiceNumber}</span> },
    {
      key: "vendor",
      header: "Vendor Name",
      render: (r) => (
        <div className="admin-invoice-mgmt__vendor">
          <span className="admin-invoice-mgmt__avatar">{(r.vendor?.businessName || '?').substring(0, 2).toUpperCase()}</span>
          {r.vendor?.businessName || 'Unknown Vendor'}
        </div>
      ),
    },
    { key: "poNumber", header: "PO Reference", render: (r) => r.purchaseOrder?.poNumber || 'N/A' },
    { key: "amount", header: "Amount", render: (r) => <strong>{r.currency} {parseFloat(r.totalAmount).toLocaleString()}</strong> },
    { key: "due", header: "Due Date", render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A' },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} label={r.status} /> },
  ];

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading invoices...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;

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
        <StatCard label="Total Invoices" value={invoices.length.toString()} accentColor="#b51b1e" />
        <StatCard label="Pending Review" value={invoices.filter(i => i.status === 'SUBMITTED' || i.status === 'DRAFT').length.toString()} accentColor="#caa802" />
        <StatCard label="Paid" value={invoices.filter(i => i.status === 'PAID').length.toString()} accentColor="#1f8b4c" />
        <StatCard label="Rejected" value={invoices.filter(i => i.status === 'REJECTED').length.toString()} accentColor="#ba1a1a" />
      </div>

      <div className="admin-card admin-invoice-mgmt__toolbar">
        <input className="admin-input" placeholder="Search Invoice ID or Vendor..." />
      </div>

      <div className="admin-card admin-invoice-mgmt__table-card">
        <DataTable columns={columns} data={invoices} onRowClick={(row) => setSelected(row)} />
        {invoices.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No invoices found.</div>}
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
        title={selected ? `Invoice Verification — #${selected.invoiceNumber}` : ""}
        size="lg"
        footer={
          selected && (
            <>
              <button className="admin-btn admin-btn--outline" onClick={() => setSelected(null)}>
                Close
              </button>
              {selected.status !== 'REJECTED' && selected.status !== 'PAID' && (
                <button className="admin-btn admin-btn--danger" onClick={() => handleStatusChange('REJECTED')}>Reject</button>
              )}
              {selected.status !== 'APPROVED' && selected.status !== 'PAID' && selected.status !== 'REJECTED' && (
                <button className="admin-btn admin-btn--primary" onClick={() => handleStatusChange('APPROVED')}>✓ Approve Invoice</button>
              )}
              {selected.status === 'APPROVED' && (
                <button className="admin-btn admin-btn--primary" onClick={() => handleStatusChange('PAID')}>Mark as Paid</button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="admin-invoice-verify">
            <div className="admin-invoice-verify__stats">
              <div>
                <span className="admin-label">Invoice Amount</span>
                <p>{selected.currency} {parseFloat(selected.totalAmount).toLocaleString()}</p>
              </div>
              <div>
                <span className="admin-label">Vendor</span>
                <p>{selected.vendor?.businessName}</p>
              </div>
              <div>
                <span className="admin-label">Status</span>
                <p>{selected.status}</p>
              </div>
            </div>

            <h4 className="admin-invoice-verify__section-title">Line-Item Reconciliation</h4>
            <table className="admin-invoice-verify__table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Quantity</th>
                  <th>Unit Rate</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {selected.lines?.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.description}</strong>
                    </td>
                    <td>{r.quantity}</td>
                    <td>{selected.currency} {parseFloat(r.unitPrice).toLocaleString()}</td>
                    <td>{selected.currency} {parseFloat(r.totalPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!selected.lines || selected.lines.length === 0) && <p style={{ color: '#6b7280', fontSize: 13, marginTop: 10 }}>No line items specified.</p>}

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