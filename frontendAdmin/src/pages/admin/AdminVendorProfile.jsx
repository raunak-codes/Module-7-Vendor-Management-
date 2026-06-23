import React, { useState, useEffect } from "react";
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

const AdminVendorProfile = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch(`http://localhost:5000/api/v1/admin/vendors/${vendorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vendor details");
        return res.json();
      })
      .then((data) => setVendor(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = newStatus === 'ACTIVE' ? 'approve' : 'reject';
      const res = await fetch(`http://localhost:5000/api/v1/admin/vendors/${vendorId}/${endpoint}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to ${endpoint} vendor`);
      setVendor(prev => ({ ...prev, status: newStatus }));
      setSuspendOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;
  if (!vendor) return <AdminLayout><div style={{ padding: 40 }}>Vendor not found.</div></AdminLayout>;

  return (
    <AdminLayout searchPlaceholder="Search vendor records...">
      <div className="admin-page admin-vendor-profile">
      <PageHeader
        breadcrumb={[{ label: "Vendors" }, { label: vendor.businessName }]}
        title={vendor.businessName}
        subtitle={`Vendor ID: ${vendor.id}`}
        actions={
          <>
            <button className="admin-btn admin-btn--outline" onClick={() => navigate(`/admin/kyc?vendorId=${vendor.id}`)}>
              View KYC
            </button>
            {vendor.status === 'PENDING' && (
              <button className="admin-btn admin-btn--primary" onClick={() => handleStatusChange('ACTIVE')}>
                Approve Vendor
              </button>
            )}
            {vendor.status !== 'REJECTED' && (
              <button className="admin-btn admin-btn--danger" onClick={() => setSuspendOpen(true)}>
                Suspend Vendor
              </button>
            )}
          </>
        }
      />

      <span className="admin-vendor-profile__tier">Status: {vendor.status}</span>

      <div className="admin-vendor-profile__grid">
        <div className="admin-vendor-profile__main">
          <div className="admin-card admin-vendor-profile__about">
            <div className="admin-vendor-profile__cover" />
            <div className="admin-vendor-profile__about-grid">
              <div>
                <span className="admin-label">Company Status</span>
                <p className={vendor.status === 'ACTIVE' ? "admin-vendor-profile__status-active" : ""}>
                  ● {vendor.status}
                </p>
              </div>
              <div>
                <span className="admin-label">Vendor Category</span>
                <p>{vendor.category?.name || "Uncategorized"}</p>
              </div>
            </div>
            <span className="admin-label">About Company</span>
            <p className="admin-vendor-profile__about-text">
              {vendor.businessDescription || "No description provided."}
            </p>
          </div>
        </div>

        <div className="admin-vendor-profile__side">
          <div className="admin-card admin-vendor-profile__contact">
            <h3 className="admin-section-title">Contact Details</h3>
            <span className="admin-label" style={{ marginTop: 16 }}>
              Primary Liaison
            </span>
            <p className="admin-vendor-profile__liaison-name">{vendor.contactPersonName}</p>
            <ul className="admin-vendor-profile__contact-list">
              <li>{vendor.user?.email}</li>
              <li>{vendor.user?.phone}</li>
              <li>{vendor.address}</li>
            </ul>
          </div>

          <div className="admin-card admin-vendor-profile__docs">
            <div className="admin-vendor-profile__panel-head">
              <h3 className="admin-section-title">Documents</h3>
            </div>
            {vendor.kycDocuments?.map((d) => (
              <div className="admin-vendor-profile__doc" key={d.id}>
                <span className={`admin-vendor-profile__doc-icon admin-vendor-profile__doc-icon--${d.verificationStatus === 'VERIFIED' ? 'ok' : 'expired'}`}>
                  📄
                </span>
                <div>
                  <p className="admin-vendor-profile__doc-name">
                    {d.documentType}
                  </p>
                  <p className="admin-vendor-profile__doc-meta">
                    Status: {d.verificationStatus}
                  </p>
                </div>
              </div>
            ))}
            {(!vendor.kycDocuments || vendor.kycDocuments.length === 0) && (
              <p style={{ color: '#6b7280', fontSize: 13 }}>No documents uploaded yet.</p>
            )}
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
              onClick={() => handleStatusChange('REJECTED')}
            >
              Confirm Suspend
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to suspend <strong>{vendor.businessName}</strong>? They will lose access to the platform.
        </p>
      </Modal>
    </div>
    </AdminLayout>
  );
};

export default AdminVendorProfile;