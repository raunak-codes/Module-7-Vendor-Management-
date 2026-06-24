import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import "./admin-tokens.css";
import "./AdminWorkOrderKanban.css";

const EMPTY_FORM = { vendorId: "", description: "", startDate: "", endDate: "", purchaseOrderId: "", eventId: "" };

const AdminWorkOrderKanban = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({
    todo:       { label: "To Do",       color: "#8e706b", items: [] },
    inProgress: { label: "In Progress", color: "#b51b1e", items: [] },
    completed:  { label: "Completed",   color: "#1f8b4c", items: [] },
  });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [dragItem, setDragItem] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [vendors, setVendors]     = useState([]);
  const [pos, setPos]             = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (!showModal) return;
    const token = localStorage.getItem("adminToken");
    fetch("http://localhost:5000/api/v1/vendors?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setVendors((d.data?.items ?? d.data ?? []).filter((v) => v.status === "ACTIVE")))
      .catch(() => {});
    fetch("http://localhost:5000/api/v1/purchase-orders?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setPos(d.data?.items ?? d.data ?? []))
      .catch(() => {});
  }, [showModal]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/v1/work-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch work orders");
      const { data } = await res.json();
      const items = data?.items ?? data ?? [];

      const next = {
        todo:       { label: "To Do",       color: "#8e706b", items: [] },
        inProgress: { label: "In Progress", color: "#b51b1e", items: [] },
        completed:  { label: "Completed",   color: "#1f8b4c", items: [] },
      };
      items.forEach((wo) => {
        const item = {
          id: wo.id, woNumber: wo.woNumber, title: wo.description,
          vendor: wo.vendor?.businessName || "Unknown Vendor", status: wo.status,
          tag: wo.status,
          tagColor: wo.status === "COMPLETED" ? "success" : wo.status === "IN_PROGRESS" ? "info" : "warning",
          meta: new Date(wo.createdAt).toLocaleDateString(),
        };
        if (wo.status === "COMPLETED" || wo.status === "CANCELLED") next.completed.items.push(item);
        else if (wo.status === "IN_PROGRESS" || wo.status === "ON_HOLD") next.inProgress.items.push(item);
        else next.todo.items.push(item);
      });
      setColumns(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (colKey) => {
    if (!dragItem) return;
    const { id, item } = dragItem;
    let newStatus = "ASSIGNED";
    if (colKey === "inProgress") newStatus = "IN_PROGRESS";
    if (colKey === "completed")  newStatus = "COMPLETED";
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/v1/work-orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setColumns((prev) => {
        const next = {};
        Object.keys(prev).forEach((k) => {
          next[k] = { ...prev[k], items: prev[k].items.filter((i) => i.id !== id) };
        });
        next[colKey] = { ...next[colKey], items: [...next[colKey].items, { ...item, status: newStatus, tag: newStatus, tagColor: newStatus === "COMPLETED" ? "success" : "info" }] };
        return next;
      });
    } catch (err) {
      alert(err.message);
    }
    setDragItem(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.vendorId) return setFormError("Please select a vendor.");
    if (!form.description.trim()) return setFormError("Description is required.");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        vendorId: form.vendorId,
        description: form.description,
        ...(form.startDate && { startDate: form.startDate }),
        ...(form.endDate && { endDate: form.endDate }),
        ...(form.purchaseOrderId && { purchaseOrderId: form.purchaseOrderId }),
        ...(form.eventId && { eventId: form.eventId }),
      };
      const res = await fetch("http://localhost:5000/api/v1/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create work order");

      // Add to To Do column immediately
      const wo = data.data;
      const newItem = {
        id: wo.id, woNumber: wo.woNumber, title: wo.description,
        vendor: vendors.find((v) => v.id === form.vendorId)?.businessName || "Unknown",
        status: wo.status, tag: wo.status, tagColor: "warning",
        meta: new Date(wo.createdAt).toLocaleDateString(),
      };
      setColumns((prev) => ({
        ...prev,
        todo: { ...prev.todo, items: [...prev.todo.items, newItem] },
      }));
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, color: "#1e293b", boxSizing: "border-box", background: "#fff" };
  const lbl = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" };

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading work orders...</div></AdminLayout>;
  if (error)   return <AdminLayout><div style={{ padding: 40, color: "red" }}>Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout searchPlaceholder="Search work orders...">
      <div className="admin-page admin-wo-kanban">
        <PageHeader
          title="Work Order Management"
          subtitle="Manage and track vendor assignments."
          actions={
            <button className="admin-btn admin-btn--primary" onClick={() => setShowModal(true)}>
              + Assign Task
            </button>
          }
        />

        <div className="admin-wo-kanban__board">
          {Object.entries(columns).map(([key, col]) => (
            <div key={key} className="admin-wo-kanban__column" onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(key)}>
              <div className="admin-wo-kanban__col-head">
                <span className="admin-wo-kanban__col-dot" style={{ background: col.color }} />
                <h3>{col.label}</h3>
                <span className="admin-wo-kanban__col-count">{col.items.length}</span>
              </div>
              <div className="admin-wo-kanban__col-body">
                {col.items.map((item) => (
                  <div
                    key={item.id}
                    className="admin-wo-kanban__card"
                    draggable
                    onDragStart={() => setDragItem({ id: item.id, item })}
                    onClick={() => navigate(`/admin/work-orders/${item.id}`)}
                  >
                    <span className={`admin-wo-kanban__tag admin-wo-kanban__tag--${item.tagColor}`}>{item.tag}</span>
                    <p className={`admin-wo-kanban__card-title${key === "completed" ? " admin-wo-kanban__card-title--done" : ""}`}>
                      [{item.woNumber}] {item.title}
                    </p>
                    <p className="admin-wo-kanban__card-vendor">👤 {item.vendor}</p>
                    {item.meta && key === "todo" && (
                      <div className="admin-wo-kanban__card-footer">
                        <span className="admin-wo-kanban__card-time">🕐 {item.meta}</span>
                        <button
                          className="admin-btn admin-btn--outline"
                          style={{ flex: 1 }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/work-orders/${item.id}`); }}
                        >
                          Details
                        </button>
                      </div>
                    )}
                    {item.meta && key === "completed" && (
                      <p className="admin-wo-kanban__card-time admin-wo-kanban__card-time--done">✓ {item.meta}</p>
                    )}
                  </div>
                ))}
                {col.items.length === 0 && (
                  <div style={{ color: "#6b7280", fontSize: 13, textAlign: "center", marginTop: 20 }}>Drop here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Work Order Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setForm(EMPTY_FORM); setFormError(null); } }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Assign Work Order</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setFormError(null); }}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>×</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lbl}>Vendor *</label>
                <select style={inp} value={form.vendorId} onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))} required>
                  <option value="">Select active vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.businessName} — {v.user?.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Task Description *</label>
                <textarea
                  style={{ ...inp, minHeight: 80, resize: "vertical" }}
                  placeholder="e.g. Setup and manage catering for 200 guests on Dec 12"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Start Date</label>
                  <input style={inp} type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>End Date</label>
                  <input style={inp} type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={lbl}>Link to Purchase Order (optional)</label>
                <select style={inp} value={form.purchaseOrderId} onChange={(e) => setForm((f) => ({ ...f, purchaseOrderId: e.target.value }))}>
                  <option value="">— None —</option>
                  {pos.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber ?? po.id.slice(0, 8)} — ₹{Number(po.totalAmount ?? 0).toLocaleString('en-IN')} ({po.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Event ID (optional)</label>
                <input style={inp} type="text" placeholder="e.g. EVT-2026-001" value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="admin-btn admin-btn--outline"
                  onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setFormError(null); }}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWorkOrderKanban;
