import React, { useState, useEffect } from "react";
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

const AdminPurchaseOrderManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch("http://localhost:5000/api/v1/purchase-orders", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch purchase orders");
        return res.json();
      })
      .then(data => setOrders(data.data?.items ?? data.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "poNumber", header: "PO ID", render: (r) => <span className="admin-po-mgmt__id">#{r.poNumber}</span> },
    {
      key: "vendor",
      header: "Vendor Name",
      render: (r) => (
        <div className="admin-po-mgmt__vendor">
          <span className="admin-po-mgmt__avatar">{(r.vendor?.businessName || '??').substring(0, 2).toUpperCase()}</span>
          {r.vendor?.businessName || 'Unknown Vendor'}
        </div>
      ),
    },
    { key: "event", header: "Event ID", render: (r) => r.eventId || 'N/A' },
    { key: "amount", header: "Budget Amount", render: (r) => <strong>{r.currency} {parseFloat(r.totalAmount).toLocaleString()}</strong> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} label={r.status} /> },
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

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading orders...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;

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
        <StatCard label="Total Orders" value={orders.length.toString()} accentColor="#b51b1e" />
        <StatCard label="Pending Approval" value={orders.filter(o => o.status === 'DRAFT').length.toString()} accentColor="#caa802" />
        <StatCard label="Completed" value={orders.filter(o => o.status === 'FULFILLED').length.toString()} accentColor="#1f8b4c" />
      </div>

      <div className="admin-card admin-po-mgmt__table-card">
        <div className="admin-po-mgmt__panel-head">
          <h3 className="admin-section-title">Active Purchase Orders</h3>
        </div>
        <DataTable
          columns={columns}
          data={orders}
          onRowClick={(row) => navigate(`/admin/purchase-orders/${row.id}`)}
          footer={
            <>
              <span className="admin-po-mgmt__footer-text">Showing {orders.length} entries</span>
            </>
          }
        />
        {orders.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No purchase orders found.</div>}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminPurchaseOrderManagement;