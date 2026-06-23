import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import "./admin-tokens.css";
import "./AdminPurchaseOrderDetails.css";

const AdminPurchaseOrderDetails = () => {
  const navigate = useNavigate();
  const { poId } = useParams();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch(`http://localhost:5000/api/v1/purchase-orders/${poId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch purchase order");
        return res.json();
      })
      .then((data) => setPo(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [poId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/v1/purchase-orders/${poId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setPo((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading PO details...</div></AdminLayout>;
  if (error)   return <AdminLayout><div style={{ padding: 40, color: "red" }}>Error: {error}</div></AdminLayout>;
  if (!po)     return <AdminLayout><div style={{ padding: 40 }}>Purchase order not found.</div></AdminLayout>;

  const isAccepted = ["ACCEPTED", "CONFIRMED", "FULFILLED"].includes(po.status);

  return (
    <AdminLayout searchPlaceholder="Search purchase orders...">
      <div className="admin-page admin-po-details">
        <PageHeader
          breadcrumb={[{ label: "Purchase Orders" }, { label: po.poNumber }]}
          title={po.poNumber}
          subtitle={
            <span className="admin-po-details__subtitle-row">
              <StatusBadge status={po.status.toLowerCase()} label={po.status} />
              <span>Issued {new Date(po.issueDate || po.createdAt).toLocaleDateString()}</span>
            </span>
          }
          actions={
            <>
              {po.status === "DRAFT" && (
                <button className="admin-btn admin-btn--primary" onClick={() => handleStatusChange("ISSUED")}>
                  Issue to Vendor
                </button>
              )}
              {po.status !== "CANCELLED" && (
                <button className="admin-btn admin-btn--danger" onClick={() => handleStatusChange("CANCELLED")}>
                  Cancel PO
                </button>
              )}
            </>
          }
        />

        <div className="admin-po-details__grid">
          <div className="admin-po-details__main">

            {/* Order Details */}
            <div className="admin-card admin-po-details__section">
              <h3 className="admin-section-title">Order Details</h3>
              <div className="admin-po-details__info-grid">
                <div>
                  <span className="admin-label">PO Reference</span>
                  <p>{po.poNumber}</p>
                </div>
                <div>
                  <span className="admin-label">Event ID</span>
                  <p>{po.eventId || "N/A"}</p>
                </div>
                <div>
                  <span className="admin-label">Currency</span>
                  <p>{po.currency || "INR"}</p>
                </div>
                <div>
                  <span className="admin-label">Expected Delivery</span>
                  <p>{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : "TBD"}</p>
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            <div className="admin-card admin-po-details__section">
              <h3 className="admin-section-title">Vendor Information</h3>
              <div className="admin-po-details__vendor-row">
                <div className="admin-po-details__vendor-avatar">
                  {(po.vendor?.businessName || "?").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="admin-po-details__vendor-name">{po.vendor?.businessName}</p>
                  <p className="admin-po-details__vendor-tag">{po.vendor?.category?.name || "Vendor"}</p>
                </div>
              </div>
              <ul className="admin-po-details__vendor-contact">
                <li>{po.vendor?.contactPersonName}</li>
                <li>{po.vendor?.user?.phone || "N/A"}</li>
                <li>{po.vendor?.user?.email || "N/A"}</li>
              </ul>
            </div>

            {/* Line Items */}
            <div className="admin-card admin-po-details__section">
              <div className="admin-po-details__panel-head">
                <h3 className="admin-section-title">Deliverables & Scope</h3>
                <span className="admin-po-details__items-count">{po.lines?.length || 0} ITEMS TOTAL</span>
              </div>
              {po.lines?.map((d) => (
                <div className="admin-po-details__deliverable" key={d.id}>
                  <div className="admin-po-details__deliverable-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#6b7280" }}>inventory_2</span>
                  </div>
                  <div className="admin-po-details__deliverable-info">
                    <div className="admin-po-details__deliverable-top">
                      <p className="admin-po-details__deliverable-name">{d.description}</p>
                      <p className="admin-po-details__deliverable-amount">
                        {po.currency} {parseFloat(d.totalPrice ?? d.unitPrice * d.quantity).toLocaleString()}
                      </p>
                    </div>
                    <p className="admin-po-details__deliverable-desc">
                      Qty: {d.quantity} @ {po.currency} {parseFloat(d.unitPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!po.lines || po.lines.length === 0) && (
                <p style={{ color: "#6b7280" }}>No deliverables specified.</p>
              )}
            </div>
          </div>

          {/* Side */}
          <div className="admin-po-details__side">
            <div className="admin-card admin-po-details__tracker">
              <h3 className="admin-section-title">Status Tracker</h3>
              <ul className="admin-po-details__tracker-list">
                <li className="admin-po-details__tracker-item admin-po-details__tracker-item--done">
                  <span className="admin-po-details__tracker-dot">done</span>
                  <div><p className="admin-po-details__tracker-label">Drafted</p></div>
                </li>
                <li className={`admin-po-details__tracker-item admin-po-details__tracker-item--${po.status !== "DRAFT" ? "done" : "upcoming"}`}>
                  <span className="admin-po-details__tracker-dot">{po.status !== "DRAFT" ? "done" : ""}</span>
                  <div><p className="admin-po-details__tracker-label">Issued</p></div>
                </li>
                <li className={`admin-po-details__tracker-item admin-po-details__tracker-item--${isAccepted ? "done" : "upcoming"}`}>
                  <span className="admin-po-details__tracker-dot">{isAccepted ? "done" : ""}</span>
                  <div><p className="admin-po-details__tracker-label">Accepted</p></div>
                </li>
              </ul>
            </div>

            <div className="admin-po-details__budget">
              <div className="admin-po-details__budget-head">
                <h3>Budget Summary</h3>
              </div>
              <div className="admin-po-details__budget-total">
                <span>Grand Total</span>
                <strong>{po.currency} {parseFloat(po.totalAmount).toLocaleString()}</strong>
              </div>
              <span className="admin-po-details__budget-currency">CURRENCY {po.currency}</span>
            </div>

            <div className="admin-card admin-po-details__timeline">
              <h3 className="admin-section-title">Estimated Timeline</h3>
              <div className="admin-po-details__timeline-row">
                <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>local_shipping</span>
                <div>
                  <p>Estimated Delivery</p>
                  <strong>{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : "TBD"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/admin/purchase-orders")}>
          Back to Purchase Orders
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminPurchaseOrderDetails;
