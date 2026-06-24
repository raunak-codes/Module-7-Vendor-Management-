import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadOutlined, EyeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  PAID:         { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  PARTIAL_PAID: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  SUBMITTED:    { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  APPROVED:     { bg: '#f5f3ff', color: '#6d28d9', dot: '#8b5cf6' },
  REJECTED:     { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
  DRAFT:        { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status.replace('_', ' ')}
    </span>
  );
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'payments' | 'invoices'>('payments');
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:5000/api/v1/invoices/payments/all', { headers }).then(r => r.json()),
      fetch('http://localhost:5000/api/v1/invoices', { headers }).then(r => r.json()),
    ]).then(([pData, iData]) => {
      setPayments(pData.data ?? []);
      setInvoices(iData.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amountPaid ?? 0), 0);
  const pendingAmount = invoices.filter(i => ['SUBMITTED', 'APPROVED'].includes(i.status)).reduce((s, i) => s + parseFloat(i.totalAmount ?? 0), 0);
  const totalInvoices = invoices.length;

  const filteredPayments = payments.filter(p =>
    !search || p.invoice?.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || p.txnRef?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredInvoices = invoices.filter(i =>
    !search || i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || i.purchaseOrder?.poNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 8 }}>Payment History</h1>
          <p style={{ fontSize: 16, color: 'var(--secondary)', maxWidth: 600 }}>Track every payment received and the lifecycle of all invoices submitted through EventHub360.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/finance/upload')} style={{ padding: '0 20px', height: 44, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            + New Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        {[
          { label: 'Total Received', value: `INR ${totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, icon: 'payments', iconBg: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Pending Payment', value: `INR ${pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, icon: 'pending_actions', iconBg: '#fffbeb', iconColor: '#d97706' },
          { label: 'Total Invoices', value: String(totalInvoices), icon: 'description', iconBg: '#eff6ff', iconColor: '#2563eb' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</p>
              <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{s.value}</h3>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-highest)', overflow: 'hidden' }}>
        {/* Tab bar + toolbar */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--surface-container)', background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            {([['payments', 'Payments Received'], ['invoices', 'All Invoices']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ padding: '16px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: tab === key ? 'var(--primary)' : 'var(--secondary)', borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, padding: '12px 0' }}>
            <div style={{ position: 'relative' }}>
              <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', zIndex: 1 }} />
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, paddingRight: 16, height: 36, border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', width: 220 }} />
            </div>
          </div>
        </div>

        {/* Payments tab */}
        {tab === 'payments' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
                {['Txn Reference', 'Invoice', 'PO Ref', 'Amount Paid', 'Method', 'Paid On', 'Notes'].map((h, i) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--secondary)' }}>Loading...</td></tr>}
              {!loading && filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline-variant)', display: 'block', marginBottom: 12 }}>payments</span>
                    <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>No payments received yet</p>
                    <p style={{ color: 'var(--secondary)', fontSize: 13, marginTop: 4 }}>Payments will appear here once an admin records them against your approved invoices.</p>
                  </td>
                </tr>
              )}
              {filteredPayments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--surface-container)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{p.txnRef ?? '—'}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13 }}>{p.invoice?.invoiceNumber ?? '—'}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)' }}>{p.invoice?.purchaseOrder?.poNumber ?? '—'}</td>
                  <td style={{ padding: '18px 20px', fontSize: 14, fontWeight: 700 }}>{p.currency} {parseFloat(p.amountPaid).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)' }}>{p.paymentMethod ?? '—'}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)' }}>{new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)', maxWidth: 200 }}>{p.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Invoices tab */}
        {tab === 'invoices' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
                {['Invoice No.', 'PO Ref', 'Date Issued', 'Due Date', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--secondary)' }}>Loading...</td></tr>}
              {!loading && filteredInvoices.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--secondary)' }}>No invoices found.</td></tr>
              )}
              {filteredInvoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--surface-container)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)' }}>{inv.purchaseOrder?.poNumber ?? '—'}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)' }}>{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)' }}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td style={{ padding: '18px 20px', fontSize: 14, fontWeight: 700 }}>{inv.currency} {parseFloat(inv.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '18px 20px' }}><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32 }}>
        <div>
          <h4 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Finance Transparency</h4>
          <p style={{ fontSize: 14, color: 'var(--secondary)', lineHeight: '22px', marginBottom: 16 }}>Every payment is logged with a transaction reference. Contact your account manager if a payment is missing or incorrect.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ icon: 'verified', label: 'Secure Processing' }, { icon: 'history_edu', label: 'Audit Ready' }].map(item => (
              <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 12 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 180, borderRadius: 16, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #1a1a2e 0%, #851217 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: 24, left: 24, color: '#fff' }}>
            <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Manrope' }}>INR {totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Total Received to Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
