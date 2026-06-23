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

const SPEND_LINE_POINTS = [
  { x: 0, y: 150 },
  { x: 100, y: 120 },
  { x: 200, y: 160 },
  { x: 300, y: 80 },
  { x: 400, y: 100 },
  { x: 500, y: 40 },
  { x: 600, y: 60 },
];

const SPEND_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const VENDOR_PERFORMANCE = [
  { name: "Luxe Events Production", score: 98 },
  { name: "Grand Horizon Venues", score: 92 },
  { name: "Prime Logistics Co.", score: 85 },
  { name: "Gourmet Elite Catering", score: 78 },
];

const RATINGS_HISTOGRAM = [
  { label: "1★", pct: 20, highlight: false, count: null },
  { label: "2★", pct: 17, highlight: false, count: null },
  { label: "3★", pct: 40, highlight: false, count: null },
  { label: "4★", pct: 80, highlight: "primary", count: "142 Vendors" },
  { label: "5★", pct: 100, highlight: "secondary", count: "218 Vendors" },
];

const TOP_PARTNERS = [
  { initials: "AV", bg: "var(--admin-gradient)", name: "Visionary Audio Visual", category: "AV & Light Production", rating: "4.9/5", tier: "Excellent" },
  { initials: "CH", bg: "#caa802", name: "City Heights Suites", category: "Venue & Accomodation", rating: "4.7/5", tier: "Good" },
  { initials: "ML", bg: "var(--admin-secondary)", name: "Metro Logistics Pro", category: "Shipping & Freight", rating: "4.6/5", tier: "Good" },
];

const SLA_COLUMNS = ["AV", "Catering", "Venues", "Logi", "Staff"];
const SLA_ROWS = [
  { region: "North America", cells: [0, 0.2, 0, 0, 0] },
  { region: "Europe", cells: [0, 0, 0.6, 0, 0.2] },
  { region: "Asia Pacific", cells: [0.4, 0, 1, 0, 0] },
  { region: "MENA", cells: [0, 0.8, 0, 0.2, 0] },
];

export default function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/v1/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
                <path
                  d={`M${SPEND_LINE_POINTS.map((p) => `${p.x},${p.y}`).join(" L")}`}
                  fill="none"
                  stroke="#610000"
                  strokeWidth="3"
                />
                {SPEND_LINE_POINTS.map((p) => (
                  <circle key={p.x} cx={p.x} cy={p.y} fill="#610000" r="4" />
                ))}
              </svg>
              <div className="admin-analytics__line-months font-label-sm">
                {SPEND_MONTHS.map((m) => (
                  <span key={m}>{m}</span>
                ))}
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
              {VENDOR_PERFORMANCE.map((v) => (
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
              {RATINGS_HISTOGRAM.map((bar) => (
                <div key={bar.label} className="admin-analytics__hist-col">
                  <div
                    className={`admin-analytics__hist-bar${bar.highlight ? ` admin-analytics__hist-bar--${bar.highlight}` : ""}`}
                    style={{ height: `${bar.pct}%` }}
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
              {TOP_PARTNERS.map((p) => (
                <div key={p.name} className="admin-analytics__partner-row">
                  <div className="admin-analytics__partner-avatar" style={{ background: p.bg }}>
                    {p.initials}
                  </div>
                  <div className="admin-analytics__partner-info">
                    <p className="font-body-md admin-analytics__partner-name">{p.name}</p>
                    <p className="font-label-sm admin-analytics__muted">{p.category}</p>
                  </div>
                  <div className="admin-analytics__partner-meta">
                    <p className="font-body-md admin-analytics__partner-rating">{p.rating}</p>
                    <p className="font-label-sm admin-analytics__muted">{p.tier}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Heatmap */}
          <div className="admin-card admin-analytics__sla">
            <div className="admin-analytics__card-head">
              <h3 className="admin-section-title">SLA Compliance Heatmap</h3>
              <div className="admin-analytics__sla-key font-label-sm">
                <span>Low Risk</span>
                <div className="admin-analytics__sla-key-bar">
                  <div style={{ background: "var(--admin-surface-container)" }} />
                  <div style={{ background: "rgba(181,27,30,0.3)" }} />
                  <div style={{ background: "rgba(181,27,30,0.6)" }} />
                  <div style={{ background: "var(--admin-secondary)" }} />
                </div>
                <span>Critical</span>
              </div>
            </div>
            <p className="font-label-sm admin-analytics__muted" style={{ marginBottom: 20 }}>
              Service level agreement breaches by region and category
            </p>
            <div className="admin-analytics__heatmap">
              <div />
              {SLA_COLUMNS.map((col) => (
                <div key={col} className="admin-analytics__heatmap-col-label font-label-sm">
                  {col}
                </div>
              ))}
              {SLA_ROWS.map((row) => (
                <div className="admin-analytics__heatmap-row" key={row.region}>
                  <div className="admin-analytics__heatmap-row-label font-label-bold">{row.region}</div>
                  {row.cells.map((intensity, i) => (
                    <div
                      key={`${row.region}-${i}`}
                      className="admin-analytics__heatmap-cell"
                      style={{ background: `rgba(181, 27, 30, ${intensity || 0.04})` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="font-label-sm admin-analytics__footer-note">
          © 2026 EventHub360 Enterprise Analytics. Reports automatically refresh every 15 minutes.
        </p>
      </div>
    </AdminLayout>
  );
}