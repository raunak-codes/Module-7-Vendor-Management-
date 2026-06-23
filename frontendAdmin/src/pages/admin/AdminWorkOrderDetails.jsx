import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import "./admin-tokens.css";
import "./AdminWorkOrderDetails.css";

/**
 * AdminWorkOrderDetails
 * Single work order deep-dive with progress stepper, attachments and chat.
 * Matches Stitch screen: work_order_details
 */

const AdminWorkOrderDetails = () => {
  const navigate = useNavigate();
  const { workOrderId } = useParams();
  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch(`http://localhost:5000/api/v1/work-orders/${workOrderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch work order");
        return res.json();
      })
      .then(data => setWo(data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [workOrderId]);

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading WO details...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;
  if (!wo) return <AdminLayout><div style={{ padding: 40 }}>Work order not found.</div></AdminLayout>;

  return (
    <AdminLayout searchPlaceholder="Search work orders...">
      <div className="admin-page admin-wo-details">
      <PageHeader
        breadcrumb={[{ label: "Work Orders" }, { label: wo.woNumber }]}
        title={
          <span className="admin-wo-details__title-row">
            {wo.description} <StatusBadge status={wo.status.toLowerCase()} label={wo.status} />
          </span>
        }
        actions={
          <>
            <button className="admin-btn admin-btn--outline">↗ Share</button>
            {wo.status !== 'COMPLETED' && (
              <button className="admin-btn admin-btn--primary">✓ Complete Task</button>
            )}
          </>
        }
      />

      <div className="admin-wo-details__grid">
        <div className="admin-wo-details__main">
          <div className="admin-card admin-wo-details__section">
            <h3 className="admin-section-title">Task Details</h3>
            <p className="admin-wo-details__desc">
              {wo.description}
            </p>
            <div className="admin-wo-details__meta-grid">
              <div>
                <span className="admin-label">WO Reference</span>
                <p>{wo.woNumber}</p>
              </div>
              <div>
                <span className="admin-label">PO Reference</span>
                <p>{wo.purchaseOrder?.poNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="admin-label">Start Date</span>
                <p>{wo.startDate ? new Date(wo.startDate).toLocaleDateString() : 'TBD'}</p>
              </div>
              <div>
                <span className="admin-label">Due Date</span>
                <p>{wo.endDate ? new Date(wo.endDate).toLocaleDateString() : 'TBD'}</p>
              </div>
            </div>
          </div>

          <div className="admin-card admin-wo-details__section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
             <p style={{ color: '#6b7280' }}>Attachments Coming Soon</p>
          </div>

          <div className="admin-card admin-wo-details__section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p style={{ color: '#6b7280' }}>Collaboration Chat Coming Soon</p>
          </div>
        </div>

        <div className="admin-wo-details__side">
          <div className="admin-card admin-wo-details__vendor">
            <h3 className="admin-section-title">Assigned Vendor</h3>
            <div className="admin-wo-details__vendor-row">
              <div className="admin-wo-details__vendor-avatar">{(wo.vendor?.businessName || '?').substring(0, 2).toUpperCase()}</div>
              <div>
                <p className="admin-wo-details__vendor-name">{wo.vendor?.businessName}</p>
                <p className="admin-wo-details__vendor-rating">Vendor ID: {wo.vendor?.id.substring(0,8)}</p>
              </div>
            </div>
            <div className="admin-wo-details__vendor-meta">
              <div>
                <span>Contact</span>
                <strong>{wo.vendor?.contactPersonName}</strong>
              </div>
            </div>
            <div className="admin-wo-details__vendor-actions">
              <button className="admin-btn admin-btn--outline">📞 Call</button>
              <button className="admin-btn admin-btn--outline">✉ Email</button>
            </div>
          </div>
        </div>
      </div>

      <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/admin/work-orders")}>
        ← Back to Work Orders
      </button>
    </div>
    </AdminLayout>
  );
};

export default AdminWorkOrderDetails;