import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; dot: string }> = {
    PAID: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
    SUBMITTED: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
    OVERDUE: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
    DRAFT: { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  };
  const s = styles[status] || styles.SUBMITTED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 9999,
      background: s.bg, color: s.color, fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setInvoices(data?.items ?? data ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + parseFloat(i.totalAmount || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === 'SUBMITTED').reduce((acc, i) => acc + parseFloat(i.totalAmount || 0), 0);

  const stats = [
    { label: 'Total Paid', value: `INR ${totalPaid.toLocaleString()}`, icon: 'payments', iconBg: '#f0fdf4', iconColor: '#16a34a' },
    { label: 'Pending Amount', value: `INR ${pendingAmount.toLocaleString()}`, icon: 'pending_actions', iconBg: '#fffbeb', iconColor: '#d97706' },
    { label: 'Invoices Issued', value: invoices.length.toString(), icon: 'description', iconBg: '#eff6ff', iconColor: '#2563eb' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 8 }}>Payment History</h1>
          <p style={{ fontSize: 16, color: 'var(--secondary)', maxWidth: 600 }}>Monitor your revenue stream and track the lifecycle of every invoice issued through the EventHub360 ecosystem.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<DownloadOutlined />} style={{ borderRadius: 8, height: 44, fontWeight: 600, padding: '0 20px' }}>
            Download Statement
          </Button>
          <Button type="primary" style={{ background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 8, height: 44, fontWeight: 600, padding: '0 20px' }}
            onClick={() => navigate('/finance/upload')}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#fff', padding: 24, borderRadius: 12,
            boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.02)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</p>
              <h3 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{s.value}</h3>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-highest)', overflow: 'hidden' }}>
        {/* Table Toolbar */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--surface-container)',
          background: 'var(--surface-container-low)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', zIndex: 1 }} />
              <input
                placeholder="Search invoices..."
                style={{
                  paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  border: '1px solid var(--outline-variant)', borderRadius: 8,
                  fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none',
                  background: '#fff', width: 256,
                }}
              />
            </div>
            <button style={{ padding: '8px 10px', border: '1px solid var(--outline-variant)', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
              <FilterOutlined style={{ color: 'var(--secondary)' }} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--secondary)' }}>Showing {invoices.length} results</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
              {['Invoice ID', 'PO Ref', 'Date Issued', 'Amount', 'Status', 'Actions'].map((h, i) => (
                <th key={h} style={{
                  padding: '16px 24px',
                  textAlign: i === 5 ? 'right' : 'left',
                  fontSize: 11, fontWeight: 600, color: 'var(--secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '20px 24px', textAlign: 'center' }}>No invoices found.</td></tr>
            )}
            {invoices.map((p, i) => (
              <tr key={p.id}
                style={{ borderBottom: '1px solid var(--surface-container)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--primary)', fontSize: 14 }}>{p.invoiceNumber}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ fontSize: 14, color: 'var(--on-surface)' }}>{p.purchaseOrder?.poNumber || 'General'}</span>
                </td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: 'var(--secondary)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>{p.currency} {parseFloat(p.totalAmount).toLocaleString()}</td>
                <td style={{ padding: '20px 24px' }}>
                  <StatusBadge status={p.status} />
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button style={{ padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-highest)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    ><DownloadOutlined style={{ fontSize: 16 }} /></button>
                    <button style={{ padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-highest)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    ><EyeOutlined style={{ fontSize: 16 }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            border: '1px solid var(--outline-variant)', borderRadius: 8,
            background: 'none', color: 'var(--secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
          }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
            Previous
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              width: 40, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 700, fontSize: 14,
            }}>1</button>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            border: '1px solid var(--outline-variant)', borderRadius: 8,
            background: 'none', color: 'var(--secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }} onClick={() => setCurrentPage(p => p + 1)}>
            Next
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32, alignItems: 'center' }}>
        <div>
          <h4 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Finance Transparency</h4>
          <p style={{ fontSize: 14, color: 'var(--secondary)', lineHeight: '22px', marginBottom: 16 }}>
            Our premium concierge model ensures that every transaction is logged with bank-grade security. Download full year statements for audit purposes directly from your dashboard.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ icon: 'verified', label: 'Secure Processing' }, { icon: 'history_edu', label: 'Audit Ready' }].map((item) => (
              <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 12 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 256, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid var(--surface-container-highest)', position: 'relative', background: 'linear-gradient(135deg, #1a1a2e 0%, #851217 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: 24, left: 24, color: '#fff' }}>
            <p style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope' }}>₹ {(totalPaid + pendingAmount).toLocaleString()}</p>
            <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Total Managed Assets 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}
