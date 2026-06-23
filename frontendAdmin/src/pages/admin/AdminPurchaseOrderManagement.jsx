import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import "./admin-tokens.css";
import "./AdminPurchaseOrderManagement.css";

/**
 * AdminPurchaseOrderManagement
 * List + filter purchase orders across the enterprise.
 * Matches Stitch screen: purchase_order_management
 */

const ORDERS = [
  { id: "PO-2026-8891", vendor: "Lumière Visuals", initials: "LV", event: "Global Tech Summit 2026", amount: "$45,000.00", status: "sent" },
  { id: "PO-2026-8892", vendor: "Ritz-Carlton Monaco", initials: "RM", event: "Executive Yacht Gala", amount: "$128,500.00", status: "accepted" },
  { id: "PO-2026-8893", vendor: "Skyline Security", initials: "SS", event: "Luxury Expo Dubai", amount: "$12,400.00", status: "draft" },
  { id: "PO-2026-8894", vendor: "Elite Catering Co.", initials: "EC", event: "Winter Ball 2026", amount: "$31,200.00", status: "pending" },
];

const AdminPurchaseOrderManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const columns = [
    { key: "id", header: "PO ID", render: (r) => <span className="admin-po-mgmt__id">#{r.id}</span> },
    {
      key: "vendor",
      header: "Vendor Name",
      render: (r) => (
        <div className="admin-po-mgmt__vendor">
          <span className="admin-po-mgmt__avatar">{r.initials}</span>
          {r.vendor}
        </div>
      ),
    },
    { key: "event", header: "Event Name" },
    { key: "amount", header: "Budget Amount", render: (r) => <strong>{r.amount}</strong> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <button
          className="admin-btn admin-btn--ghost"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/purchase-orders/${r.id}`);
          }}
        >
          View →
        </button>
      ),
    },
  ];

  return (
    <AdminLayout searchPlaceholder="Search purchase orders...">
      <div className="admin-page admin-po-mgmt">
      <PageHeader
        breadcrumb={[{ label: "Financials" }, { label: "Purchase Orders" }]}
        title="Purchase Order Management"
        subtitle="Review and authorize procurement across global event portfolios."
        actions={
          <button className="admin-btn admin-btn--primary" onClick={() => navigate("/admin/purchase-orders/new")}>
            + Create Purchase Order
          </button>
        }
      />

      <div className="admin-po-mgmt__stats">
        <StatCard label="Total Orders" value="1,284" trend="+12% from last quarter" trendDirection="up" accentColor="#b51b1e" />
        <StatCard label="Pending Approval" value="42" helperText="Requires executive signature" accentColor="#caa802" />
        <StatCard label="Completed / Paid" value="1,120" helperText="Matching 98% of allocations" accentColor="#1f8b4c" />
      </div>

      <div className="admin-card admin-po-mgmt__table-card">
        <div className="admin-po-mgmt__panel-head">
          <h3 className="admin-section-title">Active Purchase Orders</h3>
          <div className="admin-po-mgmt__panel-actions">
            <button className="admin-btn admin-btn--outline">Filter</button>
            <button className="admin-btn admin-btn--outline">⬇ Export CSV</button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={ORDERS}
          onRowClick={(row) => navigate(`/admin/purchase-orders/${row.id}`)}
          footer={
            <>
              <span className="admin-po-mgmt__footer-text">Showing 1 to 4 of 1,284 entries</span>
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
                <button onClick={() => setPage((p) => Math.min(99, p + 1))}>›</button>
              </div>
            </>
          }
        />
      </div>

      <div className="admin-card admin-po-mgmt__recent">
        <div className="admin-po-mgmt__panel-head">
          <h3 className="admin-section-title">Recent Activity</h3>
          <button className="admin-btn admin-btn--ghost">View All Log</button>
        </div>
        <ul className="admin-po-mgmt__activity">
          <li>
            <strong>#PO-2026-8890</strong> approved by <strong>Alex Harrington</strong> — 2 hours ago
          </li>
          <li>
            <strong>#PO-2026-8889</strong> flagged for budget review — 5 hours ago
          </li>
        </ul>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminPurchaseOrderManagement;