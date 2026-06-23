import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import "./admin-tokens.css";
import "./AdminVendorAllocation.css";

/**
 * AdminVendorAllocation
 * Drag-style weekly calendar for assigning vendors to active events.
 * Matches Stitch screen: vendor_allocation
 */

const ACTIVE_EVENTS = [
  { name: "Winter Gala: Alpine Luxury", dates: "Oct 12-14", venue: "The Ritz Carlton, Zurich", load: 65, slots: 8, color: "#b51b1e" },
  { name: "Tech Summit 2026", dates: "Oct 22-25", venue: "Convention Center East", load: 30, slots: 15, color: "#caa802" },
  { name: "Sustainable Fashion Expo", dates: "Nov 05-07", venue: "Greenhouse Studios", load: 10, slots: 32, color: "#b51b1e" },
];

const AVAILABLE_VENDORS = [
  { name: "Elite Catering Co.", category: "Premium Culinary", capacity: "4/5 Active", pct: 80, icon: "🍽" },
  { name: "Symphony Orch.", category: "Live Entertainment", capacity: "1/5 Active", pct: 20, icon: "🎵" },
  { name: "Focus Media Group", category: "Video Production", capacity: "0/5 Active", pct: 0, icon: "🎥" },
];

const DAYS = ["MON 09", "TUE 10", "WED 11", "THU 12", "FRI 13", "SAT 14", "SUN 15"];

const AdminVendorAllocation = () => {
  const [view, setView] = useState("week");

  return (
    <AdminLayout searchPlaceholder="Search vendors or work orders...">
      <div className="admin-page admin-allocation">
      <PageHeader
        title="Vendor Allocation"
        subtitle="Manage and assign approved vendors to upcoming gala seasons."
        actions={
          <>
            <button className="admin-btn admin-btn--outline">Filter</button>
            <button className="admin-btn admin-btn--primary">+ New Allocation</button>
          </>
        }
      />

      <div className="admin-allocation__grid">
        <div className="admin-card admin-allocation__events">
          <div className="admin-allocation__events-head">
            <h3 className="admin-section-title">Active Events</h3>
            <span className="admin-allocation__pending-badge">4 Pending</span>
          </div>
          {ACTIVE_EVENTS.map((e) => (
            <div className="admin-allocation__event" key={e.name} style={{ borderLeftColor: e.color }}>
              <p className="admin-allocation__event-dates">{e.dates}</p>
              <p className="admin-allocation__event-name">{e.name}</p>
              <p className="admin-allocation__event-venue">📍 {e.venue}</p>
              <div className="admin-allocation__event-track">
                <div style={{ width: `${e.load}%`, background: e.color }} />
              </div>
              <div className="admin-allocation__event-foot">
                <span>Vendor Load: {e.load}%</span>
                <span>{e.slots} Slots Left</span>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-card admin-allocation__calendar">
          <div className="admin-allocation__cal-head">
            <h3 className="admin-section-title">October 2026</h3>
            <div className="admin-allocation__cal-controls">
              <div className="admin-dashboard__toggle admin-allocation__toggle">
                <button
                  className={view === "week" ? "admin-dashboard__toggle-btn admin-dashboard__toggle-btn--active" : "admin-dashboard__toggle-btn"}
                  onClick={() => setView("week")}
                >
                  Week
                </button>
                <button
                  className={view === "month" ? "admin-dashboard__toggle-btn admin-dashboard__toggle-btn--active" : "admin-dashboard__toggle-btn"}
                  onClick={() => setView("month")}
                >
                  Month
                </button>
              </div>
              <button className="admin-btn admin-btn--outline admin-allocation__today">‹ Today ›</button>
            </div>
          </div>

          <div className="admin-allocation__cal-grid">
            {DAYS.map((d) => (
              <div className="admin-allocation__cal-col" key={d}>
                <div className="admin-allocation__cal-day-label">{d}</div>
                <div className="admin-allocation__cal-day-body">
                  {d === "WED 11" && (
                    <>
                      <div className="admin-allocation__cal-block admin-allocation__cal-block--main">
                        <span className="admin-allocation__cal-block-tag">Main Gala Sequence</span>
                        <p>Winter Gala Alpine</p>
                        <div className="admin-allocation__avatars">
                          <span>JC</span>
                          <span>AS</span>
                          <span>+5</span>
                        </div>
                      </div>
                      <div className="admin-allocation__cal-block admin-allocation__cal-block--conflict">
                        <span className="admin-allocation__cal-block-tag">⚠ Conflict Detected</span>
                        <p>AudioVisual Pro</p>
                        <span className="admin-allocation__cal-block-note">Already at Gala Venue A</span>
                      </div>
                    </>
                  )}
                  {d === "TUE 10" && (
                    <div className="admin-allocation__cal-block admin-allocation__cal-block--dashed">
                      <span className="admin-allocation__cal-block-tag">VIP Preview</span>
                      <p>Private View</p>
                    </div>
                  )}
                  {d === "THU 12" && (
                    <div className="admin-allocation__cal-drop">Drag vendor here to allocate</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card admin-allocation__vendors">
          <h3 className="admin-section-title">Available Vendors</h3>
          <input className="admin-input admin-allocation__search" placeholder="Filter specialty…" />
          {AVAILABLE_VENDORS.map((v) => (
            <div className="admin-allocation__vendor" key={v.name} draggable>
              <span className="admin-allocation__vendor-icon">{v.icon}</span>
              <div className="admin-allocation__vendor-info">
                <p className="admin-allocation__vendor-name">{v.name}</p>
                <p className="admin-allocation__vendor-cat">{v.category}</p>
                <div className="admin-allocation__vendor-cap-row">
                  <span>Capacity</span>
                  <span>{v.capacity}</span>
                </div>
                <div className="admin-allocation__vendor-track">
                  <div style={{ width: `${v.pct}%` }} />
                </div>
              </div>
              <span className="admin-allocation__drag-handle">⠿</span>
            </div>
          ))}

          <div className="admin-allocation__vendor-actions">
            <button className="admin-btn admin-btn--outline">⇄ Reassign</button>
            <button className="admin-btn admin-btn--danger">+ Assign</button>
          </div>
        </div>
      </div>

      <button className="admin-fab" aria-label="Add allocation">
        +
      </button>
    </div>
    </AdminLayout>
  );
};

export default AdminVendorAllocation;