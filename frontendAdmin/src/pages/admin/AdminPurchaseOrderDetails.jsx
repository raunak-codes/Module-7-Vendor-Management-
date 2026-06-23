import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import "./admin-tokens.css";
import "./AdminPurchaseOrderDetails.css";

/**
 * AdminPurchaseOrderDetails
 * Single PO deep-dive: deliverables, budget, status tracker, activity log.
 * Matches Stitch screen: purchase_order_details
 */

const DELIVERABLES = [
  { name: "4K LED Wall (8m x 4m)", desc: "Full installation of P2.5 LED panels including redundant power supply and Novastar processing.", amount: "$24,500.00" },
  { name: "Line Array Sound System", desc: "d&b Audiotechnik V-Series setup with 4 ground stacks and 2 center fills for crystal clear speech.", amount: "$12,200.00" },
  { name: "On-site Technical Crew", desc: "4 Senior Technicians for 72 hours covering setup, 6-hour event duration, and strike.", amount: "$8,400.00" },
];

const STATUS_STEPS = [
  { label: "Drafting & Review", state: "done", note: "Jun 12" },
  { label: "Executive Approval", state: "active", note: "Pending (VP Finance)" },
  { label: "Vendor Dispatch", state: "upcoming", note: "Auto-triggers on approval" },
  { label: "Payment Authorization", state: "upcoming", note: "Scheduled for Jun 30" },
];

const ACTIVITY = [
  { initials: "AS", text: "Alex Stratton submitted PO for approval", time: "Jun 12, 2026 at 10:45 AM" },
  { initials: "SY", text: "System generated PDF draft", time: "Jun 12, 2026 at 10:46 AM" },
  { initials: "JD", text: "Jane Doe added a comment", time: "Jun 13, 2026 at 09:12 AM", quote: "Please verify if we need additional insurance for the LED wall freight." },
];

