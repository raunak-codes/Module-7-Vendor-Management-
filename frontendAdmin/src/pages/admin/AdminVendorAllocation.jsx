import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import "./admin-tokens.css";
import "./AdminVendorAllocation.css";

const STATUS_COLOR = {
  ASSIGNED: "#2563eb",
  IN_PROGRESS: "#16a34a",
  COMPLETED: "#7c3aed",
  ON_HOLD: "#d97706",
  CANCELLED: "#dc2626",
};

const STATUS_LABEL = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

export default function AdminVendorAllocation() {
  const [workOrders, setWorkOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWO, setSelectedWO] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [newWOModal, setNewWOModal] = useState(false);
  const [newWOForm, setNewWOForm] = useState({ vendorId: "", description: "", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [woRes, vendorRes] = await Promise.all([
        fetch("http://localhost:5000/api/v1/work-orders?limit=100", { headers }),
        fetch("http://localhost:5000/api/v1/vendors?limit=100", { headers }),
      ]);
      const woData = await woRes.json();
      const vendorData = await vendorRes.json();
      setWorkOrders(woData.data ?? []);
      setVendors(vendorData.data?.items ?? vendorData.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (woId, status) => {
    try {
      await fetch(`http://localhost:5000/api/v1/work-orders/${woId}/status`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setWorkOrders(prev => prev.map(w => w.id === woId ? { ...w, status } : w));
    } catch (e) { console.error(e); }
  };

  const assignVendor = async () => {
    if (!selectedWO || !selectedVendor) return;
    setSaving(true);
    try {
      await fetch(`http://localhost:5000/api/v1/work-orders/${selectedWO.id}/status`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ASSIGNED" }),
      });
      setWorkOrders(prev => prev.map(w => w.id === selectedWO.id ? { ...w, vendorId: selectedVendor.id, vendor: { businessName: selectedVendor.businessName }, status: "ASSIGNED" } : w));
      setAssignModalOpen(false);
      setSelectedWO(null);
      setSelectedVendor(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const createWorkOrder = async () => {
    if (!newWOForm.vendorId || !newWOForm.description) return;
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/work-orders", {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(newWOForm),
      });
      const d = await res.json();
      if (d.data) setWorkOrders(prev => [d.data, ...prev]);
      setNewWOModal(false);
      setNewWOForm({ vendorId: "", description: "", startDate: "", endDate: "" });
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const filtered = workOrders.filter(wo => {
    const matchStatus = statusFilter === "ALL" || wo.status === statusFilter;
    const matchSearch = !search || wo.vendor?.businessName?.toLowerCase().includes(search.toLowerCase()) || wo.woNumber?.toLowerCase().includes(search.toLowerCase()) || wo.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredVendors = vendors.filter(v =>
    v.status === "ACTIVE" && (!search || v.businessName.toLowerCase().includes(search.toLowerCase()) || v.category?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  // Stats
  const total = workOrders.length;
  const active = workOrders.filter(w => w.status === "IN_PROGRESS").length;
  const assigned = workOrders.filter(w => w.status === "ASSIGNED").length;
  const completed = workOrders.filter(w => w.status === "COMPLETED").length;

  return (
    <AdminLayout searchPlaceholder="Search vendors or work orders...">
      <div className="admin-page admin-allocation">
        <PageHeader
          title="Vendor Allocation"
          subtitle="Assign approved vendors to work orders and manage their status."
          actions={
            <>
              <button className="admin-btn admin-btn--outline" onClick={() => fetchAll()}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span> Refresh
              </button>
              <button className="admin-btn admin-btn--primary" onClick={() => setNewWOModal(true)}>
                + New Allocation
              </button>
            </>
          }
        />

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Work Orders", value: total, color: "var(--admin-primary)" },
            { label: "Assigned", value: assigned, color: "#2563eb" },
            { label: "In Progress", value: active, color: "#16a34a" },
            { label: "Completed", value: completed, color: "#7c3aed" },
          ].map(s => (
            <div key={s.label} className="admin-card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--admin-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--admin-on-surface)", fontFamily: "Manrope" }}>{s.value}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>assignment</span>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-allocation__grid">
          {/* Left — Work Orders List */}
          <div className="admin-card admin-allocation__events" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid var(--admin-surface-container)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="admin-section-title">Work Orders</h3>
                <span style={{ padding: "2px 10px", borderRadius: 9999, background: "var(--admin-surface-container)", fontSize: 12, fontWeight: 700 }}>
                  {filtered.length} total
                </span>
              </div>
              <input
                className="admin-input"
                placeholder="Search work orders or vendors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", marginBottom: 10, boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["ALL", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: "pointer", border: statusFilter === s ? "2px solid var(--admin-primary)" : "1px solid var(--admin-outline-variant)", background: statusFilter === s ? "var(--admin-primary)" : "transparent", color: statusFilter === s ? "#fff" : "var(--admin-secondary)" }}>
                    {s === "ALL" ? "All" : STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowY: "auto", maxHeight: 520 }}>
              {loading && <p style={{ padding: 24, color: "#6b7280", textAlign: "center" }}>Loading...</p>}
              {!loading && filtered.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3, display: "block", marginBottom: 8 }}>assignment_late</span>
                  <p style={{ fontWeight: 600 }}>No work orders found</p>
                </div>
              )}
              {filtered.map(wo => (
                <div key={wo.id}
                  onClick={() => setSelectedWO(selectedWO?.id === wo.id ? null : wo)}
                  style={{ padding: "16px 20px", borderBottom: "1px solid var(--admin-surface-container)", cursor: "pointer", borderLeft: `4px solid ${STATUS_COLOR[wo.status] ?? "#e5e7eb"}`, background: selectedWO?.id === wo.id ? "var(--admin-surface-container-low)" : "transparent", transition: "background 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--admin-secondary)", marginBottom: 2 }}>{wo.woNumber}</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--admin-on-surface)" }}>{wo.vendor?.businessName ?? "Unassigned"}</p>
                    </div>
                    <span style={{ padding: "3px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 700, background: `${STATUS_COLOR[wo.status]}18`, color: STATUS_COLOR[wo.status], textTransform: "uppercase" }}>
                      {STATUS_LABEL[wo.status] ?? wo.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--admin-secondary)", marginBottom: 8 }}>{wo.description ?? "—"}</p>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--admin-secondary)" }}>
                    {wo.startDate && <span>Start: {new Date(wo.startDate).toLocaleDateString("en-IN")}</span>}
                    {wo.endDate && <span>End: {new Date(wo.endDate).toLocaleDateString("en-IN")}</span>}
                    <span>PO: {wo.purchaseOrder?.poNumber ?? "—"}</span>
                  </div>

                  {/* Inline status actions */}
                  {selectedWO?.id === wo.id && (
                    <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                      {["ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"].filter(s => s !== wo.status).map(s => (
                        <button key={s} onClick={() => updateStatus(wo.id, s)}
                          style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${STATUS_COLOR[s]}`, background: "transparent", color: STATUS_COLOR[s] }}>
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                      <button onClick={() => { setAssignModalOpen(true); }}
                        style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid var(--admin-primary)", background: "var(--admin-primary)", color: "#fff" }}>
                        Reassign Vendor
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Available Vendors */}
          <div className="admin-card admin-allocation__vendors" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid var(--admin-surface-container)" }}>
              <h3 className="admin-section-title" style={{ marginBottom: 12 }}>Available Vendors</h3>
              <input className="admin-input" placeholder="Filter by specialty..."
                style={{ width: "100%", boxSizing: "border-box" }}
                onChange={e => setSearch(e.target.value)} />
            </div>

            <div style={{ overflowY: "auto", flex: 1, maxHeight: 420 }}>
              {filteredVendors.length === 0 && (
                <p style={{ padding: 24, color: "#6b7280", textAlign: "center", fontSize: 13 }}>No active vendors found.</p>
              )}
              {filteredVendors.map(v => {
                const activeWOs = workOrders.filter(w => w.vendorId === v.id && ["ASSIGNED", "IN_PROGRESS"].includes(w.status)).length;
                const isSelected = selectedVendor?.id === v.id;
                return (
                  <div key={v.id} onClick={() => setSelectedVendor(isSelected ? null : v)}
                    style={{ padding: "14px 20px", borderBottom: "1px solid var(--admin-surface-container)", cursor: "pointer", background: isSelected ? "rgba(133,18,23,0.04)" : "transparent", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: isSelected ? "var(--admin-primary)" : "var(--admin-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: isSelected ? "#fff" : "var(--admin-secondary)", flexShrink: 0, fontSize: 14 }}>
                      {v.businessName.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--admin-on-surface)", marginBottom: 2 }}>{v.businessName}</p>
                      <p style={{ fontSize: 12, color: "var(--admin-secondary)", marginBottom: 6 }}>{v.category?.name ?? "—"}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--admin-secondary)", marginBottom: 4 }}>
                        <span>Active Work Orders</span>
                        <span style={{ fontWeight: 700 }}>{activeWOs}</span>
                      </div>
                      <div style={{ height: 4, background: "var(--admin-surface-container)", borderRadius: 9999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(activeWOs * 20, 100)}%`, background: activeWOs > 3 ? "#dc2626" : "var(--admin-primary)", borderRadius: 9999 }} />
                      </div>
                    </div>
                    {isSelected && <span className="material-symbols-outlined" style={{ color: "var(--admin-primary)", fontSize: 20, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 16, borderTop: "1px solid var(--admin-surface-container)", display: "flex", gap: 10 }}>
              <button className="admin-btn admin-btn--outline" style={{ flex: 1 }} onClick={() => { setSelectedVendor(null); setSelectedWO(null); }}>
                Clear Selection
              </button>
              <button className="admin-btn admin-btn--danger" style={{ flex: 1 }}
                disabled={!selectedWO || !selectedVendor}
                onClick={() => setAssignModalOpen(true)}>
                + Assign
              </button>
            </div>
          </div>
        </div>

        {/* Assign Confirmation Modal */}
        {assignModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <h3 style={{ fontFamily: "Manrope", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Confirm Assignment</h3>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>Assign the selected vendor to this work order?</p>
              {selectedWO && (
                <div style={{ padding: 14, background: "#f8f9fa", borderRadius: 10, marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: "#6b7280" }}>Work Order</p>
                  <p style={{ fontWeight: 700 }}>{selectedWO.woNumber} — {selectedWO.description}</p>
                </div>
              )}
              {selectedVendor && (
                <div style={{ padding: 14, background: "#f8f9fa", borderRadius: 10, marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: "#6b7280" }}>Vendor</p>
                  <p style={{ fontWeight: 700 }}>{selectedVendor.businessName}</p>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>{selectedVendor.category?.name}</p>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setAssignModalOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={assignVendor} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "var(--admin-primary)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Assigning..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Work Order Modal */}
        {newWOModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <h3 style={{ fontFamily: "Manrope", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>New Work Order Allocation</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Assign to Vendor *</label>
                  <select value={newWOForm.vendorId} onChange={e => setNewWOForm(f => ({ ...f, vendorId: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}>
                    <option value="">Select vendor...</option>
                    {vendors.filter(v => v.status === "ACTIVE").map(v => (
                      <option key={v.id} value={v.id}>{v.businessName} — {v.category?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Description *</label>
                  <textarea value={newWOForm.description} onChange={e => setNewWOForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the work to be done..." rows={3}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["startDate", "Start Date"], ["endDate", "End Date"]].map(([key, label]) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>{label}</label>
                      <input type="date" value={newWOForm[key]} onChange={e => setNewWOForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button onClick={() => setNewWOModal(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={createWorkOrder} disabled={saving || !newWOForm.vendorId || !newWOForm.description}
                  style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "var(--admin-primary)", color: "#fff", cursor: "pointer", fontWeight: 700, opacity: (!newWOForm.vendorId || !newWOForm.description) ? 0.5 : 1 }}>
                  {saving ? "Creating..." : "Create Work Order"}
                </button>
              </div>
            </div>
          </div>
        )}

        <button className="admin-fab" aria-label="Add allocation" onClick={() => setNewWOModal(true)}>
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </AdminLayout>
  );
}
