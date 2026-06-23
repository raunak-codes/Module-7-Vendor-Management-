import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import "./admin-tokens.css";
import "./AdminDashboard.css";

/**
 * AdminDashboard
 * Executive overview: KPIs, vendor performance, category mix, recent
 * transactions, and quick actions. Matches Stitch screen: admin_dashboard
 */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch("http://localhost:5000/api/v1/admin/vendors", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((data) => setVendors(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalVendors = vendors.length;
  const pendingVendors = vendors.filter(v => v.status === 'PENDING').length;
  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length;

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading dashboard...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout searchPlaceholder="Search vendors, orders, or invoices...">
      <div className="admin-page admin-dashboard-page">
        <PageHeader
          title="Executive Dashboard"
          subtitle="Overview of enterprise operations and vendor life-cycles."
        />

        {/* KPI row */}
        <div className="admin-dashboard__stats">
          <StatCard label="Total Vendors" value={totalVendors.toString()} subValue="Registered" accentLeft />
          <StatCard label="Pending Review" value={pendingVendors.toString()} subValue="Urgent" subValueType="warning" accentLeft />
          <StatCard label="Active Vendors" value={activeVendors.toString()} subValue="Approved" accentLeft />
          <StatCard label="Active POs" value="0" subValue="Coming Soon" accentLeft />
          <StatCard label="Pending Payments" value="$0" subValue="Coming Soon" accentLeft />
        </div>

        {/* Charts row */}
        <div className="admin-dashboard__charts">
          <div className="admin-card admin-dashboard__chart-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <p style={{ color: '#6b7280' }}>Performance Metrics Coming Soon</p>
          </div>

          <div className="admin-card admin-dashboard__category-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <p style={{ color: '#6b7280' }}>Category Analytics Coming Soon</p>
          </div>
        </div>

        {/* Transactions + Quick actions row */}
        <div className="admin-dashboard__bottom">
          <div className="admin-card admin-dashboard__transactions-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
             <p style={{ color: '#6b7280' }}>No recent transactions.</p>
          </div>

          <div className="admin-dashboard__side">
            <div className="admin-card">
              <h2 className="admin-section-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
              <div className="admin-dashboard__quick-actions">
                <button className="admin-btn admin-btn--outline admin-dashboard__quick-action quick-action-btn" onClick={() => navigate("/admin/vendors")}>
                  <span className="material-symbols-outlined">person_search</span>
                  Review Vendors
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
