import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import "./admin-tokens.css";
import "./AdminWorkOrderKanban.css";

/**
 * AdminWorkOrderKanban
 * Drag-style kanban board for work orders across To Do / In Progress / Completed.
 * Matches Stitch screen: work_order_kanban
 */

const AdminWorkOrderKanban = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({
    todo: { label: "To Do", color: "#8e706b", items: [] },
    inProgress: { label: "In Progress", color: "#b51b1e", items: [] },
    completed: { label: "Completed", color: "#1f8b4c", items: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragItem, setDragItem] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/v1/work-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch work orders");
      const { data } = await res.json();
      
      const newColumns = {
        todo: { label: "To Do", color: "#8e706b", items: [] },
        inProgress: { label: "In Progress", color: "#b51b1e", items: [] },
        completed: { label: "Completed", color: "#1f8b4c", items: [] },
      };

      data.forEach(wo => {
        const item = {
          id: wo.id,
          woNumber: wo.woNumber,
          title: wo.description,
          vendor: wo.vendor?.businessName || 'Unknown Vendor',
          status: wo.status,
          tag: wo.status,
          tagColor: wo.status === 'COMPLETED' ? 'success' : wo.status === 'IN_PROGRESS' ? 'info' : 'warning',
          meta: new Date(wo.createdAt).toLocaleDateString()
        };
        if (wo.status === 'COMPLETED' || wo.status === 'CANCELLED') {
          newColumns.completed.items.push(item);
        } else if (wo.status === 'IN_PROGRESS' || wo.status === 'ON_HOLD') {
          newColumns.inProgress.items.push(item);
        } else {
          newColumns.todo.items.push(item);
        }
      });
      setColumns(newColumns);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (colKey) => {
    if (!dragItem) return;
    const { id, item } = dragItem;
    let newStatus = 'DRAFT';
    if (colKey === 'inProgress') newStatus = 'IN_PROGRESS';
    if (colKey === 'completed') newStatus = 'COMPLETED';

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/v1/work-orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setColumns((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = { ...next[k], items: next[k].items.filter((i) => i.id !== id) };
        });
        next[colKey] = { ...next[colKey], items: [...next[colKey].items, { ...item, status: newStatus, tag: newStatus, tagColor: newStatus === 'COMPLETED' ? 'success' : 'info' }] };
        return next;
      });
    } catch (err) {
      alert(err.message);
    }
    setDragItem(null);
  };

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading work orders...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout searchPlaceholder="Search work orders...">
      <div className="admin-page admin-wo-kanban">
      <PageHeader
        title="Work Order Management"
        subtitle="Manage and track vendor assignments."
        actions={
          <>
            <button className="admin-btn admin-btn--primary">+ Assign Task</button>
          </>
        }
      />

      <div className="admin-wo-kanban__board">
        {Object.entries(columns).map(([key, col]) => (
          <div
            key={key}
            className="admin-wo-kanban__column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(key)}
          >
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
                      <span className="admin-wo-kanban__card-time">🕓 {item.meta}</span>
                      <div className="admin-wo-kanban__card-actions">
                        <button
                          className="admin-btn admin-btn--outline"
                          style={{ flex: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/work-orders/${item.id}`);
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  )}

                  {item.meta && key === "completed" && (
                    <>
                      <p className="admin-wo-kanban__card-time admin-wo-kanban__card-time--done">✓ {item.meta}</p>
                    </>
                  )}
                </div>
              ))}
              {col.items.length === 0 && <div style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 20 }}>Drop here</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminWorkOrderKanban;