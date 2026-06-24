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


export default function AdminPaymentManagement() {
  const [transactions, setTransactions] = useState([]);
  const [paymentModal, setPaymentModal] = useState(null); // invoice to pay
  const [payForm, setPayForm] = useState({ amountPaid: '', txnRef: '', paymentMethod: 'Bank Transfer', notes: '' });
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/invoices?limit=100', { headers });
      if (res.ok) {
        const { data } = await res.json();
        setTransactions(data ?? []);
      }
    } catch (e) { console.error(e); }
  };

  const openPaymentModal = (invoice) => {
    setPaymentModal(invoice);
    setPayForm({ amountPaid: String(parseFloat(invoice.totalAmount)), txnRef: '', paymentMethod: 'Bank Transfer', notes: '' });
  };

  const recordPayment = async () => {
    if (!paymentModal || !payForm.amountPaid) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/invoices/${paymentModal.id}/payments`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: parseFloat(payForm.amountPaid), txnRef: payForm.txnRef || undefined, paymentMethod: payForm.paymentMethod || undefined, notes: payForm.notes || undefined }),
      });
      if (res.ok) { setPaymentModal(null); fetchInvoices(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const calculateTotal = (status) =>
    transactions.filter(t => t.status === status).reduce((a, t) => a + parseFloat(t.totalAmount ?? 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const columns = [
    { key: "id", header: "Invoice ID", render: (r) => <span className="admin-payments__id">{r.invoiceNumber}</span> },
    {
      key: "vendor", header: "Vendor",
      render: (r) => (
        <div className="admin-payments__vendor">
          <span className="admin-payments__avatar">{(r.vendor?.businessName || '?').substring(0, 2).toUpperCase()}</span>
          <p className="admin-payments__vendor-name">{r.vendor?.businessName}</p>
        </div>
      ),
    },
    { key: "po", header: "PO Ref", render: (r) => <span style={{ fontSize: 13, color: '#6b7280' }}>{r.purchaseOrder?.poNumber ?? '—'}</span> },
    { key: "amount", header: "Amount", render: (r) => <strong>{r.currency} {parseFloat(r.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> },
    { key: "date", header: "Submitted", render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} label={r.status.replace('_', ' ')} /> },
    {
      key: "action", header: "Action", align: "right",
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {['APPROVED', 'PARTIAL_PAID'].includes(r.status) && (
            <button className="admin-btn admin-btn--primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => openPaymentModal(r)}>
              Record Payment
            </button>
          )}
          {r.status === 'SUBMITTED' && (
            <button className="admin-btn admin-btn--outline" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={async () => { await fetch(`http://localhost:5000/api/v1/invoices/${r.id}/status`, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED' }) }); fetchInvoices(); }}>
              Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout searchPlaceholder="Search transactions, vendors or payment IDs...">
      <div className="admin-page admin-payments">
        <PageHeader
          title="Payment Management"
          subtitle="Oversee enterprise-wide financial distributions and settlement status."
          actions={
            <button className="admin-btn admin-btn--outline">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>file_download</span>
              Export
            </button>
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
            {(() => {
              // Build last-6-months timeline from real invoice data
              const months = [];
              const now = new Date();
              for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push({ month: d.toLocaleString('en', { month: 'short' }), year: d.getFullYear(), m: d.getMonth() });
              }
              const totals = months.map(m => ({
                ...m,
                actual: transactions
                  .filter(t => { const d = new Date(t.createdAt); return d.getMonth() === m.m && d.getFullYear() === m.year; })
                  .reduce((a, t) => a + parseFloat(t.totalAmount || 0), 0),
              }));
              const max = Math.max(...totals.map(t => t.actual), 1);
              return totals.map((t) => (
                <div className="admin-payments__bar-col" key={t.month + t.year}>
                  <div className="admin-payments__bar-track">
                    <div className="admin-payments__bar-actual" style={{ height: `${Math.round((t.actual / max) * 100)}%` }} />
                  </div>
                  <span className="font-label-sm">{t.month}</span>
                </div>
              ));
            })()}
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

        <button className="admin-fab" aria-label="New payment" onClick={() => {}}>
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      {/* Record Payment Modal */}
      {paymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Record Payment</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Invoice: <strong>{paymentModal.invoiceNumber}</strong> &mdash; {paymentModal.vendor?.businessName}</p>

            <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#374151' }}>Invoice Total</span>
              <span style={{ fontWeight: 700 }}>{paymentModal.currency} {parseFloat(paymentModal.totalAmount).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Amount to Pay *', key: 'amountPaid', type: 'number', placeholder: '0.00' },
                { label: 'Transaction Reference', key: 'txnRef', type: 'text', placeholder: 'TXN12345 / UTR number' },
                { label: 'Notes', key: 'notes', type: 'text', placeholder: 'Optional notes...' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>{label}</label>
                  <input type={type} value={payForm[key]} onChange={e => setPayForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Payment Method</label>
                <select value={payForm.paymentMethod} onChange={e => setPayForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}>
                  {['Bank Transfer', 'NEFT', 'RTGS', 'IMPS', 'Cheque', 'Cash', 'UPI'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setPaymentModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={recordPayment} disabled={saving || !payForm.amountPaid}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: 'var(--admin-primary)', color: '#fff', cursor: 'pointer', fontWeight: 700, opacity: !payForm.amountPaid ? 0.5 : 1 }}>
                {saving ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
