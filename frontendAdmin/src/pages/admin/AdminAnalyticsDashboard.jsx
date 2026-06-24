import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import "./admin-tokens.css";
import "./AdminAnalyticsDashboard.css";

/**
 * AdminAnalyticsDashboard
 * Bento-grid analytics overview: spend trend, category split, vendor
 * performance, ratings histogram, top partners, SLA heatmap.
 * Matches Stitch screen: analytics_dashboard
 */

export default function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:5000/api/v1/vendors/admin/dashboard', { headers: h }).then(r => r.json()),
      fetch('http://localhost:5000/api/v1/vendors?limit=100', { headers: h }).then(r => r.json()),
      fetch('http://localhost:5000/api/v1/invoices?limit=200', { headers: h }).then(r => r.json()),
    ]).then(([dashRes, vendorRes, invRes]) => {
      setStats(dashRes.data ?? {});
      setVendors(vendorRes.data?.items ?? vendorRes.data ?? []);
      setInvoices(invRes.data?.items ?? invRes.data ?? []);
    }).catch(console.error);
  }, []);

  // Derived: monthly spend (last 6 months from real invoices)
  const spendMonths = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const total = invoices
        .filter(inv => { const id = new Date(inv.createdAt); return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear(); })
        .reduce((a, inv) => a + parseFloat(inv.totalAmount || 0), 0);
      return { label: d.toLocaleString('en', { month: 'short' }), total };
    });
  })();
  const maxSpend = Math.max(...spendMonths.map(m => m.total), 1);
  const spendPoints = spendMonths.map((m, i) => ({ x: i * 120, y: Math.round(180 - (m.total / maxSpend) * 160) }));

  // Derived: top vendors by avg rating
  const topVendors = [...vendors]
    .filter(v => v.ratings?.length > 0 || (v._avg?.rating))
    .sort((a, b) => (b._avg?.rating ?? 0) - (a._avg?.rating ?? 0))
    .slice(0, 4)
    .map(v => ({ name: v.businessName, score: Math.round((v._avg?.rating ?? 4) * 20) }));
  const vendorPerf = topVendors.length > 0 ? topVendors : [];

  // Derived: ratings histogram
  const ratingCounts = [0, 0, 0, 0, 0];
  vendors.forEach(v => { if (v.averageRating) { const r = Math.round(parseFloat(v.averageRating)); if (r >= 1 && r <= 5) ratingCounts[r - 1]++; } });
  const maxRating = Math.max(...ratingCounts, 1);
  const ratingsHist = [1, 2, 3, 4, 5].map(s => ({
    label: `${s}★`,
    pct: Math.round((ratingCounts[s - 1] / maxRating) * 100),
    count: ratingCounts[s - 1] > 0 ? `${ratingCounts[s - 1]} vendors` : null,
  }));

  const getColors = (idx) => {
    const colors = ["var(--admin-primary)", "var(--admin-secondary)", "#caa802", "#1f8b4c"];
    return colors[idx % colors.length];
  };

  return (
    <AdminLayout searchPlaceholder="Search analytics or reports...">
      <div className="admin-page admin-analytics-page">
        <PageHeader
          title="Analytics Intelligence"
          subtitle="Real-time performance metrics and spend distribution across the vendor ecosystem."
          actions={
            <div className="admin-card admin-analytics__filter-bar">
              <div className="admin-analytics__filter">
                <span className="admin-label">Date Range</span>
                <select className="admin-analytics__filter-select">
                  <option>Last 30 Days</option>
                  <option>Quarter to Date</option>
                  <option>Year to Date</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div className="admin-analytics__filter-divider" />
              <div className="admin-analytics__filter">
                <span className="admin-label">Vendor Category</span>
                <select className="admin-analytics__filter-select">
                  <option>All Categories</option>
                  <option>AV Production</option>
                  <option>Catering</option>
                  <option>Venues</option>
                  <option>Logistics</option>
                </select>
              </div>
              <button className="admin-btn admin-btn--outline">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
                Export PDF
              </button>
              <button className="admin-btn admin-btn--primary">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_view</span>
                Export Excel
              </button>
            </div>
          }
        />

        {/* Bento grid */}
        <div className="admin-analytics__grid">
          {/* Monthly Spending */}
          <div className="admin-card admin-analytics__spend">
            <div className="admin-analytics__card-head">
              <div>
                <h3 className="admin-section-title">Monthly Spending</h3>
                <p className="font-label-sm admin-analytics__muted">Financial flow over the last 6 months</p>
              </div>
              <div className="admin-analytics__legend">
                <span className="admin-analytics__legend-item font-label-sm">
                  <span className="admin-analytics__dot" style={{ background: "var(--admin-primary)" }} /> Committed
                </span>
                <span className="admin-analytics__legend-item font-label-sm">
                  <span className="admin-analytics__dot" style={{ background: "var(--admin-secondary)" }} /> Projected
                </span>
              </div>
            </div>
            <div className="admin-analytics__line-chart">
              <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                {spendPoints.length > 1 && (
                  <path
                    d={`M${spendPoints.map((p) => `${p.x},${p.y}`).join(" L")}`}
                    fill="none" stroke="#610000" strokeWidth="3"
                  />
                )}
                {spendPoints.map((p) => (
                  <circle key={p.x} cx={p.x} cy={p.y} fill="#610000" r="4" />
                ))}
              </svg>
              <div className="admin-analytics__line-months font-label-sm">
                {spendMonths.map((m) => <span key={m.label}>{m.label}</span>)}
              </div>
            </div>
          </div>

          {/* Category Wise Spend */}
          <div className="admin-card admin-analytics__category">
            <h3 className="admin-section-title">Category Wise Spend</h3>
            <p className="font-label-sm admin-analytics__muted" style={{ marginBottom: 24 }}>Budget allocation by sector</p>
            <div className="admin-analytics__donut-wrap">
              <div className="admin-analytics__donut">
                <div className="admin-analytics__donut-center">
                  <span className="font-display-lg">{stats?.totalVendors || 0}</span>
                  <span className="font-label-sm">Vendors Total</span>
                </div>
              </div>
              <div className="admin-analytics__cat-list">
                {stats?.categorySpend && stats.categorySpend.length > 0 ? stats.categorySpend.map((cat, idx) => (
                  <div key={cat.label} className="admin-analytics__cat-row font-body-md">
                    <span className="admin-analytics__cat-label">
                      <span className="admin-analytics__dot" style={{ background: getColors(idx) }} /> {cat.label}
                    </span>
                    <strong>INR {cat.value.toLocaleString()}</strong>
                  </div>
                )) : (
                  <div style={{ color: '#6b7280', fontSize: 13 }}>No paid invoices to calculate spend.</div>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Performance */}
          <div className="admin-card admin-analytics__performance">
            <h3 className="admin-section-title">Vendor Performance</h3>
            <p className="font-label-sm admin-analytics__muted" style={{ marginBottom: 28 }}>Efficiency score by top 5 vendors</p>
            <div className="admin-analytics__bars-list">
              {vendorPerf.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: 13 }}>No vendor performance data yet.</p>
              ) : vendorPerf.map((v) => (
                <div key={v.name} className="admin-analytics__bar-row">
                  <div className="font-label-bold admin-analytics__bar-label-row">
                    <span>{v.name}</span>
                    <span>{v.score}%</span>
                  </div>
                  <div className="admin-analytics__bar-track">
                    <div className="admin-analytics__bar-fill" style={{ width: `${v.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Ratings */}
          <div className="admin-card admin-analytics__ratings">
            <h3 className="admin-section-title">Vendor Ratings</h3>
            <p className="font-label-sm admin-analytics__muted" style={{ marginBottom: 28 }}>Distribution of ratings across all partners</p>
            <div className="admin-analytics__histogram">
              {ratingsHist.map((bar, i) => (
                <div key={bar.label} className="admin-analytics__hist-col">
                  <div
                    className={`admin-analytics__hist-bar${i >= 3 ? ` admin-analytics__hist-bar--${i === 4 ? 'secondary' : 'primary'}` : ""}`}
                    style={{ height: `${bar.pct || 4}%` }}
                    title={bar.count || ""}
                  />
                  <span className="font-label-sm">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendors */}
          <div className="admin-card admin-analytics__partners">
            <div className="admin-analytics__card-head">
              <h3 className="admin-section-title">Top Performance Partners</h3>
              <button className="admin-btn admin-btn--ghost">View All</button>
            </div>
            <div className="admin-analytics__partner-list">
              {vendors.slice(0, 3).length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: 13 }}>No vendor data yet.</p>
              ) : vendors.slice(0, 3).map((v, idx) => {
                const colors = ["var(--admin-gradient)", "#caa802", "var(--admin-secondary)"];
                const avg = v.averageRating ? parseFloat(v.averageRating).toFixed(1) : 'N/A';
                const tier = avg >= 4.5 ? 'Excellent' : avg >= 4 ? 'Good' : avg >= 3 ? 'Average' : 'New';
                return (
                  <div key={v.id} className="admin-analytics__partner-row">
                    <div className="admin-analytics__partner-avatar" style={{ background: colors[idx] }}>
                      {(v.businessName || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="admin-analytics__partner-info">
                      <p className="font-body-md admin-analytics__partner-name">{v.businessName}</p>
                      <p className="font-label-sm admin-analytics__muted">{v.category?.name ?? v.status}</p>
                    </div>
                    <div className="admin-analytics__partner-meta">
                      <p className="font-body-md admin-analytics__partner-rating">{avg !== 'N/A' ? `${avg}/5` : '—'}</p>
                      <p className="font-label-sm admin-analytics__muted">{tier}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vendor Status Breakdown */}
          <div className="admin-card admin-analytics__sla">
            <div className="admin-analytics__card-head">
              <h3 className="admin-section-title">Vendor Status Breakdown</h3>
            </div>
            <p className="font-label-sm admin-analytics__muted" style={{ marginBottom: 20 }}>
              Distribution of vendors by onboarding status
            </p>
            {(() => {
              const STATUS_COLORS_MAP = { ACTIVE: '#16a34a', PENDING: '#d97706', REJECTED: '#dc2626', BLACKLISTED: '#7c3aed', INACTIVE: '#6b7280' };
              const counts = {};
              vendors.forEach(v => { counts[v.status] = (counts[v.status] || 0) + 1; });
              const total = vendors.length || 1;
              const entries = Object.entries(counts);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {entries.length === 0 && <p style={{ color: '#6b7280', fontSize: 13 }}>No vendor data yet.</p>}
                  {entries.map(([status, count]) => (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLORS_MAP[status] || '#374151' }}>{status}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{count} ({Math.round((count / total) * 100)}%)</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--admin-surface-container)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((count / total) * 100)}%`, background: STATUS_COLORS_MAP[status] || '#6b7280', borderRadius: 9999, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        <p className="font-label-sm admin-analytics__footer-note">
          © 2026 EventHub360 Enterprise Analytics. Reports automatically refresh every 15 minutes.
        </p>
      </div>
    </AdminLayout>
  );
}