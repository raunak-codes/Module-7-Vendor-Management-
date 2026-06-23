import React, { useState } from "react";
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

const STEPS = ["Created", "Vendor Assigned", "In Progress", "Review", "Completed"];
const ATTACHMENTS = [
  { name: "rack_photo.jpg", type: "image" },
  { name: "floor_plan.png", type: "image" },
  { name: "Spec_Sheet_v2.pdf", meta: "1.4 MB", type: "doc" },
  { name: "Invoice_Draft.docx", meta: "45 KB", type: "doc" },
];

const ACTIVITY = [
  { text: "Status changed to In Progress", by: "Marcus Thorne", time: "Today, 08:12 AM" },
  { text: "New attachment uploaded — Test_Results.pdf (2 MB)", time: "Today, 08:15 AM" },
  { text: "Vendor assigned: Apex Tech", by: "Sarah Jenkins (Admin)", time: "Jun 12, 02:15 PM" },
  { text: "Work order created", time: "Jun 12, 09:30 AM" },
];

const AdminWorkOrderDetails = () => {
  const navigate = useNavigate();
  const { workOrderId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "me", text: "Hello Apex Tech team, can we get an update on the projector calibration? We have a walkthrough scheduled for tomorrow morning.", time: "Yesterday, 4:45 PM" },
    { from: "them", name: "Marcus Thorne (Apex Tech)", text: "Hi Sarah! Projectors 1 and 2 are fully calibrated. We are finishing the audio sync now. Everything will be ready for the 9 AM walkthrough.", time: "Today, 8:12 AM" },
    { from: "them", text: "I've attached the latest audio test results to the files section for your review.", time: "Today, 8:15 AM" },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: message, time: "Just now" }]);
    setMessage("");
  };

  return (
    <AdminLayout searchPlaceholder="Search work orders...">
      <div className="admin-page admin-wo-details">
      <PageHeader
        breadcrumb={[{ label: "Work Orders" }, { label: workOrderId || "WO-2026-0942" }]}
        title={
          <span className="admin-wo-details__title-row">
            Grand Ballroom AV Installation <StatusBadge status="in progress" label="In Progress" />
          </span>
        }
        actions={
          <>
            <button className="admin-btn admin-btn--outline">↗ Share</button>
            <button className="admin-btn admin-btn--primary">✓ Complete Task</button>
          </>
        }
      />

      <div className="admin-card admin-wo-details__stepper">
        {STEPS.map((s, idx) => (
          <div key={s} className={`admin-wo-details__step${idx <= 2 ? " admin-wo-details__step--done" : ""}${idx === 2 ? " admin-wo-details__step--current" : ""}`}>
            <span className="admin-wo-details__step-dot">{idx <= 2 ? "✓" : ""}</span>
            <p>{s}</p>
            <span className="admin-wo-details__step-note">
              {idx === 0 ? "Oct 12, 09:30" : idx === 1 ? "Oct 12, 14:15" : idx === 2 ? "Started Oct 14" : idx === 3 ? "Expected Oct 18" : "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="admin-wo-details__grid">
        <div className="admin-wo-details__main">
          <div className="admin-card admin-wo-details__section">
            <h3 className="admin-section-title">Task Details</h3>
            <p className="admin-wo-details__desc">
              Complete overhaul of the AV systems in the Grand Ballroom prior to the Q4 Executive Gala.
              This includes mounting 4 new 4K projectors, recalibrating the surround sound array, and
              updating the central control tablet firmware.
            </p>
            <div className="admin-wo-details__meta-grid">
              <div>
                <span className="admin-label">Priority</span>
                <p className="admin-wo-details__priority">● Critical</p>
              </div>
              <div>
                <span className="admin-label">Budget Code</span>
                <p>EB-2026-BALL-01</p>
              </div>
              <div>
                <span className="admin-label">Department</span>
                <p>Tech &amp; Operations</p>
              </div>
              <div>
                <span className="admin-label">Due Date</span>
                <p>Oct 20, 2026</p>
              </div>
            </div>
          </div>

          <div className="admin-card admin-wo-details__section">
            <div className="admin-wo-details__panel-head">
              <h3 className="admin-section-title">Attachments ({ATTACHMENTS.length})</h3>
              <button className="admin-btn admin-btn--ghost">+ Upload New</button>
            </div>
            <div className="admin-wo-details__attachments">
              {ATTACHMENTS.map((a) => (
                <div className="admin-wo-details__attachment" key={a.name}>
                  <div className={`admin-wo-details__attachment-preview admin-wo-details__attachment-preview--${a.type}`}>
                    {a.type === "image" ? "🖼" : "📄"}
                  </div>
                  <p>{a.name}</p>
                  {a.meta && <span>{a.meta}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card admin-wo-details__section">
            <h3 className="admin-section-title">Collaboration</h3>
            <div className="admin-wo-details__chat">
              {messages.map((m, idx) => (
                <div key={idx} className={`admin-wo-details__bubble-row admin-wo-details__bubble-row--${m.from}`}>
                  <div className={`admin-wo-details__bubble admin-wo-details__bubble--${m.from}`}>
                    {m.name && <p className="admin-wo-details__bubble-name">{m.name}</p>}
                    <p>{m.text}</p>
                  </div>
                  <span className="admin-wo-details__bubble-time">{m.time}</span>
                </div>
              ))}
            </div>
            <div className="admin-wo-details__chat-input">
              <button className="admin-wo-details__attach-btn">📎</button>
              <input
                placeholder="Write a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="admin-wo-details__send-btn" onClick={sendMessage}>
                ➤
              </button>
            </div>
          </div>
        </div>

        <div className="admin-wo-details__side">
          <div className="admin-card admin-wo-details__vendor">
            <h3 className="admin-section-title">Primary Vendor</h3>
            <div className="admin-wo-details__vendor-row">
              <div className="admin-wo-details__vendor-avatar">AT</div>
              <div>
                <p className="admin-wo-details__vendor-name">Apex Tech Solutions</p>
                <p className="admin-wo-details__vendor-rating">★ 4.9 (124 jobs)</p>
              </div>
            </div>
            <div className="admin-wo-details__vendor-meta">
              <div>
                <span>Lead Tech</span>
                <strong>Marcus Thorne</strong>
              </div>
              <div>
                <span>Contract ID</span>
                <strong>ATS-992-B</strong>
              </div>
              <div>
                <span>Insurance</span>
                <strong className="admin-wo-details__insurance">✓ Active</strong>
              </div>
            </div>
            <div className="admin-wo-details__vendor-actions">
              <button className="admin-btn admin-btn--outline">📞 Call</button>
              <button className="admin-btn admin-btn--outline">✉ Email</button>
            </div>
          </div>

          <div className="admin-card admin-wo-details__activity-card">
            <h3 className="admin-section-title">Activity History</h3>
            <ul className="admin-wo-details__activity-list">
              {ACTIVITY.map((a) => (
                <li key={a.text}>
                  <p>
                    <strong>{a.text}</strong>
                  </p>
                  {a.by && <p className="admin-wo-details__activity-by">by {a.by}</p>}
                  <span>{a.time}</span>
                </li>
              ))}
            </ul>
            <button className="admin-btn admin-btn--outline" style={{ width: "100%" }}>
              View Full Log
            </button>
          </div>

          <div className="admin-card admin-wo-details__location">
            <div className="admin-wo-details__map" />
            <p className="admin-wo-details__location-title">Grand Ballroom, Floor 2</p>
            <p className="admin-wo-details__location-sub">East Wing Corridor, Unit B</p>
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