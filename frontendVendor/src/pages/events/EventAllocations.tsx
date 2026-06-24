import { useState, useEffect } from 'react';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ASSIGNED: { bg: '#d9e3f4', text: '#121c28', label: 'Assigned' },
  IN_PROGRESS: { bg: '#6ffbbe', text: '#002113', label: 'In Progress' },
  COMPLETED: { bg: '#dcfce7', text: '#14532d', label: 'Completed' },
  CANCELLED: { bg: '#fee2e2', text: '#7f1d1d', label: 'Cancelled' },
  DRAFT: { bg: '#f3f4f6', text: '#374151', label: 'Draft' },
};

export default function EventAllocations() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/work-orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setWorkOrders(d.data?.items ?? d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? workOrders : workOrders.filter(wo => wo.status === filter);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)', fontFamily: 'Manrope', marginBottom: 6 }}>Event Allocations</h2>
        <p style={{ fontSize: 16, color: 'var(--secondary)' }}>View work orders assigned to you across events and purchase orders.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total', value: workOrders.length, color: 'var(--primary)' },
          { label: 'In Progress', value: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length, color: '#16a34a' },
          { label: 'Assigned', value: workOrders.filter(wo => wo.status === 'ASSIGNED').length, color: '#2563eb' },
          { label: 'Completed', value: workOrders.filter(wo => wo.status === 'COMPLETED').length, color: '#7c3aed' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--surface-container-lowest)', padding: 20, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{stat.value}</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(133,18,23,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>event</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 16px', borderRadius: 99, border: filter === s ? '2px solid var(--primary)' : '1px solid var(--outline-variant)', background: filter === s ? 'var(--primary)' : 'transparent', color: filter === s ? '#fff' : 'var(--secondary)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            {s === 'ALL' ? 'All' : STATUS_COLORS[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading work orders...</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>event_busy</span>
          <p style={{ fontWeight: 600 }}>No work orders found</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((wo: any) => {
          const s = STATUS_COLORS[wo.status] ?? { bg: '#f3f4f6', text: '#374151', label: wo.status };
          const deadline = wo.deadline ? new Date(wo.deadline) : null;
          return (
            <div key={wo.id} style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)', padding: 24, transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(133,18,23,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--surface-container)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)', background: 'var(--surface-container)', padding: '2px 8px', borderRadius: 4 }}>{wo.woNumber}</span>
                    <span style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700, background: s.bg, color: s.text, textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Manrope', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>{wo.description ?? wo.woNumber}</h3>
                  <p style={{ fontSize: 13, color: 'var(--secondary)' }}>PO: {wo.purchaseOrder?.poNumber ?? 'N/A'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {deadline && (
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--secondary)', marginBottom: 2 }}>Deadline</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>
                        {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--secondary)' }}>
                <span><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle' }}>schedule</span> Created {new Date(wo.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
