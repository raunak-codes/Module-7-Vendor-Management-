import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import Modal from "../../components/Modal";
import "./admin-tokens.css";
import "./AdminVendorProfile.css";

/**
 * AdminVendorProfile
 * Full vendor detail view: company info, contact, documents, reviews,
 * performance metrics. Matches Stitch screen: vendor_profile_details
 */

const DOCUMENTS = [
  { name: "Operating_License_2026.pdf", meta: "Uploaded Jan 20 • 2.4 MB", status: "ok" },
  { name: "Insurance_Certificate.pdf", meta: "Uploaded Jan 05 • 1.1 MB", status: "ok" },
  { name: "Service_Level_Agreement.docx", meta: "Uploaded Jan 01 • 456 KB", status: "ok" },
  { name: "Health_Cert_NYC.pdf", meta: "EXPIRED FEB 28", status: "expired" },
];

const REVIEWS = [
  {
    initials: "JW",
    name: "James Wilson",
    role: "Global Summit Director",
    rating: 5,
    text: "Incredible execution for our 2,000 person gala. Attention to detail and timing was flawless.",
  },
];

const AdminVendorProfile = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [suspendOpen, setSuspendOpen] = useState(false);

  return (
    <AdminLayout searchPlaceholder="Search vendor records...">
      <div className="admin-page admin-vendor-profile">
      <PageHeader
        breadcrumb={[{ label: "Vendors" }, { label: "Premier Catering Solutions" }]}
        title="Premier Catering Solutions"
        subtitle={`Vendor ID: ${vendorId || "V-98210-PCS"}`}
        actions={
          <>
            <button className="admin-btn admin-btn--outline" onClick={() => navigate(`/admin/vendors/${vendorId}/edit`)}>
              Edit Vendor
            </button>
            <button className="admin-btn admin-btn--danger" onClick={() => setSuspendOpen(true)}>
              Suspend Vendor
            </button>
          </>
        }
      />

      <span className="admin-vendor-profile__tier">Platinum Tier</span>

      <div className="admin-vendor-profile__grid">
        <div className="admin-vendor-profile__main">
          <div className="admin-card admin-vendor-profile__about">
            <div className="admin-vendor-profile__cover" />
            <div className="admin-vendor-profile__about-grid">
              <div>
                <span className="admin-label">Company Status</span>
                <p className="admin-vendor-profile__status-active">● Active Provider</p>
              </div>
              <div>
                <span className="admin-label">Vendor Category</span>
                <p>Luxury Hospitality &amp; Catering</p>
              </div>
            </div>
            <span className="admin-label">About Company</span>
            <p className="admin-vendor-profile__about-text">
              Premier Catering Solutions specializes in large-scale corporate galas and luxury private
              events. With over 15 years of industry experience, they provide bespoke menu engineering
              and end-to-end service staff management for events exceeding 5,000 attendees.
            </p>
            <span className="admin-label">Services Offered</span>
            <div className="admin-vendor-profile__chips">
              {["Fine Dining Logistics", "Buffet Service", "Mixology", "Staffing", "Menu Design"].map((s) => (
                <span key={s} className="admin-vendor-profile__chip">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="admin-vendor-profile__metrics">
            <div className="admin-card admin-vendor-profile__metric">
              <span className="admin-vendor-profile__metric-trend">+12%</span>
              <p className="admin-label">Reliability Rate</p>
              <p className="admin-vendor-profile__metric-value">99.2%</p>
              <div className="admin-vendor-profile__metric-track">
                <div style={{ width: "99%" }} />
              </div>
            </div>
            <div className="admin-card admin-vendor-profile__metric">
              <span className="admin-vendor-profile__metric-trend admin-vendor-profile__metric-trend--muted">
                Last 12mo
              </span>
              <p className="admin-label">Avg. Rating</p>
              <p className="admin-vendor-profile__metric-value">4.9/5.0</p>
              <p className="admin-vendor-profile__stars">★★★★★</p>
            </div>
            <div className="admin-card admin-vendor-profile__metric">
              <span className="admin-vendor-profile__metric-trend admin-vendor-profile__metric-trend--muted">
                YTD
              </span>
              <p className="admin-label">Total Volume</p>
              <p className="admin-vendor-profile__metric-value">$1.4M</p>
            </div>
          </div>

          <div className="admin-card admin-vendor-profile__reviews">
            <div className="admin-vendor-profile__panel-head">
              <h3 className="admin-section-title">Ratings &amp; Reviews</h3>
              <button className="admin-btn admin-btn--ghost">View All 142 Reviews</button>
            </div>
            {REVIEWS.map((r) => (
              <div className="admin-vendor-profile__review" key={r.name}>
                <div className="admin-vendor-profile__review-avatar">{r.initials}</div>
                <div className="admin-vendor-profile__review-body">
                  <div className="admin-vendor-profile__review-top">
                    <div>
                      <p className="admin-vendor-profile__review-name">{r.name}</p>
                      <p className="admin-vendor-profile__review-role">{r.role}</p>
                    </div>
                    <span className="admin-vendor-profile__review-stars">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="admin-vendor-profile__review-text">&ldquo;{r.text}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-vendor-profile__side">
          <div className="admin-card admin-vendor-profile__contact">
            <h3 className="admin-section-title">Contact Details</h3>
            <span className="admin-label" style={{ marginTop: 16 }}>
              Primary Liaison
            </span>
            <p className="admin-vendor-profile__liaison-name">Elena Rodriguez</p>
            <p className="admin-vendor-profile__liaison-role">Senior Account Executive</p>
            <ul className="admin-vendor-profile__contact-list">
              <li>elena.r@premiercatering.com</li>
              <li>+1 (555) 234-8902</li>
              <li>882 Gourmet Plaza, Suite 400, New York, NY 10013</li>
            </ul>
            <button className="admin-btn admin-btn--danger" style={{ width: "100%", marginTop: 12 }}>
              Send Secure Message
            </button>
          </div>

          <div className="admin-card admin-vendor-profile__docs">
            <div className="admin-vendor-profile__panel-head">
              <h3 className="admin-section-title">Documents</h3>
              <button className="admin-btn admin-btn--ghost">+</button>
            </div>
            {DOCUMENTS.map((d) => (
              <div className="admin-vendor-profile__doc" key={d.name}>
                <span className={`admin-vendor-profile__doc-icon admin-vendor-profile__doc-icon--${d.status}`}>
                  📄
                </span>
                <div>
                  <p
                    className={
                      d.status === "expired"
                        ? "admin-vendor-profile__doc-name admin-vendor-profile__doc-name--expired"
                        : "admin-vendor-profile__doc-name"
                    }
                  >
                    {d.name}
                  </p>
                  <p
                    className={
                      d.status === "expired"
                        ? "admin-vendor-profile__doc-meta admin-vendor-profile__doc-meta--expired"
                        : "admin-vendor-profile__doc-meta"
                    }
                  >
                    {d.meta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend Vendor"
        size="sm"
        footer={
          <>
            <button className="admin-btn admin-btn--outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </button>
            <button
              className="admin-btn admin-btn--danger"
              onClick={() => {
                setSuspendOpen(false);
                navigate("/admin/vendors");
              }}
            >
              Confirm Suspend
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to suspend <strong>Premier Catering Solutions</strong>? They will lose
          access to active purchase orders and won&apos;t be assignable to new allocations until
          reinstated.
        </p>
      </Modal>
    </div>
    </AdminLayout>
  );
};

export default AdminVendorProfile;