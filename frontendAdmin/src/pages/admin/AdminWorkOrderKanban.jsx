import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import "./admin-tokens.css";
import "./AdminWorkOrderKanban.css";

const EMPTY_FORM = { vendorId: "", description: "", startDate: "", endDate: "", purchaseOrderId: "", eventId: "", lineItemIds: [] };

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
  const [showModal, setShowModal]   = useState(false);
  const [vendors, setVendors]       = useState([]);
  const [pos, setPos]               = useState([]);
  const [poLines, setPoLines]       = useState([]);
  const [loadingLines, setLoadingLines] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
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
  }, [showModal]);

  // When vendor changes, reset PO and line items; reload POs filtered by vendor
  useEffect(() => {
    if (!form.vendorId) { setPos([]); setPoLines([]); return; }
    const token = localStorage.getItem("adminToken");
    fetch(`http://localhost:5000/api/v1/purchase-orders?limit=100&vendorId=${form.vendorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setPos(d.data?.items ?? d.data ?? []))
      .catch(() => {});
    setForm((f) => ({ ...f, purchaseOrderId: "", lineItemIds: [] }));
    setPoLines([]);
  }, [form.vendorId]);

  // When PO changes, fetch its line items
  useEffect(() => {
    if (!form.purchaseOrderId) { setPoLines([]); setForm((f) => ({ ...f, lineItemIds: [] })); return; }
    setLoadingLines(true);
    const token = localStorage.getItem("adminToken");
    fetch(`http://localhost:5000/api/v1/purchase-orders/${form.purchaseOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const lines = d.data?.lines ?? [];
        setPoLines(lines);
        setForm((f) => ({ ...f, lineItemIds: [] }));
      })
      .catch(() => setPoLines([]))
      .finally(() => setLoadingLines(false));
  }, [form.purchaseOrderId]);

  const toggleLineItem = (id) => {
    setForm((f) => ({
      ...f,
      lineItemIds: f.lineItemIds.includes(id)
        ? f.lineItemIds.filter((x) => x !== id)
        : [...f.lineItemIds, id],
    }));
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/v1/work-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch work orders");
      const { data } = await res.json();
      const items = data?.wos ?? data?.items ?? data ?? [];

      const next = {
        todo:       { label: "To Do",       color: "#8e706b", items: [] },
        inProgress: { label: "In Progress", color: "#b51b1e", items: [] },
        completed:  { label: "Completed",   color: "#1f8b4c", items: [] },
      };
      items.forEach((wo) => {
        const taskSummary = wo.tasks?.map((t) => t.purchaseOrderLine?.description).filter(Boolean).join(", ");
        const item = {
          id: wo.id, woNumber: wo.woNumber,
          title: wo.description || taskSummary || wo.woNumber,
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

  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setFormError(null); setPoLines([]); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.vendorId) return setFormError("Please select a vendor.");
    if (!form.purchaseOrderId) return setFormError("A Purchase Order is required.");
    if (form.lineItemIds.length === 0) return setFormError("Select at least one line item as a task.");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        vendorId: form.vendorId,
        purchaseOrderId: form.purchaseOrderId,
        lineItemIds: form.lineItemIds,
        ...(form.description.trim() && { description: form.description.trim() }),
        ...(form.startDate && { startDate: form.startDate }),
        ...(form.endDate && { endDate: form.endDate }),
        ...(form.eventId && { eventId: form.eventId }),
      };
      const res = await fetch("http://localhost:5000/api/v1/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create work order");

      const wo = data.data;
      const taskSummary = wo.tasks?.map((t) => t.purchaseOrderLine?.description).filter(Boolean).join(", ");
      const newItem = {
        id: wo.id, woNumber: wo.woNumber,
        title: wo.description || taskSummary || wo.woNumber,
        vendor: vendors.find((v) => v.id === form.vendorId)?.businessName || "Unknown",
        status: wo.status, tag: wo.status, tagColor: "warning",
        meta: new Date(wo.createdAt).toLocaleDateString(),
      };
      setColumns((prev) => ({
        ...prev,
        todo: { ...prev.todo, items: [...prev.todo.items, newItem] },
      }));
      closeModal();
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
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Assign Work Order</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>×</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Vendor */}
              <div>
                <label style={lbl}>Vendor *</label>
                <select style={inp} value={form.vendorId} onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))} required>
                  <option value="">Select active vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.businessName} — {v.user?.email}</option>
                  ))}
                </select>
              </div>

              {/* Purchase Order — required */}
              <div>
                <label style={lbl}>Purchase Order *</label>
                <select
                  style={inp}
                  value={form.purchaseOrderId}
                  onChange={(e) => setForm((f) => ({ ...f, purchaseOrderId: e.target.value }))}
                  disabled={!form.vendorId}
                  required
                >
                  <option value="">{form.vendorId ? "Select a purchase order..." : "Select a vendor first"}</option>
                  {pos.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber ?? po.id.slice(0, 8)} — ₹{Number(po.totalAmount ?? 0).toLocaleString("en-IN")} ({po.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line items checklist */}
              {form.purchaseOrderId && (
                <div>
                  <label style={lbl}>Tasks (select line items) *</label>
                  {loadingLines ? (
                    <p style={{ fontSize: 13, color: "#6b7280" }}>Loading line items...</p>
                  ) : poLines.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#b91c1c" }}>This PO has no line items.</p>
                  ) : (
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                      {poLines.map((line, idx) => {
                        const checked = form.lineItemIds.includes(line.id);
                        return (
                          <label
                            key={line.id}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                              cursor: "pointer", background: checked ? "#f0fdf4" : idx % 2 === 0 ? "#fff" : "#f9fafb",
                              borderBottom: idx < poLines.length - 1 ? "1px solid #e2e8f0" : "none",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleLineItem(line.id)}
                              style={{ marginTop: 2, accentColor: "#16a34a", width: 15, height: 15, flexShrink: 0 }}
                            />
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{line.description}</span>
                              <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>
                                Qty {line.quantity} × ₹{Number(line.unitPrice).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                              ₹{Number(line.totalPrice).toLocaleString("en-IN")}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {form.lineItemIds.length > 0 && (
                    <p style={{ fontSize: 12, color: "#16a34a", marginTop: 6, fontWeight: 600 }}>
                      {form.lineItemIds.length} item{form.lineItemIds.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              )}

              {/* Description — optional */}
              <div>
                <label style={lbl}>Description <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <textarea
                  style={{ ...inp, minHeight: 70, resize: "vertical" }}
                  placeholder="Additional notes or instructions for this work order..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Dates */}
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

              {/* Event ID */}
              <div>
                <label style={lbl}>Event ID <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <input style={inp} type="text" placeholder="e.g. EVT-2026-001" value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="admin-btn admin-btn--outline" onClick={closeModal}>Cancel</button>
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
