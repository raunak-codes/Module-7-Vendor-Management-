import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import "./admin-tokens.css";

const emptyLine = () => ({ description: "", quantity: 1, unitPrice: "" });

const AdminCreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    vendorId: "",
    eventId: "",
    currency: "INR",
    issueDate: "",
    expectedDeliveryDate: "",
  });
  const [lines, setLines] = useState([emptyLine()]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch("http://localhost:5000/api/v1/vendors?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setVendors(d.data?.items ?? d.data ?? []))
      .catch(() => {});
  }, []);

  const totalAmount = lines.reduce(
    (sum, l) => sum + (parseFloat(l.unitPrice) || 0) * (parseInt(l.quantity) || 0),
    0
  );

  const setLine = (idx, field, value) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.vendorId) return setError("Please select a vendor.");
    if (lines.some((l) => !l.description || !l.unitPrice)) return setError("All line items need a description and unit price.");

    const payload = {
      vendorId: form.vendorId,
      totalAmount,
      currency: form.currency || "INR",
      ...(form.eventId && { eventId: form.eventId }),
      ...(form.issueDate && { issueDate: form.issueDate }),
      ...(form.expectedDeliveryDate && { expectedDeliveryDate: form.expectedDeliveryDate }),
      lines: lines.map((l) => ({
        description: l.description,
        quantity: parseInt(l.quantity),
        unitPrice: parseFloat(l.unitPrice),
      })),
    };

    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/v1/purchase-orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create purchase order");
      navigate(`/admin/purchase-orders/${data.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = {
    label: { display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, color: "#1e293b", boxSizing: "border-box", background: "#fff" },
    select: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, color: "#1e293b", background: "#fff", boxSizing: "border-box" },
  };

  return (
    <AdminLayout searchPlaceholder="Create purchase order...">
      <div className="admin-page" style={{ maxWidth: 860 }}>
        <PageHeader
          breadcrumb={[{ label: "Purchase Orders", to: "/admin/purchase-orders" }, { label: "New" }]}
          title="Create Purchase Order"
          subtitle="Issue a new PO to an approved vendor."
        />

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 24, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Vendor & Meta */}
          <div className="admin-card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Order Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={field.label}>Vendor *</label>
                <select
                  style={field.select}
                  value={form.vendorId}
                  onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
                  required
                >
                  <option value="">Select a vendor...</option>
                  {vendors
                    .filter((v) => v.status === "ACTIVE")
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.businessName} — {v.user?.email}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label style={field.label}>Event ID (optional)</label>
                <input
                  style={field.input}
                  type="text"
                  placeholder="e.g. EVT-2026-001"
                  value={form.eventId}
                  onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
                />
              </div>

              <div>
                <label style={field.label}>Currency</label>
                <select
                  style={field.select}
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div>
                <label style={field.label}>Issue Date</label>
                <input
                  style={field.input}
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                />
              </div>

              <div>
                <label style={field.label}>Expected Delivery Date</label>
                <input
                  style={field.input}
                  type="date"
                  value={form.expectedDeliveryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expectedDeliveryDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="admin-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 className="admin-section-title" style={{ margin: 0 }}>Line Items</h3>
              <button type="button" className="admin-btn admin-btn--outline" onClick={addLine} style={{ fontSize: 13 }}>
                + Add Line
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 36px", gap: "8px 12px", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Description</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Qty</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Unit Price</span>
              <span />

              {lines.map((line, idx) => (
                <React.Fragment key={idx}>
                  <input
                    style={field.input}
                    type="text"
                    placeholder="e.g. Catering service for 200 guests"
                    value={line.description}
                    onChange={(e) => setLine(idx, "description", e.target.value)}
                    required
                  />
                  <input
                    style={{ ...field.input, textAlign: "center" }}
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => setLine(idx, "quantity", e.target.value)}
                    required
                  />
                  <input
                    style={field.input}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={line.unitPrice}
                    onChange={(e) => setLine(idx, "unitPrice", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={lines.length === 1}
                    style={{ background: "none", border: "none", cursor: lines.length === 1 ? "not-allowed" : "pointer", color: "#ef4444", fontSize: 18, padding: 0 }}
                    title="Remove line"
                  >
                    ×
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Total Amount</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
                {form.currency} {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => navigate("/admin/purchase-orders")}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCreatePurchaseOrder;
