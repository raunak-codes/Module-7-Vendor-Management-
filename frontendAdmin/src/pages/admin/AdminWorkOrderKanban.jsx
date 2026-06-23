import React, { useState } from "react";
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

const INITIAL_COLUMNS = {
  todo: {
    label: "To Do",
    color: "#8e706b",
    items: [
      { id: "WO-1", tag: "High Priority", tagColor: "error", title: "Stage Rigging Setup", vendor: "Elite Production Services", meta: "Today, 4:00 PM" },
      { id: "WO-2", tag: "Logistics", tagColor: "warning", title: "Linen Delivery Inspection", vendor: "Luxe Textiles Co.", meta: "Oct 24, 09:00 AM" },
    ],
  },
  inProgress: {
    label: "In Progress",
    color: "#b51b1e",
    items: [
      { id: "WO-3", tag: "Critical Phase", tagColor: "error", title: "Grand Piano Tuning", vendor: "Steinway Specialist Team", progress: 65 },
      { id: "WO-4", tag: "AV / Technical", tagColor: "info", title: "Main LED Wall Testing", vendor: "Visionary Visuals LLC", progress: 40 },
    ],
  },
  completed: {
    label: "Completed",
    color: "#1f8b4c",
    items: [
      { id: "WO-5", tag: "Finished", tagColor: "success", title: "Security Perimeter Setup", vendor: "Safeguard Elite", meta: "Completed 2h ago" },
      { id: "WO-6", tag: "Finished", tagColor: "success", title: "Floral Chandelier Installation", vendor: "Bloom & Stem Designs", meta: "Completed 5h ago" },
    ],
  },
};

const AdminWorkOrderKanban = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [dragItem, setDragItem] = useState(null);

  const handleDrop = (colKey) => {
    if (!dragItem) return;
    setColumns((prev) => {
      const next = { ...prev };
      // remove from source
      Object.keys(next).forEach((k) => {
        next[k] = { ...next[k], items: next[k].items.filter((i) => i.id !== dragItem.id) };
      });
      next[colKey] = { ...next[colKey], items: [...next[colKey].items, dragItem.item] };
      return next;
    });
    setDragItem(null);
  };

  return (
    <AdminLayout searchPlaceholder="Search work orders...">
      <div className="admin-page admin-wo-kanban">
      <PageHeader
        title="Work Order Management"
        subtitle="Gala 2026: Grand Ballroom Preparation Phase"
        actions={
          <>
            <button className="admin-btn admin-btn--outline">Filter View</button>
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
                    {item.title}
                  </p>
                  <p className="admin-wo-kanban__card-vendor">👤 {item.vendor}</p>

                  {item.progress != null && (
                    <>
                      <div className="admin-wo-kanban__progress-track">
                        <div style={{ width: `${item.progress}%` }} />
                      </div>
                      <p className="admin-wo-kanban__progress-label">{item.progress}% Completed</p>
                      <button
                        className="admin-btn admin-btn--danger"
                        style={{ width: "100%" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDrop("completed");
                        }}
                      >
                        Mark Complete
                      </button>
                    </>
                  )}

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
                        <button className="admin-wo-kanban__icon-btn" onClick={(e) => e.stopPropagation()}>
                          💬
                        </button>
                      </div>
                    </div>
                  )}

                  {item.meta && key === "completed" && (
                    <>
                      <p className="admin-wo-kanban__card-time admin-wo-kanban__card-time--done">✓ {item.meta}</p>
                      <button className="admin-btn admin-btn--outline" style={{ width: "100%" }}>
                        View Report
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="admin-fab" aria-label="Assign task">
        📝
      </button>
    </div>
    </AdminLayout>
  );
};

export default AdminWorkOrderKanban;