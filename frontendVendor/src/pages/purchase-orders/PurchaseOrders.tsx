import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; dot: string }> = {
    DRAFT: { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
    ISSUED: { bg: '#e0f2fe', color: '#0369a1', dot: '#38bdf8' },
    ACCEPTED: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
    REJECTED: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
    PARTIAL_FULFILLED: { bg: '#fef3c7', color: '#b45309', dot: '#fbbf24' },
    FULFILLED: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
    CANCELLED: { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  };
  const s = styles[status] || styles.DRAFT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 9999,
      background: s.bg, color: s.color, fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/purchase-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setOrders(data?.items ?? data ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id, status, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/v1/purchase-orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalAmount = orders.reduce((acc, o) => acc + parseFloat(o.totalAmount || 0), 0);
  const acceptedCount = orders.filter(o => o.status === 'ACCEPTED').length;
  const pendingCount = orders.filter(o => o.status === 'ISSUED').length;

  const stats = [
    { label: 'Total POs', value: orders.length.toString(), trend: '', trendColor: 'var(--tertiary)', icon: 'receipt_long', iconBg: 'rgba(0,77,51,0.1)', iconColor: 'var(--tertiary)' },
    { label: 'Pending Action', value: pendingCount.toString(), trend: '', trendColor: 'var(--secondary)', icon: 'pending_actions', iconBg: '#fff7ed', iconColor: '#c2410c' },
    { label: 'Accepted', value: acceptedCount.toString(), trend: '', trendColor: 'var(--tertiary)', icon: 'check_circle', iconBg: '#f0fdf4', iconColor: '#15803d' },
    { label: 'Total Amount', value: `INR ${totalAmount.toLocaleString()}`, trend: '', trendColor: 'var(--secondary)', icon: 'payments', iconBg: '#fef2f2', iconColor: 'var(--primary)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 6 }}>Purchase Orders</h2>
          <p style={{ fontSize: 16, color: 'var(--secondary)' }}>Manage and track your operational expenditures for upcoming events.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<FilterOutlined />} style={{ borderRadius: 8, color: 'var(--primary)', borderColor: 'rgba(133,18,23,0.2)', background: 'rgba(133,18,23,0.05)', fontWeight: 600 }}>
            Filter
          </Button>
          <Button
            type="primary" icon={<PlusOutlined />}
            style={{ borderRadius: 8, background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 }}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#fff', padding: 24, borderRadius: 12,
            boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-low)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ padding: 8, background: s.iconBg, borderRadius: 8, color: s.iconColor }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 12, color: s.trendColor }}>{s.trend}</span>
            </div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Manrope', marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-low)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(243,244,245,0.5)', borderBottom: '1px solid var(--surface-container)' }}>
                {['PO ID', 'Event Ref', 'Amount', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '16px 24px', textAlign: i === 4 ? 'right' : 'left',
                    fontSize: 11, fontWeight: 600, color: 'var(--secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '20px 24px', textAlign: 'center' }}>No purchase orders found.</td></tr>
              )}
              {orders.map((order, i) => (
                <tr key={order.id}
                  style={{ borderBottom: '1px solid var(--surface-container)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => navigate(`/purchase-orders/${order.id}`)}
                >
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 14 }}>{order.poNumber}</span>
                    <p style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: i % 2 === 0 ? 'rgba(133,18,23,0.1)' : 'rgba(85,95,109,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>business</span>
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--on-surface)', fontSize: 14 }}>{order.eventId || 'General'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--on-surface)', fontSize: 14 }}>{order.currency} {parseFloat(order.totalAmount).toLocaleString()}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                      <button style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => navigate(`/purchase-orders/${order.id}`)}>View</button>
                      {order.status === 'ISSUED' && (
                        <>
                          <button onClick={(e) => handleUpdateStatus(order.id, 'ACCEPTED', e)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'rgba(133,18,23,0.05)', border: '1px solid rgba(133,18,23,0.2)', borderRadius: 6, cursor: 'pointer' }}>Accept</button>
                          <button onClick={(e) => handleUpdateStatus(order.id, 'REJECTED', e)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Reject</button>
                        </>
                      )}
                      {order.status === 'ACCEPTED' && (
                        <button style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '16px 24px', background: 'var(--surface-container-low)',
          borderTop: '1px solid var(--surface-container)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontSize: 12, color: 'var(--secondary)' }}>
            Showing <strong style={{ color: 'var(--on-surface)' }}>{orders.length}</strong> results
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={{ background: 'rgba(133,18,23,0.05)', padding: 24, borderRadius: 12, border: '1px solid rgba(133,18,23,0.1)', display: 'flex', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(133,18,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>info</span>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Processing Timelines</h4>
            <p style={{ fontSize: 14, color: 'var(--secondary)', lineHeight: '20px' }}>POs submitted after 5:00 PM will be processed on the next business day. Urgent requests should be flagged manually via the Chat portal.</p>
            <button style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Read Guidelines <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>
        </div>
        <div style={{ background: 'var(--surface-container-low)', padding: 24, borderRadius: 12, border: '1px solid var(--surface-container)', display: 'flex', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(85,95,109,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>support_agent</span>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Concierge Support</h4>
            <p style={{ fontSize: 14, color: 'var(--secondary)', lineHeight: '20px' }}>Need assistance with a specific budget line? Your dedicated account manager is available from 9:00 AM to 6:00 PM.</p>
            <button style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Contact Help Center <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat_bubble_outline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

