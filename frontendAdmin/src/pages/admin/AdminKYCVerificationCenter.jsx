import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import "./admin-tokens.css";
import "./AdminKYCVerificationCenter.css";

/**
 * AdminKYCVerificationCenter
 * Document-by-document compliance review for a single vendor's KYC submission.
 * Matches Stitch screen: kyc_verification_center
 */

const TABS = [
  { key: "gst", label: "GST Certificate" },
  { key: "pan", label: "PAN Card" },
  { key: "bank", label: "Bank Details" },
];

const HISTORY = [
  {
    title: "Documents Submitted",
    time: "Today, 10:24 AM",
    desc: "Vendor uploaded refreshed GST and PAN card documents for annual renewal.",
  },
  {
    title: "Renewal Triggered",
    time: "Oct 24, 2025",
    desc: "Automated system flag: GST certificate nearing expiry within 30 days.",
  },
  {
    title: "Initial Approval",
    time: "Nov 15, 2024",
    desc: "Verified by Sarah Chen. All documents matched the ministry registry.",
  },
];

const AdminKYCVerificationCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("gst");
  const [decision, setDecision] = useState(null);

  return (
    <AdminLayout searchPlaceholder="Search KYC submissions...">
      <div className="admin-page admin-kyc">
      <PageHeader
        breadcrumb={[{ label: "KYC Verification Center" }, { label: "Review ID: 8849-VND" }]}
        title={
          <span className="admin-kyc__title-row">
            Elite Catering Solutions
          </span>
        }
        actions={
          <button className="admin-btn admin-btn--outline" onClick={() => navigate("/admin/audit-logs")}>
            Full Audit Log
          </button>
        }
      />
      <div className="admin-kyc__status-row">
        <StatusBadge status="pending" label="Pending Review" />
      </div>

      <div className="admin-kyc__grid">
        <div className="admin-card admin-kyc__doc-panel">
          <div className="admin-kyc__tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`admin-kyc__tab${activeTab === t.key ? " admin-kyc__tab--active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
            <div className="admin-kyc__tab-tools">
              <button title="Zoom in">🔍</button>
              <button title="Download">⬇</button>
              <button title="Print">🖨</button>
            </div>
          </div>

          <div className="admin-kyc__doc-preview">
            {activeTab === "gst" && (
              <div className="admin-kyc__cert">
                <div className="admin-kyc__cert-head">
                  <div className="admin-kyc__cert-seal" />
                  <div>
                    <p className="admin-kyc__cert-title">GOVERNMENT OF INDIA</p>
                    <p className="admin-kyc__cert-sub">Goods and Services Tax Registration Certificate</p>
                  </div>
                  <div className="admin-kyc__cert-ref">
                    <p>FORM GST REG-06</p>
                    <p>Reference No: 27AABCE1234F1Z5</p>
                  </div>
                </div>
                <hr />
                <div className="admin-kyc__cert-grid">
                  <div>
                    <span className="admin-label">Registration Number</span>
                    <p>27AABCE1234F1Z5</p>
                  </div>
                  <div>
                    <span className="admin-label">Legal Name</span>
                    <p>ELITE CATERING SOLUTIONS PVT LTD</p>
                  </div>
                  <div>
                    <span className="admin-label">Trade Name</span>
                    <p>ELITE CATERING</p>
                  </div>
                  <div>
                    <span className="admin-label">Constitution of Business</span>
                    <p>Private Limited Company</p>
                  </div>
                </div>
                <div className="admin-kyc__cert-address">
                  <span className="admin-label">Address of Principal Place of Business</span>
                  <p>Plot No. 45, Industrial Area Phase II, Goregaon East, Mumbai, Maharashtra - 400063</p>
                </div>
                <div className="admin-kyc__cert-watermark">CERTIFIED COPY</div>
              </div>
            )}
            {activeTab === "pan" && (
              <div className="admin-kyc__cert admin-kyc__cert--simple">
                <p className="admin-kyc__cert-title">PAN CARD</p>
                <p>Permanent Account Number: AABCE1234F</p>
                <p>Name: Elite Catering Solutions Pvt Ltd</p>
                <p>Date of Incorporation: 15/03/2012</p>
              </div>
            )}
            {activeTab === "bank" && (
              <div className="admin-kyc__cert admin-kyc__cert--simple">
                <p className="admin-kyc__cert-title">BANK DETAILS</p>
                <p>Account Name: Elite Catering Solutions Pvt Ltd</p>
                <p>Account Number: XXXX-XXXX-4492</p>
                <p>Bank: HDFC Bank, Goregaon Branch</p>
                <p>IFSC: HDFC0001234</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-kyc__side">
          <div className="admin-card admin-kyc__summary">
            <h3 className="admin-section-title">Vendor Summary</h3>
            <div className="admin-kyc__summary-vendor">
              <div className="admin-kyc__summary-avatar">EC</div>
              <div>
                <p className="admin-kyc__summary-name">Elite Catering Solutions</p>
                <p className="admin-kyc__summary-tag">Tier 1 Platinum Partner</p>
              </div>
            </div>
            <div className="admin-kyc__summary-rows">
              <div>
                <span className="admin-label">Primary Contact</span>
                <p>Rajesh Malhotra (Director)</p>
              </div>
              <div>
                <span className="admin-label">Email Address</span>
                <p>compliance@elitecatering.com</p>
              </div>
              <div>
                <span className="admin-label">Incorporation Date</span>
                <p>March 15, 2012</p>
              </div>
            </div>
          </div>

          <div className="admin-card admin-kyc__history">
            <h3 className="admin-section-title">Verification History</h3>
            <ul className="admin-kyc__timeline">
              {HISTORY.map((h) => (
                <li key={h.title}>
                  <div className="admin-kyc__timeline-head">
                    <span>{h.title}</span>
                    <span className="admin-kyc__timeline-time">{h.time}</span>
                  </div>
                  <p>{h.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="admin-kyc__action-bar">
        <div className="admin-kyc__action-bar-left">
          <span className="admin-label">Compliance Review State:</span>
          <span className="admin-kyc__pill admin-kyc__pill--lo">LO</span>
          <span className="admin-kyc__pill admin-kyc__pill--id">ID</span>
          <span className="admin-kyc__pill admin-kyc__pill--fi">FI</span>
          <button className="admin-btn admin-btn--ghost">Request Changes</button>
        </div>
        <div className="admin-kyc__action-bar-right">
          <button
            className="admin-btn admin-btn--outline"
            onClick={() => {
              setDecision("rejected");
              navigate("/admin/kyc");
            }}
          >
            Reject
          </button>
          <button
            className="admin-btn admin-btn--danger"
            onClick={() => {
              setDecision("approved");
              navigate("/admin/kyc");
            }}
          >
            ✓ Approve Vendor
          </button>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminKYCVerificationCenter;