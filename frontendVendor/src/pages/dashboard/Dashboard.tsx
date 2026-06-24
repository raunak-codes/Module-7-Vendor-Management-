import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { RiseOutlined } from '@ant-design/icons';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>({
    activeWorkOrders: 0,
    pendingPaymentAmount: 0,
    averageRating: 0,
    totalRatings: 0,
    recentActivity: [],
    upcomingEvents: [],
  });
  const [workOrders, setWorkOrders] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch('http://localhost:5000/api/v1/vendors/me/dashboard', { headers })
      .then(r => r.json())
      .then(d => setDashboardData(d.data ?? {}))
      .catch(console.error);

    fetch('http://localhost:5000/api/v1/work-orders?limit=5', { headers })
      .then(r => r.json())
      .then(d => setWorkOrders(d.data?.items ?? d.data ?? []))
      .catch(console.error);
  }, []);

  const rating = parseFloat(dashboardData.averageRating ?? 0);
  const metricCards = [
    { label: 'Active Work Orders', value: String(dashboardData.activeWorkOrders ?? 0), icon: 'trending_up', borderColor: 'var(--primary)' },
    { label: 'Event Allocations', value: String(dashboardData.upcomingEvents?.length ?? 0), icon: 'event', borderColor: 'transparent' },
    { label: 'Pending Payments', value: `₹ ${parseFloat(dashboardData.pendingPaymentAmount ?? 0).toLocaleString('en-IN')}`, subLabel: 'Due soon', subColor: 'var(--error)', borderColor: 'transparent' },
    { label: 'Vendor Rating', value: rating.toFixed(1), subLabel: '/5', borderColor: 'transparent', isRating: true },
  ];

  const wonContracts = workOrders.filter(wo => wo.status === 'COMPLETED').length;
  const opportunityCards = [
    { label: 'Total Work Orders', value: String(workOrders.length), icon: 'campaign', borderColor: 'var(--tertiary)' },
    { label: 'In Progress', value: String(workOrders.filter(wo => wo.status === 'IN_PROGRESS').length), icon: 'description', borderColor: 'var(--secondary)' },
    { label: 'Completed', value: String(wonContracts), icon: 'workspace_premium', borderColor: 'var(--primary)' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)', fontFamily: 'Manrope', marginBottom: 6 }}>
          Vendor Dashboard
        </h2>
        <p style={{ fontSize: 16, color: 'var(--secondary)' }}>Overview of your current event operations and finances.</p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        {metricCards.map((card, i) => (
          <div key={i} className="premium-card" style={{
            padding: 24, height: 128,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            borderLeft: `4px solid ${card.borderColor}`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1, fontFamily: 'Manrope' }}>
                {card.value}
                {card.subLabel && !card.isRating && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--secondary)', marginLeft: 4 }}></span>}
              </span>
              {card.trend && (
                <span style={{ color: card.trendColor, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <RiseOutlined /> {card.trend}
                </span>
              )}
              {card.subLabel && !card.trend && (
                <span style={{ color: card.subColor || 'var(--secondary)', fontWeight: 600, fontSize: 14 }}>{card.subLabel}</span>
              )}
              {card.isRating && (
                <div style={{ display: 'flex', color: 'var(--primary)' }}>
                  {[1,2,3,4].map(s => (
                    <span key={s} className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>star_half</span>
                </div>
              )}
              {card.icon && !card.trend && !card.isRating && !card.subLabel && (
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--secondary)', opacity: 0.2 }}>{card.icon}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Opportunity Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        {opportunityCards.map((card, i) => (
          <div key={i} className="premium-card" style={{
            padding: 24, height: 128,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            borderLeft: `4px solid ${card.borderColor}`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1, fontFamily: 'Manrope' }}>{card.value}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: card.borderColor, opacity: 0.4 }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Work Orders */}
      <div className="premium-card" style={{ marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid var(--surface-container)' }}>
          <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>My Work Orders</h3>
          <p style={{ fontSize: 14, color: 'var(--secondary)' }}>Track active work orders assigned to you.</p>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {workOrders.length === 0 && <p style={{ color: 'var(--secondary)', fontSize: 14 }}>No work orders yet.</p>}
          {workOrders.map((wo: any) => {
            const statusMap: Record<string, { bg: string; text: string }> = {
              ASSIGNED: { bg: '#d9e3f4', text: '#121c28' },
              IN_PROGRESS: { bg: '#6ffbbe', text: '#002113' },
              COMPLETED: { bg: '#dcfce7', text: '#14532d' },
              CANCELLED: { bg: '#fee2e2', text: '#7f1d1d' },
            };
            const s = statusMap[wo.status] ?? { bg: '#f3f4f6', text: '#374151' };
            return (
              <div key={wo.id} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--outline-variant)', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(133,18,23,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--outline-variant)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h5 style={{ fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'Manrope', fontSize: 15, marginBottom: 2 }}>{wo.woNumber}</h5>
                    <p style={{ fontSize: 13, color: 'var(--secondary)' }}>{wo.description ?? '—'}</p>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700, background: s.bg, color: s.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{wo.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--secondary)' }}>PO: {wo.purchaseOrder?.poNumber ?? 'N/A'} &nbsp;|&nbsp; Due: {wo.deadline ? new Date(wo.deadline).toLocaleDateString('en-IN') : 'TBD'}</p>
                  <Button size="small" type="text" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 12 }} onClick={() => navigate('/work-orders')}>View</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Recent Activity */}
        <div className="premium-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: 24, borderBottom: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Recent Activity</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>View All History</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)' }}>
                {['Date', 'Activity', 'Status', 'Action'].map((h) => (
                  <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentActivity.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '20px 24px', textAlign: 'center' }}>No recent activity found.</td></tr>
              )}
              {dashboardData.recentActivity.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--surface-container)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-lowest)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '20px 24px', fontSize: 14, color: 'var(--secondary)' }}>{row.date}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <p style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 14 }}>{row.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 2 }}>{row.sub}</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '3px 10px', borderRadius: 9999,
                      background: '#d9e3f4', color: '#121c28',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Revenue Insight */}
          <div className="premium-card" style={{
            padding: 24,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 }}>insights</span>
              <h4 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Revenue Insight</h4>
            </div>
            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24, lineHeight: '20px' }}>
              Your service revenue is tracking at 12% above seasonal average. Consider expanding your AV & Media catalog.
            </p>
            <button style={{
              width: '100%', padding: '8px 0', background: '#fff', color: 'var(--primary)',
              border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}>View Report</button>
          </div>

          {/* Schedule – upcoming work orders */}
          <div className="premium-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Upcoming Work</h4>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', cursor: 'pointer' }}>calendar_today</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {workOrders.filter(wo => ['ASSIGNED','IN_PROGRESS'].includes(wo.status)).slice(0, 3).map((wo: any) => {
                const d = wo.deadline ? new Date(wo.deadline) : null;
                return (
                  <div key={wo.id} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, background: 'var(--surface-container-low)', border: '1px solid transparent', transition: 'border-color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--outline-variant)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                  >
                    <div style={{ width: 48, height: 48, background: '#ffdad7', color: '#410004', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                      {d ? <>
                        <span style={{ fontSize: 10, letterSpacing: '0.05em' }}>{d.toLocaleString('en', { month: 'short' }).toUpperCase()}</span>
                        <span style={{ fontSize: 18, fontFamily: 'Manrope', lineHeight: 1 }}>{d.getDate()}</span>
                      </> : <span className="material-symbols-outlined" style={{ fontSize: 22 }}>event</span>}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 14 }}>{wo.woNumber}</p>
                      <p style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 2 }}>{wo.description ?? wo.status}</p>
                    </div>
                  </div>
                );
              })}
              {workOrders.filter(wo => ['ASSIGNED','IN_PROGRESS'].includes(wo.status)).length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--secondary)', textAlign: 'center', padding: '12px 0' }}>No upcoming work orders.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Destination Banner */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', height: 256, position: 'relative',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #851217 100%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, color: '#fff' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6, opacity: 0.8 }}>Featured Destination</p>
          <h3 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', marginBottom: 8 }}>The Royal Plaza Grande</h3>
          <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span> Mumbai, India
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified</span> Preferred Vendor Partner
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