const AdminPurchaseOrderDetails = () => {
  const navigate = useNavigate();
  const { poId } = useParams();

  return (
    <AdminLayout searchPlaceholder="Search purchase orders...">
      <div className="admin-page admin-po-details">
      <PageHeader
        breadcrumb={[{ label: "Purchase Orders" }, { label: poId || "PO-2026-001" }]}
        title="Gala Dinner AV Services"
        subtitle={
          <span className="admin-po-details__subtitle-row">
            <StatusBadge status="pending" label="Pending Approval" />
            <span>📅 Issued Jun 12, 2026</span>
          </span>
        }
        actions={
          <>
            <button className="admin-btn admin-btn--outline">✎ Edit PO</button>
            <button className="admin-btn admin-btn--primary">⬇ Export as PDF</button>
          </>
        }
      />

      <div className="admin-po-details__grid">
        <div className="admin-po-details__main">
          <div className="admin-card admin-po-details__section">
            <h3 className="admin-section-title">ℹ Order Details</h3>
            <div className="admin-po-details__info-grid">
              <div>
                <span className="admin-label">PO Reference</span>
                <p>{poId || "PO-2026-001"}</p>
              </div>
              <div>
                <span className="admin-label">Department</span>
                <p>Events &amp; Hospitality</p>
              </div>
              <div>
                <span className="admin-label">Project Code</span>
                <p>GALA-NYC-26</p>
              </div>
              <div>
                <span className="admin-label">Tax Terms</span>
                <p>Net 30 / 15% VAT</p>
              </div>
            </div>
          </div>

          <div className="admin-card admin-po-details__section">
            <h3 className="admin-section-title">🏢 Vendor Information</h3>
            <div className="admin-po-details__vendor-row">
              <div className="admin-po-details__vendor-avatar">L</div>
              <div>
                <p className="admin-po-details__vendor-name">Luminex Audio Visual</p>
                <p className="admin-po-details__vendor-tag">Tier 1 Strategic Partner</p>
              </div>
            </div>
            <ul className="admin-po-details__vendor-contact">
              <li>👤 Mark Richardson</li>
              <li>✉ m.richardson@luminex.pro</li>
              <li>📞 +1 (212) 555-0198</li>
            </ul>
            <p className="admin-po-details__vendor-quote">
              &ldquo;Luminex is currently authorized for 3 concurrent projects under the NYC Master
              Services Agreement.&rdquo;
            </p>
          </div>

          <div className="admin-card admin-po-details__section">
            <div className="admin-po-details__panel-head">
              <h3 className="admin-section-title">📋 Deliverables &amp; Scope</h3>
              <span className="admin-po-details__items-count">{DELIVERABLES.length} ITEMS TOTAL</span>
            </div>
            {DELIVERABLES.map((d) => (
              <div className="admin-po-details__deliverable" key={d.name}>
                <div className="admin-po-details__deliverable-icon">🎚</div>
                <div className="admin-po-details__deliverable-info">
                  <div className="admin-po-details__deliverable-top">
                    <p className="admin-po-details__deliverable-name">{d.name}</p>
                    <p className="admin-po-details__deliverable-amount">{d.amount}</p>
                  </div>
                  <p className="admin-po-details__deliverable-desc">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-card admin-po-details__section">
            <h3 className="admin-section-title">🕓 Activity History</h3>
            {ACTIVITY.map((a) => (
              <div className="admin-po-details__activity" key={a.text}>
                <div className="admin-po-details__activity-avatar">{a.initials}</div>
                <div className="admin-po-details__activity-body">
                  <p>
                    <strong>{a.text}</strong>
                  </p>
                  {a.quote && <p className="admin-po-details__activity-quote">&ldquo;{a.quote}&rdquo;</p>}
                  <span className="admin-po-details__activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-po-details__side">
          <div className="admin-card admin-po-details__tracker">
            <h3 className="admin-section-title">Status Tracker</h3>
            <ul className="admin-po-details__tracker-list">
              {STATUS_STEPS.map((s) => (
                <li key={s.label} className={`admin-po-details__tracker-item admin-po-details__tracker-item--${s.state}`}>
                  <span className="admin-po-details__tracker-dot">{s.state === "done" ? "✓" : ""}</span>
                  <div>
                    <p className="admin-po-details__tracker-label">{s.label}</p>
                    <p className="admin-po-details__tracker-note">{s.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-po-details__budget">
            <div className="admin-po-details__budget-head">
              <h3>Budget Summary</h3>
            </div>
            <div className="admin-po-details__budget-row">
              <span>Net Amount</span>
              <span>$45,100.00</span>
            </div>
            <div className="admin-po-details__budget-row">
              <span>Tax (15%)</span>
              <span>$6,765.00</span>
            </div>
            <div className="admin-po-details__budget-row">
              <span>Discounts Applied</span>
              <span>-$1,200.00</span>
            </div>
            <div className="admin-po-details__budget-total">
              <span>Grand Total</span>
              <strong>$50,665.00</strong>
            </div>
            <span className="admin-po-details__budget-currency">CURRENCY USD</span>
            <div className="admin-po-details__budget-util">
              <div className="admin-po-details__budget-util-head">
                <span>Budget Utilization</span>
                <span>82%</span>
              </div>
              <div className="admin-po-details__budget-util-track">
                <div style={{ width: "82%" }} />
              </div>
              <p>This PO utilizes 12.5% of the total event budget.</p>
            </div>
          </div>

          <div className="admin-card admin-po-details__timeline">
            <h3 className="admin-section-title">Estimated Timeline</h3>
            <div className="admin-po-details__timeline-row">
              <span>🚚</span>
              <div>
                <p>Estimated Delivery</p>
                <strong>Jun 22, 2026 at 08:00 AM</strong>
              </div>
            </div>
            <div className="admin-po-details__timeline-row">
              <span>📅</span>
              <div>
                <p>Event Date</p>
                <strong>Jun 24, 2026</strong>
              </div>
            </div>
            <button className="admin-btn admin-btn--outline" style={{ width: "100%", marginTop: 14 }}>
              💬 Contact Vendor
            </button>
          </div>
        </div>
      </div>

      <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/admin/purchase-orders")}>
        ← Back to Purchase Orders
      </button>
    </div>
    </AdminLayout>
  );
};

export default AdminPurchaseOrderDetails;