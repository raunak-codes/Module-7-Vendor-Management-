import { useState, useEffect } from 'react';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', color: 'var(--primary)' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  );
}

export default function RatingsReviews() {
  const [activeTab, setActiveTab] = useState('recent');
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState({ avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const vendorId = JSON.parse(atob(token!.split('.')[1])).vendorId;
    if (!vendorId) return;

    fetch(`http://localhost:5000/api/v1/vendors/${vendorId}/ratings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const data: any[] = d.data ?? [];
        setReviews(data);
        const total = data.length;
        const avg = total ? data.reduce((a, r) => a + r.rating, 0) / total : 0;
        const dist = [0, 0, 0, 0, 0];
        data.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
        setSummary({ avg, total, distribution: dist });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'top'
    ? [...reviews].sort((a, b) => b.rating - a.rating)
    : activeTab === 'critical'
    ? reviews.filter(r => r.rating <= 3)
    : [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    pct: summary.total ? Math.round((summary.distribution[stars - 1] / summary.total) * 100) : 0,
  }));

  return (
    <div style={{ maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 4 }}>Ratings & Reviews</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>Real-time feedback from your event clients and partners.</p>
        </div>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid var(--surface-container-highest)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overall Rating</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{summary.avg.toFixed(1)}</span>
              <span style={{ fontSize: 14, color: 'var(--secondary)' }}>/ 5.0</span>
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: 'var(--surface-container-highest)' }} />
          <div>
            <StarRating rating={Math.round(summary.avg)} />
            <p style={{ fontSize: 12, color: 'var(--tertiary)', fontWeight: 600, marginTop: 4 }}>Based on {summary.total} review{summary.total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-low)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Rating Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ratingDistribution.map((r) => (
                <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)', width: 28, flexShrink: 0 }}>{r.stars}★</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--surface-container)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.pct}%`, background: 'var(--primary)', borderRadius: 9999, transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', width: 32, flexShrink: 0, textAlign: 'right' }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 160 }}>auto_awesome</span>
            </div>
            <div style={{ position: 'relative' }}>
              <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Review Summary</h3>
              <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 20, lineHeight: '20px' }}>
                {summary.total === 0 ? 'No reviews yet. Complete work orders to start receiving ratings.' : `You have ${summary.total} review${summary.total !== 1 ? 's' : ''} with an average rating of ${summary.avg.toFixed(1)}/5.`}
              </p>
              {summary.total > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {summary.distribution[4] > 0 && <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>5 Stars: {summary.distribution[4]}</span>}
                  {summary.distribution[3] > 0 && <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>4 Stars: {summary.distribution[3]}</span>}
                  {summary.distribution[2] > 0 && <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>3 Stars: {summary.distribution[2]}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid var(--surface-container-low)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 24 }}>
              {['recent', 'top', 'critical'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Manrope', color: activeTab === tab ? 'var(--primary)' : 'var(--secondary)', borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent', paddingBottom: 4, textTransform: 'capitalize' }}>
                  {tab === 'recent' ? 'Recent Reviews' : tab === 'top' ? 'Top Rated' : 'Critical'}
                </button>
              ))}
            </div>
          </div>

          {loading && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>Loading reviews...</p>}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>star_border</span>
              <p style={{ fontWeight: 600 }}>No reviews yet</p>
              <p style={{ fontSize: 14, marginTop: 4 }}>Complete work orders to start receiving ratings from clients.</p>
            </div>
          )}

          {filtered.map((review: any) => (
            <div key={review.id} style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-low)', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(133,18,23,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--surface-container-low)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--secondary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                    {(review.reviewer?.email ?? '?').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{review.reviewer?.email ?? 'Anonymous'}</h4>
                    <p style={{ fontSize: 12, color: 'var(--secondary)' }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 16, lineHeight: '26px' }}>"{review.comment}"</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
