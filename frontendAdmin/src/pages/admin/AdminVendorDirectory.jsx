import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import "./admin-tokens.css";
import "./AdminVendorDirectory.css";

/**
 * AdminVendorDirectory
 * Browse / filter / paginate the full vendor list.
 * Matches Stitch screen: vendor_directory
 */

const STATUSES = ["All Statuses", "PENDING", "ACTIVE", "REJECTED", "INACTIVE"];

const AdminVendorDirectory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(searchParams.get("status") || "All Statuses");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch("http://localhost:5000/api/v1/vendors", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vendors");
        return res.json();
      })
      .then((data) => setVendors(data.data?.items ?? data.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const statusOk = status === "All Statuses" || v.status === status;
      return statusOk;
    });
  }, [vendors, status]);

  const columns = [
    { key: "id", header: "Vendor ID", render: (r) => <span className="admin-vendor-dir__id">{r.id.slice(0, 8)}</span> },
    {
      key: "businessName",
      header: "Vendor Name",
      render: (r) => <span className="admin-vendor-dir__name">{r.businessName}</span>,
    },
    { key: "category", header: "Category", render: (r) => r.category?.name || "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> },
    { key: "contact", header: "Contact", render: (r) => <span className="admin-vendor-dir__contact">{r.user?.email || "—"}</span> },
  ];

  return (
    <AdminLayout searchPlaceholder="Search vendors...">
      <div className="admin-page admin-vendor-dir">
      <PageHeader
        title="Vendor Directory"
        subtitle="Manage and monitor registered event service partners."
      />

      {loading && (
        <div className="admin-card" style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
          Loading vendors...
        </div>
      )}

      {error && (
        <div className="admin-card" style={{ padding: 40, textAlign: "center", color: "#b51b1e" }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="admin-card admin-vendor-dir__filters">
            <div className="admin-vendor-dir__filter">
              <span className="admin-label">Status</span>
              <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-card admin-vendor-dir__table-card">
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
                No vendors found.
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filtered}
                onRowClick={(row) => navigate(`/admin/vendors/${row.id}`)}
                footer={
                  <span className="admin-vendor-dir__footer-text">
                    Showing {filtered.length} of {vendors.length} vendors
                  </span>
                }
              />
            )}
          </div>

          <div className="admin-vendor-dir__stats">
            <StatCard label="Total Vendors" value={String(vendors.length)} helperText="Registered in system" accentColor="#b51b1e" />
            <StatCard label="Pending Review" value={String(vendors.filter(v => v.status === "PENDING").length)} helperText="Awaiting approval" accentColor="#caa802" />
            <StatCard label="Active Vendors" value={String(vendors.filter(v => v.status === "ACTIVE").length)} helperText="Approved and operational" accentColor="#2563eb" />
          </div>
        </>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminVendorDirectory;