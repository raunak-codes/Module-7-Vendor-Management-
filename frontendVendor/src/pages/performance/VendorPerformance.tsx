import { useEffect, useState } from 'react';

interface Review {
  id: string;
  rating: number;
  review: string | null;
  eventId: string | null;
  createdAt: string;
  reviewer: { email: string; role: string };
}

interface SLA { id: string; metric: string; target: string; penaltyPct: string | null }
interface Contract { id: string; title: string; endDate: string; slas: SLA[] }

interface PerfStats {
  averageRating: number;
  totalRatings: number;
  distribution: Record<string, number>;
  recentReviews: Review[];
  workOrderStats: Record<string, number>;
  completionRate: number | null;
  activeContracts: Contract[];
  isFlagged: { isFlagged: boolean; flagReason: string | null } | null;
}

const STAR = '★';
const EMPTY_STAR = '☆';

const stars = (n: number) => {
  const full = Math.round(n);
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < full ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>{i < full ? STAR : EMPTY_STAR}</span>
  ));
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const RATING_COLOR = ['', '#dc2626', '#f97316', '#f59e0b', '#84cc16', '#16a34a'];

export default function VendorPerformance() {
  const [stats, setStats] = useState<PerfStats | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/vendors/me/performance', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setStats(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#6b7280', fontFamily: 'Manrope, sans-serif' }}>
      Loading performance data...
    </div>
  );

  if (!stats) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#dc2626', fontFamily: 'Manrope, sans-serif' }}>
      Failed to load performance data.
    </div>
  );

  const maxDistCount = Math.max(...Object.values(stats.distribution), 1);
  const woTotal = Object.values(stats.workOrderStats).reduce((a, b) => a + b, 0);

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>Performance & SLAs</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Your ratings, work order completion, and active service commitments.</p>
      </div>

      {/* Flag warning */}
      {stats.isFlagged?.isFlagged && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: 22, fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>warning</span>
          <div>
            <p style={{ fontWeight: 700, color: '#92400e', fontSize: 14, margin: 0 }}>Performance Review Flag</p>
            <p style={{ fontSize: 12, color: '#78350f', marginTop: 4 }}>{stats.isFlagged.flagReason ?? 'Your account has been flagged for performance review. Our team will be in touch.'}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Rating Overview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Ratings</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 52, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1 }}>{stats.averageRating.toFixed(1)}</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>{stars(stats.averageRating)}</div>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{stats.totalRatings} review{stats.totalRatings !== 1 ? 's' : ''}</p>
            </div>
            {/* Distribution bars */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[5, 4, 3, 2, 1].map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', width: 10 }}>{n}</span>
                  <span style={{ fontSize: 12, color: '#f59e0b' }}>{STAR}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 9999, background: '#f3f4f6', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 9999,
                      background: RATING_COLOR[n],
                      width: `${((stats.distribution[n] ?? 0) / maxDistCount) * 100}%`,
                      transition: 'width 0.5s',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#6b7280', width: 18, textAlign: 'right' }}>{stats.distribution[n] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
          {stats.totalRatings === 0 && (
            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>No ratings yet — complete work orders to earn reviews.</p>
          )}
        </div>

        {/* Work Order Stats */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Order Summary</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {([
              { label: 'Completed', key: 'COMPLETED', color: '#16a34a', bg: '#f0fdf4' },
              { label: 'In Progress', key: 'IN_PROGRESS', color: '#2563eb', bg: '#eff6ff' },
              { label: 'Assigned', key: 'ASSIGNED', color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Cancelled', key: 'CANCELLED', color: '#6b7280', bg: '#f9fafb' },
            ] as const).map(({ label, key, color, bg }) => (
              <div key={key} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 24, fontWeight: 800, color, margin: '4px 0 0' }}>{stats.workOrderStats[key] ?? 0}</p>
              </div>
            ))}
          </div>
          {stats.completionRate !== null && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>Completion Rate</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: stats.completionRate >= 80 ? '#16a34a' : stats.completionRate >= 60 ? '#f59e0b' : '#dc2626' }}>
                  {stats.completionRate}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 9999, background: '#f3f4f6', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 9999, background: stats.completionRate >= 80 ? '#16a34a' : stats.completionRate >= 60 ? '#f59e0b' : '#dc2626', width: `${stats.completionRate}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          )}
          {woTotal === 0 && <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>No work orders yet.</p>}
        </div>
      </div>

      {/* Active Contracts & SLAs */}
      {stats.activeContracts.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Contracts & SLA Commitments</p>
          {stats.activeContracts.map(contract => (
            <div key={contract.id} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>{contract.title}</p>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Expires {fmt(contract.endDate)}</span>
              </div>
              {contract.slas.length === 0 ? (
                <p style={{ fontSize: 12, color: '#9ca3af' }}>No SLA terms defined for this contract.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                  {contract.slas.map(sla => (
                    <div key={sla.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>{sla.metric}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', margin: '4px 0 0' }}>{sla.target}</p>
                      {sla.penaltyPct != null && (
                        <p style={{ fontSize: 10, color: '#d97706', marginTop: 4, fontWeight: 600 }}>{sla.penaltyPct}% penalty for breach</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent Reviews */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Reviews</p>
        {stats.recentReviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#d1d5db', display: 'block', marginBottom: 10 }}>reviews</span>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>No reviews yet. Complete event assignments to receive client feedback.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.recentReviews.map(review => (
              <div key={review.id} style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 2 }}>{stars(review.rating)}</div>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{fmt(review.createdAt)}</span>
                </div>
                {review.review && <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{review.review}</p>}
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                  By {review.reviewer.email} ({review.reviewer.role})
                  {review.eventId && <span> &middot; Event #{review.eventId.slice(0, 8)}</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
