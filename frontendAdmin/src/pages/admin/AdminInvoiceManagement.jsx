import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import "./admin-tokens.css";
import "./AdminInvoiceManagement.css";

const CHECK_ICON = { PASS: { icon: 'check_circle', color: '#16a34a', bg: '#f0fdf4', label: 'Pass' }, FAIL: { icon: 'cancel', color: '#dc2626', bg: '#fef2f2', label: 'Fail' }, NO_PO: { icon: 'info', color: '#6b7280', bg: '#f9fafb', label: 'No PO linked' }, NO_WO: { icon: 'info', color: '#6b7280', bg: '#f9fafb', label: 'No work orders' } };

export default function AdminInvoiceManagement() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/invoices?limit=100", { headers });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const { data } = await res.json();
      setInvoices(data ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openInvoice = async (row) => {
    setSelected(row);
    setMatch(null);
    setError('');
    setNotes('');
    if (row.purchaseOrderId) {
      setMatchLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/v1/invoices/${row.id}/match-check`, { headers });
        const d = await res.json();
        setMatch(d.data);
      } catch (e) { console.error(e); }
      finally { setMatchLoading(false); }
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/invoices/${selected.id}/status`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to update status');
      setInvoices(prev => prev.map(inv => inv.id === selected.id ? { ...inv, status: newStatus } : inv));
      setSelected(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const filtered = invoices.filter(i => {
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchSearch = !search || i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || i.vendor?.businessName?.toLowerCase().includes(search.toLowerCase()) || i.purchaseOrder?.poNumber?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const columns = [
    { key: "invoiceNumber", header: "Invoice ID", render: (r) => <span className="admin-invoice-mgmt__id">#{r.invoiceNumber}</span> },
    {
      key: "vendor", header: "Vendor",
      render: (r) => (
        <div className="admin-invoice-mgmt__vendor">
          <span className="admin-invoice-mgmt__avatar">{(r.vendor?.businessName || '?').substring(0, 2).toUpperCase()}</span>
          {r.vendor?.businessName || 'Unknown Vendor'}
        </div>
      ),
    },
    { key: "poNumber", header: "PO Reference", render: (r) => r.purchaseOrder?.poNumber || <span style={{ color: '#9ca3af' }}>No PO</span> },
    { key: "amount", header: "Amount", render: (r) => <strong>{r.currency} {parseFloat(r.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> },
    { key: "due", header: "Due Date", render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} label={r.status.replace('_', ' ')} /> },
    {
      key: "match", header: "PO Match",
      render: (r) => r.purchaseOrderId
        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Linked</span>
        : <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>,
    },
  ];

  return (
    <AdminLayout searchPlaceholder="Search invoices...">
      <div className="admin-page admin-invoice-mgmt">
        <PageHeader
          title="Invoice Management"
          subtitle="Track, review, and process vendor billing with 3-way PO matching."
        />

        <div className="admin-invoice-mgmt__stats">
          <StatCard label="Total Invoices" value={invoices.length.toString()} accentColor="#b51b1e" />
          <StatCard label="Pending Review" value={invoices.filter(i => i.status === 'SUBMITTED').length.toString()} accentColor="#caa802" />
          <StatCard label="Approved" value={invoices.filter(i => i.status === 'APPROVED').length.toString()} accentColor="#2563eb" />
          <StatCard label="Paid" value={invoices.filter(i => i.status === 'PAID').length.toString()} accentColor="#16a34a" />
        </div>

        {/* Toolbar */}
        <div className="admin-card admin-invoice-mgmt__toolbar" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 20px', marginBottom: 16 }}>
          <input className="admin-input" placeholder="Search invoice, vendor, PO..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID', 'PARTIAL_PAID'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '6px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: statusFilter === s ? '2px solid var(--admin-primary)' : '1px solid var(--admin-outline-variant)', background: statusFilter === s ? 'var(--admin-primary)' : 'transparent', color: statusFilter === s ? '#fff' : 'var(--admin-secondary)' }}>
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-card admin-invoice-mgmt__table-card">
          {loading ? <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Loading invoices...</div> : (
            <DataTable columns={columns} data={filtered} onRowClick={openInvoice} />
          )}
          {!loading && filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No invoices found.</div>}
        </div>

        {/* Invoice Verification Modal */}
        <Modal
          open={!!selected}
          onClose={() => { setSelected(null); setMatch(null); setError(''); }}
          title={selected ? `Invoice Verification — #${selected.invoiceNumber}` : ""}
          size="lg"
          footer={
            selected && (
              <>
                <button className="admin-btn admin-btn--outline" onClick={() => { setSelected(null); setMatch(null); }}>Close</button>
                {!['REJECTED', 'PAID'].includes(selected.status) && (
                  <button className="admin-btn admin-btn--danger" onClick={() => handleStatusChange('REJECTED')} disabled={saving}>Reject</button>
                )}
                {!['APPROVED', 'PAID', 'REJECTED'].includes(selected.status) && (
                  <button
                    className="admin-btn admin-btn--primary"
                    onClick={() => handleStatusChange('APPROVED')}
                    disabled={saving || (match && !match.overallPass)}
                    title={match && !match.overallPass ? '3-way match failed — resolve issues before approving' : ''}
                  >
                    {saving ? 'Saving...' : '✓ Approve Invoice'}
                  </button>
                )}
                {selected.status === 'APPROVED' && (
                  <button className="admin-btn admin-btn--primary" onClick={() => handleStatusChange('PAID')} disabled={saving}>
                    Mark as Paid
                  </button>
                )}
              </>
            )
          }
        >
          {selected && (
            <div className="admin-invoice-verify">
              {/* Summary row */}
              <div className="admin-invoice-verify__stats">
                <div><span className="admin-label">Invoice Amount</span><p style={{ fontWeight: 700, fontSize: 18 }}>{selected.currency} {parseFloat(selected.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></div>
                <div><span className="admin-label">Vendor</span><p>{selected.vendor?.businessName}</p></div>
                <div><span className="admin-label">PO Reference</span><p>{selected.purchaseOrder?.poNumber ?? '—'}</p></div>
                <div><span className="admin-label">Status</span><StatusBadge status={selected.status.toLowerCase()} label={selected.status.replace('_', ' ')} /></div>
              </div>

              {/* 3-way Match Panel */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontFamily: 'Manrope', fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fact_check</span>
                  3-Way Match Verification
                </h4>

                {!selected.purchaseOrderId && (
                  <div style={{ padding: 14, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>info</span>
                    No PO linked — match validation skipped. You can still approve this invoice manually.
                  </div>
                )}

                {matchLoading && <div style={{ padding: 14, color: '#6b7280', fontSize: 13 }}>Running match check...</div>}

                {match && !matchLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Overall banner */}
                    <div style={{ padding: '12px 16px', borderRadius: 10, background: match.overallPass ? '#f0fdf4' : '#fef2f2', border: `1px solid ${match.overallPass ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="material-symbols-outlined" style={{ color: match.overallPass ? '#16a34a' : '#dc2626', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>
                        {match.overallPass ? 'verified' : 'error'}
                      </span>
                      <div>
                        <p style={{ fontWeight: 700, color: match.overallPass ? '#15803d' : '#b91c1c', fontSize: 14 }}>
                          {match.overallPass ? 'Match Passed — Safe to Approve' : 'Match Failed — Resolve Issues Before Approving'}
                        </p>
                        {!match.overallPass && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Approving is blocked until all checks pass.</p>}
                      </div>
                    </div>

                    {/* Check 1: Amount */}
                    {(() => {
                      const c = CHECK_ICON[match.amountCheck];
                      return (
                        <div style={{ padding: '12px 16px', borderRadius: 10, background: c.bg, border: `1px solid ${match.amountCheck === 'PASS' ? '#bbf7d0' : match.amountCheck === 'FAIL' ? '#fecaca' : '#e5e7eb'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-symbols-outlined" style={{ color: c.color, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>Check 1: Invoice vs PO Amount (5% buffer)</p>
                              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                Invoice: {selected.currency} {match.invoiceAmount.toLocaleString('en-IN')} &nbsp;|&nbsp;
                                PO: {selected.currency} {match.poAmount?.toLocaleString('en-IN')} &nbsp;|&nbsp;
                                Delta: {match.amountDelta !== null ? `${match.amountDelta >= 0 ? '+' : ''}${match.amountDelta.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.label}</span>
                        </div>
                      );
                    })()}

                    {/* Check 2: Work Orders */}
                    {(() => {
                      const c = CHECK_ICON[match.woCheck];
                      return (
                        <div style={{ padding: '12px 16px', borderRadius: 10, background: c.bg, border: `1px solid ${match.woCheck === 'PASS' ? '#bbf7d0' : match.woCheck === 'FAIL' ? '#fecaca' : '#e5e7eb'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: match.workOrders.length > 0 ? 10 : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="material-symbols-outlined" style={{ color: c.color, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>Check 2: All Work Orders Completed</p>
                                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{match.workOrders.length} work order{match.workOrders.length !== 1 ? 's' : ''} under this PO</p>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.label}</span>
                          </div>
                          {match.workOrders.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 30 }}>
                              {match.workOrders.map(wo => (
                                <div key={wo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: wo.pass ? '#16a34a' : '#dc2626', fontVariationSettings: "'FILL' 1" }}>
                                    {wo.pass ? 'check_circle' : 'cancel'}
                                  </span>
                                  <span style={{ fontWeight: 600, color: '#374151' }}>{wo.woNumber}</span>
                                  <span style={{ padding: '1px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 700, background: wo.pass ? '#dcfce7' : '#fee2e2', color: wo.pass ? '#166534' : '#991b1b' }}>
                                    {wo.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Line items */}
              <h4 className="admin-invoice-verify__section-title">Line-Item Reconciliation</h4>
              <table className="admin-invoice-verify__table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lines?.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.description}</strong></td>
                      <td>{r.quantity}</td>
                      <td>{selected.currency} {parseFloat(r.unitPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td>{selected.currency} {parseFloat(r.totalPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!selected.lines || selected.lines.length === 0) && <p style={{ color: '#6b7280', fontSize: 13, marginTop: 10 }}>No line items specified.</p>}

              {/* Error from backend */}
              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>error</span>
                  {error}
                </div>
              )}

              <span className="admin-label" style={{ marginTop: 18, display: "block" }}>Review Notes</span>
              <textarea className="admin-input" rows={3} placeholder="Add internal validation notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
