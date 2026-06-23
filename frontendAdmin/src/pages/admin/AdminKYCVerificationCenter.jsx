import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const AdminKYCVerificationCenter = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get("vendorId");

  const [activeTab, setActiveTab] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vendorId) {
      setError("No vendor ID provided.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("adminToken");
    Promise.all([
      fetch(`http://localhost:5000/api/v1/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vendor data");
        return res.json();
      }),
      fetch(`http://localhost:5000/api/v1/vendors/${vendorId}/kyc`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.ok ? res.json() : { data: [] }),
    ])
      .then(([vendorData, kycData]) => {
        const kycDocs = kycData.data ?? [];
        const vendor = { ...vendorData.data, kycDocuments: kycDocs };
        setVendor(vendor);
        if (kycDocs.length > 0) setActiveTab(kycDocs[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handleDecision = async (status) => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = status === 'approved' ? 'approve' : 'reject';
      const res = await fetch(`http://localhost:5000/api/v1/vendors/${vendorId}/${endpoint}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to ${status} vendor`);
      navigate(`/admin/vendors/${vendorId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading KYC data...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;

  const docs = vendor?.kycDocuments || [];
  const activeDoc = docs.find(d => d.id === activeTab);

  return (
    <AdminLayout searchPlaceholder="Search KYC submissions...">
      <div className="admin-page admin-kyc">
      <PageHeader
        breadcrumb={[{ label: "KYC Verification Center" }, { label: `Review ID: ${vendor.id.slice(0,8)}` }]}
        title={
          <span className="admin-kyc__title-row">
            {vendor.businessName}
          </span>
        }
        actions={
          <button className="admin-btn admin-btn--outline" onClick={() => navigate(`/admin/vendors/${vendor.id}`)}>
            View Profile
          </button>
        }
      />
      <div className="admin-kyc__status-row">
        <StatusBadge status={vendor.status.toLowerCase()} label={`Status: ${vendor.status}`} />
      </div>

      <div className="admin-kyc__grid">
        <div className="admin-card admin-kyc__doc-panel">
          <div className="admin-kyc__tabs">
            {docs.map((doc) => (
              <button
                key={doc.id}
                className={`admin-kyc__tab${activeTab === doc.id ? " admin-kyc__tab--active" : ""}`}
                onClick={() => setActiveTab(doc.id)}
              >
                {doc.documentType}
              </button>
            ))}
            {docs.length === 0 && <span style={{ padding: 12, color: '#6b7280' }}>No documents uploaded.</span>}
          </div>

          <div className="admin-kyc__doc-preview" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            {activeDoc ? (
               activeDoc.documentUrl?.endsWith('.pdf') ? (
                  <iframe src={activeDoc.downloadUrl} width="100%" height="500px" title={activeDoc.documentType} />
               ) : (
                  <img src={activeDoc.downloadUrl} alt={activeDoc.documentType} style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }} />
               )
            ) : (
               <p style={{ color: '#6b7280' }}>Select a document to preview.</p>
            )}
          </div>
        </div>

        <div className="admin-kyc__side">
          <div className="admin-card admin-kyc__summary">
            <h3 className="admin-section-title">Vendor Summary</h3>
            <div className="admin-kyc__summary-vendor">
              <div>
                <p className="admin-kyc__summary-name">{vendor.businessName}</p>
                <p className="admin-kyc__summary-tag">{vendor.category?.name || "Uncategorized"}</p>
              </div>
            </div>
            <div className="admin-kyc__summary-rows">
              <div>
                <span className="admin-label">Primary Contact</span>
                <p>{vendor.contactPersonName}</p>
              </div>
              <div>
                <span className="admin-label">Email Address</span>
                <p>{vendor.user?.email}</p>
              </div>
              <div>
                <span className="admin-label">GST / PAN</span>
                <p>{vendor.gstNumber || "N/A"} / {vendor.panNumber || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-kyc__action-bar">
        <div className="admin-kyc__action-bar-left">
        </div>
        <div className="admin-kyc__action-bar-right">
          <button
            className="admin-btn admin-btn--outline"
            onClick={() => handleDecision("rejected")}
            disabled={vendor.status !== 'PENDING'}
          >
            Reject Vendor
          </button>
          <button
            className="admin-btn admin-btn--danger"
            onClick={() => handleDecision("approved")}
            disabled={vendor.status !== 'PENDING'}
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