import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import "./admin-tokens.css";
import "./AdminPurchaseOrderManagement.css";

const TIER_LABEL = { TIER_1: '< ₹1k · Auto', TIER_2: '₹1k–₹10k · PM', TIER_3: '> ₹10k · Finance' };
const TIER_COLOR = { TIER_1: '#16a34a', TIER_2: '#d97706', TIER_3: '#dc2626' };

export default function AdminPurchaseOrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('all'); // 'all' | 'pending'
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        fetch("http://localhost:5000/api/v1/purchase-orders?limit=100", { headers }),
        fetch("http://localhost:5000/api/v1/purchase-orders/pending-approval", { headers }),
      ]);
      const allData = await allRes.json();
      const pendingData = await pendingRes.json();
      setOrders(allData.data ?? []);
      setPending(pendingData.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    setSaving(true);
    try {
      await fetch(`http://localhost:5000/api/v1/purchase-orders/${id}/approve`, { method: 'PATCH', headers });
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const rejectApproval = async () => {
    if (!rejectModal) return;
    setSaving(true);
    try {
      await fetch(`http://localhost:5000/api/v1/purchase-orders/${rejectModal}/reject-approval`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason || 'No reason provided' }),
      });
      setRejectModal(null);
      setRejectReason('');
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: "poNumber", header: "PO ID", render: (r) => <span className="admin-po-mgmt__id">#{r.poNumber}</span> },
    {
      key: "vendor", header: "Vendor",
      render: (r) => (
        <div className="admin-po-mgmt__vendor">
          <span className="admin-po-mgmt__avatar">{(r.vendor?.businessName || '??').substring(0, 2).toUpperCase()}</span>
          {r.vendor?.businessName || 'Unknown'}
        </div>
      ),
    },
    { key: "amount", header: "Amount", render: (r) => <strong>{r.currency} {parseFloat(r.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> },
    {
      key: "tier", header: "Approval Tier",
      render: (r) => r.approvalTier ? (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, background: `${TIER_COLOR[r.approvalTier]}18`, color: TIER_COLOR[r.approvalTier] }}>
          {TIER_LABEL[r.approvalTier]}
        </span>
      ) : '—',
    },
    {
      key: "approvalStatus", header: "Approval",
      render: (r) => {
        const colors = { PENDING: '#d97706', AUTO_APPROVED: '#16a34a', APPROVED: '#16a34a', REJECTED: '#dc2626' };
        const c = colors[r.approvalStatus] ?? '#6b7280';
        return <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{r.approvalStatus?.replace('_', ' ')}</span>;
      },
    },
    { key: "status", header: "PO Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} label={r.status.replace('_', ' ')} /> },
    { key: "date", header: "Created", render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
    {
      key: "actions", header: "Actions", align: "right",
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button className="admin-btn admin-btn--ghost" onClick={(e) => { e.stopPropagation(); navigate(`/admin/purchase-orders/${r.id}`); }}>View</button>
        </div>
      ),
    },
  ];

  const pendingColumns = [
    { key: "poNumber", header: "PO ID", render: (r) => <span className="admin-po-mgmt__id">#{r.poNumber}</span> },
    {
      key: "vendor", header: "Vendor",
      render: (r) => (
        <div className="admin-po-mgmt__vendor">
          <span className="admin-po-mgmt__avatar">{(r.vendor?.businessName || '??').substring(0, 2).toUpperCase()}</span>
          <div>
            <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{r.vendor?.businessName}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{r.vendor?.category?.name}</p>
          </div>
        </div>
      ),
    },
    { key: "amount", header: "Amount", render: (r) => <strong style={{ fontSize: 15 }}>{r.currency} {parseFloat(r.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> },
    {
      key: "tier", header: "Required Approver",
      render: (r) => r.approvalTier ? (
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: `${TIER_COLOR[r.approvalTier]}18`, color: TIER_COLOR[r.approvalTier] }}>
          {TIER_LABEL[r.approvalTier]}
        </span>
      ) : '—',
    },
    { key: "items", header: "Items", render: (r) => `${r.lines?.length ?? 0} line item${r.lines?.length !== 1 ? 's' : ''}` },
    { key: "created", header: "Waiting Since", render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
    {
      key: "actions", header: "Actions", align: "right",
      render: (r) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={(e) => { e.stopPropagation(); setRejectModal(r.id); setRejectReason(''); }}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            Reject
          </button>
          <button onClick={(e) => { e.stopPropagation(); approve(r.id); }} disabled={saving}
            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'var(--admin-primary)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Approve & Issue
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout searchPlaceholder="Search purchase orders...">
      <div className="admin-page admin-po-mgmt">
        <PageHeader
          breadcrumb={[{ label: "Financials" }, { label: "Purchase Orders" }]}
          title="Purchase Order Management"
          subtitle="Review and authorize procurement across global event portfolios."
          actions={
            <button className="admin-btn admin-btn--primary" onClick={() => navigate("/admin/purchase-orders/new")}>
              + Create Purchase Order
            </button>
          }
        />

        <div className="admin-po-mgmt__stats">
          <StatCard label="Total Orders" value={orders.length.toString()} accentColor="#b51b1e" />
          <StatCard label="Pending Approval" value={pending.length.toString()} accentColor="#d97706"
            subValue={pending.length > 0 ? "Requires action" : "All clear"} subValueType={pending.length > 0 ? "warning" : "success"} />
          <StatCard label="Issued / Active" value={orders.filter(o => ['ISSUED', 'ACCEPTED'].includes(o.status)).length.toString()} accentColor="#2563eb" />
          <StatCard label="Fulfilled" value={orders.filter(o => o.status === 'FULFILLED').length.toString()} accentColor="#16a34a" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--admin-surface-container)' }}>
          {[['all', 'All Purchase Orders'], ['pending', `Pending Approval${pending.length > 0 ? ` (${pending.length})` : ''}`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                color: tab === key ? 'var(--admin-primary)' : 'var(--admin-secondary)',
                borderBottom: tab === key ? '2px solid var(--admin-primary)' : '2px solid transparent',
                position: 'relative', bottom: -1 }}>
              {label}
              {key === 'pending' && pending.length > 0 && (
                <span style={{ marginLeft: 6, background: '#dc2626', color: '#fff', borderRadius: 9999, fontSize: 10, fontWeight: 800, padding: '1px 6px' }}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* All POs table */}
        {tab === 'all' && (
          <div className="admin-card admin-po-mgmt__table-card">
            <div className="admin-po-mgmt__panel-head">
              <h3 className="admin-section-title">All Purchase Orders</h3>
            </div>
            {loading ? <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Loading...</div> : (
              <DataTable
                columns={columns}
                data={orders}
                onRowClick={(row) => navigate(`/admin/purchase-orders/${row.id}`)}
                footer={<span className="admin-po-mgmt__footer-text">Showing {orders.length} entries</span>}
              />
            )}
            {!loading && orders.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No purchase orders found.</div>}
          </div>
        )}

        {/* Pending Approval queue */}
        {tab === 'pending' && (
          <div className="admin-card admin-po-mgmt__table-card">
            <div className="admin-po-mgmt__panel-head">
              <h3 className="admin-section-title">Pending Approval Queue</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                These POs are awaiting authorization before being dispatched to vendors.
                POs over ₹1,000 require Procurement Manager approval; over ₹10,000 require Finance/Owner sign-off.
              </p>
            </div>

            {/* Tier legend */}
            <div style={{ display: 'flex', gap: 16, padding: '12px 20px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {Object.entries(TIER_LABEL).map(([tier, label]) => (
                <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_COLOR[tier], display: 'inline-block' }} />
                  <span style={{ color: '#374151', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>

            {loading ? <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Loading...</div> : (
              <DataTable
                columns={pendingColumns}
                data={pending}
                footer={<span className="admin-po-mgmt__footer-text">{pending.length} PO{pending.length !== 1 ? 's' : ''} awaiting approval</span>}
              />
            )}
            {!loading && pending.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#d1d5db', display: 'block', marginBottom: 12 }}>check_circle</span>
                <p style={{ fontWeight: 600, color: '#374151' }}>No POs pending approval</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>All purchase orders have been reviewed.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Reject Purchase Order</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Provide a reason for rejection. The PO will be cancelled and the admin team will be notified.</p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Rejection Reason</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Budget exceeded for this quarter, vendor not KYC-verified..." rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={rejectApproval} disabled={saving}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {saving ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
