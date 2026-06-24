import { useEffect, useState } from 'react';

const STATUS_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: '#f3f4f6', text: '#374151', label: 'Draft' },
  ACTIVE: { bg: '#dcfce7', text: '#166534', label: 'Active' },
  EXPIRED: { bg: '#fef3c7', text: '#92400e', label: 'Expired' },
  TERMINATED: { bg: '#fee2e2', text: '#991b1b', label: 'Terminated' },
};

const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

interface SLA { id: string; metric: string; target: string; penaltyPct: string | null }
interface Contract {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  signedAt: string | null;
  documentUrl: string | null;
  notes: string | null;
  slas: SLA[];
}

export default function DocumentVault() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contract | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/contracts/mine', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setContracts(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const daysLeft = (endDate: string) =>
    Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const active = contracts.filter(c => c.status === 'ACTIVE');
  const expiringSoon = active.filter(c => { const d = daysLeft(c.endDate); return d >= 0 && d <= 30; });

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#6b7280', fontFamily: 'Manrope, sans-serif' }}>
      Loading contracts...
    </div>
  );

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>Document Vault</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>View your contracts and SLA commitments with EventHub360.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Contracts', value: contracts.length, color: '#b51b1e' },
          { label: 'Active', value: active.length, color: '#16a34a' },
          { label: 'Expiring in 30 Days', value: expiringSoon.length, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Expiry warning banner */}
      {expiringSoon.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: 20, fontVariationSettings: "'FILL' 1" }}>warning</span>
          <p style={{ fontSize: 13, color: '#92400e', fontWeight: 600, margin: 0 }}>
            {expiringSoon.length} contract{expiringSoon.length > 1 ? 's' : ''} expiring within 30 days. Please contact your EventHub360 account manager for renewal.
          </p>
        </div>
      )}

      {contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, background: '#f9fafb', borderRadius: 16, border: '1px dashed #d1d5db' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#9ca3af', display: 'block', marginBottom: 12 }}>folder_open</span>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>No Contracts Yet</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Your contracts with EventHub360 will appear here once created by the admin team.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contracts.map(c => {
            const sc = STATUS_COLOR[c.status] ?? { bg: '#f3f4f6', text: '#374151', label: c.status };
            const days = c.status === 'ACTIVE' ? daysLeft(c.endDate) : null;
            return (
              <div key={c.id}
                onClick={() => setSelected(c)}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 22px', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#16a34a' }}>contract</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>{c.title}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {fmt(c.startDate)} — {fmt(c.endDate)} &nbsp;·&nbsp; {c.slas.length} SLA term{c.slas.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {days !== null && days <= 30 && days >= 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '3px 8px', borderRadius: 9999 }}>
                        Expires in {days}d
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: sc.bg, color: sc.text }}>{sc.label}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#9ca3af' }}>chevron_right</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer overlay */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'relative', zIndex: 10, background: '#fff', width: '100%', maxWidth: 520, height: '100%', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }}>
            {/* Drawer header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>{selected.title}</p>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: STATUS_COLOR[selected.status]?.bg, color: STATUS_COLOR[selected.status]?.text, marginTop: 4, display: 'inline-block' }}>
                  {STATUS_COLOR[selected.status]?.label}
                </span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9999, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>×</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Key dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Effective From', value: fmt(selected.startDate) },
                  { label: 'Expires On', value: fmt(selected.endDate) },
                  { label: 'Signed On', value: fmt(selected.signedAt) },
                  { label: 'Days Remaining', value: selected.status === 'ACTIVE' ? `${daysLeft(selected.endDate)} days` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{label}</p>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 14, marginTop: 4 }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Document link */}
              {selected.documentUrl ? (
                <a href={selected.documentUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, textDecoration: 'none' }}>
                  <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: 22 }}>picture_as_pdf</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>View Contract Document</p>
                    <p style={{ fontSize: 11, color: '#60a5fa', margin: 0 }}>Click to open in new tab</p>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: '#93c5fd', fontSize: 16, marginLeft: 'auto' }}>open_in_new</span>
                </a>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: 22 }}>attach_file</span>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No document attached to this contract.</p>
                </div>
              )}

              {/* SLA terms */}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 10 }}>SLA Commitments ({selected.slas.length})</p>
                {selected.slas.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>No SLA terms have been defined for this contract.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.slas.map(sla => (
                      <div key={sla.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: 0 }}>{sla.metric}</p>
                          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Target: {sla.target}</p>
                        </div>
                        {sla.penaltyPct != null && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: '#fef3c7', color: '#92400e' }}>
                            {sla.penaltyPct}% penalty
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 6 }}>Notes</p>
                  <p style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
