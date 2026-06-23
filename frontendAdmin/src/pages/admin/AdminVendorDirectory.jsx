import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ALL_VENDORS = [
  { id: "VND-8842", name: "Savory Signature Catering", category: "Catering & Fine Dining", rating: 4.8, status: "verified", contact: "concierge@savory.com" },
  { id: "VND-9120", name: "Lumina AV Solutions", category: "Audio/Visual & Lighting", rating: 4.0, status: "under review", contact: "support@lumina-av.tech" },
  { id: "VND-7751", name: "IronClad Security Services", category: "Security & Logistical Support", rating: 5.0, status: "verified", contact: "ops@ironclad.org" },
  { id: "VND-4412", name: "Velvet & Vine Decor", category: "Decor & Styling", rating: 3.5, status: "pending", contact: "hello@velvetvine.com" },
  { id: "VND-1025", name: "BlackTie Logistics", category: "Transportation", rating: 4.9, status: "on hold", contact: "booking@blacktie.limo" },
  { id: "VND-2231", name: "Grand Atrium Catering", category: "Catering & Fine Dining", rating: 4.6, status: "verified", contact: "events@grandatrium.com" },
  { id: "VND-3340", name: "Skyline Security", category: "Security & Logistical Support", rating: 4.2, status: "verified", contact: "contact@skylinesec.com" },
];

const CATEGORIES = ["All Categories", "Catering & Fine Dining", "Audio/Visual & Lighting", "Security & Logistical Support", "Decor & Styling", "Transportation"];
const STATUSES = ["All Statuses", "Verified", "Under Review", "Pending", "On Hold"];
const LOCATIONS = ["All Locations", "New York", "Los Angeles", "Chicago", "Miami"];

const AdminVendorDirectory = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [location, setLocation] = useState("All Locations");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ALL_VENDORS.filter((v) => {
      const catOk = category === "All Categories" || v.category === category;
      const statusOk = status === "All Statuses" || v.status === status.toLowerCase();
      return catOk && statusOk;
    });
  }, [category, status]);

  const columns = [
    { key: "id", header: "Vendor ID", render: (r) => <span className="admin-vendor-dir__id">{r.id}</span> },
    {
      key: "name",
      header: "Vendor Name",
      render: (r) => <span className="admin-vendor-dir__name">{r.name}</span>,
    },
    { key: "category", header: "Category" },
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <span className="admin-vendor-dir__rating">
          {"★".repeat(Math.round(r.rating))}
          {"☆".repeat(5 - Math.round(r.rating))} <span>{r.rating}</span>
        </span>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "contact", header: "Contact", render: (r) => <span className="admin-vendor-dir__contact">{r.contact}</span> },
  ];

  return (
    <AdminLayout searchPlaceholder="Search vendors...">
      <div className="admin-page admin-vendor-dir">
      <PageHeader
        title="Vendor Directory"
        subtitle="Manage and monitor verified event service partners."
        actions={
          <button className="admin-btn admin-btn--primary" onClick={() => navigate("/admin/vendors/new")}>
            + Add Vendor
          </button>
        }
      />

      <div className="admin-card admin-vendor-dir__filters">
        <div className="admin-vendor-dir__filter">
          <span className="admin-label">Category</span>
          <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="admin-vendor-dir__filter">
          <span className="admin-label">Status</span>
          <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="admin-vendor-dir__filter">
          <span className="admin-label">Rating</span>
          <select className="admin-select">
            <option>Any Rating</option>
            <option>4★ &amp; above</option>
            <option>3★ &amp; above</option>
          </select>
        </div>
        <div className="admin-vendor-dir__filter">
          <span className="admin-label">Location</span>
          <select className="admin-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-card admin-vendor-dir__table-card">
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/admin/vendors/${row.id}`)}
          footer={
            <>
              <span className="admin-vendor-dir__footer-text">
                Showing {filtered.length} of 128 vendors
              </span>
              <div className="admin-vendor-dir__pagination">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={p === page ? "admin-vendor-dir__page--active" : ""}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <span>…</span>
                <button onClick={() => setPage(26)}>26</button>
                <button onClick={() => setPage((p) => Math.min(26, p + 1))}>›</button>
              </div>
            </>
          }
        />
      </div>

      <div className="admin-vendor-dir__stats">
        <StatCard label="Verification Status" value="92%" helperText="Vendors fully KYC compliant" accentColor="#b51b1e" />
        <StatCard label="Network Rating" value="4.6" helperText="Average vendor performance" accentColor="#caa802" />
        <StatCard label="Renewals Pending" value="12" helperText="Contracts due within 30 days" accentColor="#2563eb" />
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminVendorDirectory;