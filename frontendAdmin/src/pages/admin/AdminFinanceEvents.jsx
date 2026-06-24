import { useState, useEffect, useCallback } from "react";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";

const TYPE_META = {
  INVOICE_APPROVED: { label: 'Invoice Approved', icon: 'check_circle', color: '#2563eb' },
  INVOICE_PAID:     { label: 'Invoice Paid',     icon: 'payments',     color: '#16a34a' },
  INVOICE_REJECTED: { label: 'Invoice Rejected', icon: 'cancel',       color: '#dc2626' },
  PO_ISSUED:        { label: 'PO Issued',         icon: 'receipt_long', color: '#7c3aed' },
  PO_FULFILLED:     { label: 'PO Fulfilled',      icon: 'inventory',    color: '#16a34a' },
  PAYMENT_RECORDED: { label: 'Payment Recorded',  icon: 'account_balance_wallet', color: '#0891b2' },
};

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtAmount = (n, cur = 'INR') => n != null ? `${cur} ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';

// Utility: convert array of objects to CSV blob and trigger download
function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(',');
  const body = rows.map(r => keys.map(k => {
    const v = r[k] ?? '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  }).join(',')).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminFinanceEvents() {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/finance-events?limit=200', { headers }),
        fetch('http://localhost:5000/api/v1/finance-events/summary', { headers }),
      ]);
      const [eData, sData] = await Promise.all([eRes.json(), sRes.json()]);
      setEvents(eData.data ?? []);
      setSummary(sData.data ?? null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = typeFilter === 'ALL' ? events : events.filter(e => e.type === typeFilter);

  const handleExport = () => {
    const rows = filtered.map(e => ({
      id: e.id,
      type: e.type,
      entityType: e.entityType,
      entityId: e.entityId,
      vendorId: e.vendorId ?? '',
      amount: e.amount ?? '',
      currency: e.currency ?? '',
      webhookSent: e.webhookSent,
      webhookAt: e.webhookAt ?? '',
      createdAt: e.createdAt,
    }));
    downloadCsv(rows, `finance-events-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const columns = [
    {
      key: 'type', header: 'Event Type',
      render: r => {
        const m = TYPE_META[r.type] ?? { label: r.type, icon: 'info', color: '#6b7280' };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: m.color, fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.label}</span>
          </div>
        );
      }
    },
    { key: 'entityType', header: 'Entity', render: r => <span style={{ fontSize: 11, color: '#6b7280' }}>{r.entityType}<br /><span style={{ color: '#9ca3af' }}>{r.entityId?.slice(0, 8)}…</span></span> },
    { key: 'amount', header: 'Amount', render: r => r.amount ? <strong>{fmtAmount(r.amount, r.currency)}</strong> : <span style={{ color: '#9ca3af' }}>—</span> },
    {
      key: 'webhook', header: 'Webhook',
      render: r => (
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: r.webhookSent ? '#dcfce7' : '#f3f4f6', color: r.webhookSent ? '#166534' : '#6b7280' }}>
          {r.webhookSent ? 'Sent' : 'Pending'}
        </span>
      )
    },
    { key: 'createdAt', header: 'Timestamp', render: r => <span style={{ fontSize: 11, color: '#6b7280' }}>{fmt(r.createdAt)}</span> },
  ];

  return (
    <AdminLayout searchPlaceholder="Search finance events...">
      <div className="admin-page">
        <PageHeader
          title="Finance Event Log"
          subtitle="Track all financial events — invoice approvals, payments, PO fulfillments, and webhook dispatch status."
          actions={
            <button className="admin-btn admin-btn--outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
              Export CSV
            </button>
          }
        />

        {/* Summary stats */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard label="Total Events" value={events.length.toString()} accentColor="#b51b1e" />
            <StatCard label="Total Paid Volume" value={`₹${Number(summary.totalPaidAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} accentColor="#16a34a" />
            <StatCard label="Webhooks Sent" value={summary.webhookStats.sent.toString()} accentColor="#2563eb" />
            <StatCard label="Webhooks Pending" value={summary.webhookStats.pending.toString()} accentColor={summary.webhookStats.pending > 0 ? '#d97706' : '#6b7280'} />
          </div>
        )}

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {['ALL', ...Object.keys(TYPE_META)].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: typeFilter === t ? `2px solid ${TYPE_META[t]?.color ?? 'var(--admin-primary)'}` : '1px solid var(--admin-outline-variant)',
                background: typeFilter === t ? (TYPE_META[t]?.color ?? 'var(--admin-primary)') + '18' : 'transparent',
                color: typeFilter === t ? (TYPE_META[t]?.color ?? 'var(--admin-primary)') : 'var(--admin-secondary)' }}>
              {t === 'ALL' ? 'All Events' : (TYPE_META[t]?.label ?? t)}
            </button>
          ))}
        </div>

        <div className="admin-card">
          {loading
            ? <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading finance events...</div>
            : <DataTable columns={columns} data={filtered} />}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>receipt_long</span>
              No finance events yet. Events are recorded when invoices are approved/paid, POs are fulfilled, and payments are recorded.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
