import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import "./admin-tokens.css";
import "./AdminWorkOrderDetails.css";

const StarPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span
        key={n}
        onClick={() => onChange(n)}
        className="material-symbols-outlined"
        style={{ fontSize: 32, cursor: 'pointer', color: n <= value ? '#f59e0b' : '#d1d5db', fontVariationSettings: n <= value ? "'FILL' 1" : "'FILL' 0" }}
      >star</span>
    ))}
  </div>
);

const AdminWorkOrderDetails = () => {
  const navigate = useNavigate();
  const { workOrderId } = useParams();
  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rating modal state
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingDone, setRatingDone] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetch(`http://localhost:5000/api/v1/work-orders/${workOrderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (!res.ok) throw new Error("Failed to fetch work order"); return res.json(); })
      .then(data => setWo(data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [workOrderId]);

  const handleStatusChange = async (newStatus) => {
    const res = await fetch(`http://localhost:5000/api/v1/work-orders/${workOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const d = await res.json();
    if (res.ok) setWo(prev => ({ ...prev, status: d.data?.status ?? newStatus }));
  };

  const handleRatingSubmit = async () => {
    if (!ratingScore) { setRatingError('Please select a star rating'); return; }
    setRatingSubmitting(true); setRatingError('');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/vendors/${wo.vendorId}/ratings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingScore, review: ratingComment || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to submit rating');
      setRatingDone(true);
      setTimeout(() => { setShowRating(false); setRatingDone(false); setRatingScore(0); setRatingComment(''); }, 1500);
    } catch (e) { setRatingError(e.message); }
    finally { setRatingSubmitting(false); }
  };

  if (loading) return <AdminLayout><div style={{ padding: 40 }}>Loading WO details...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></AdminLayout>;
  if (!wo) return <AdminLayout><div style={{ padding: 40 }}>Work order not found.</div></AdminLayout>;

  return (
    <AdminLayout searchPlaceholder="Search work orders...">
      <div className="admin-page admin-wo-details">
        <PageHeader
          breadcrumb={[{ label: "Work Orders" }, { label: wo.woNumber }]}
          title={
            <span className="admin-wo-details__title-row">
              {wo.description} <StatusBadge status={wo.status.toLowerCase()} label={wo.status} />
            </span>
          }
          actions={
            <>
              {wo.status !== 'COMPLETED' && (
                <button className="admin-btn admin-btn--primary" onClick={() => handleStatusChange('COMPLETED')}>✓ Mark Completed</button>
              )}
              {wo.vendorId && (
                <button className="admin-btn admin-btn--outline" onClick={() => { setShowRating(true); setRatingError(''); }}>
                  ★ Rate Vendor
                </button>
              )}
            </>
          }
        />

        <div className="admin-wo-details__grid">
          <div className="admin-wo-details__main">
            <div className="admin-card admin-wo-details__section">
              <h3 className="admin-section-title">Task Details</h3>
              <p className="admin-wo-details__desc">{wo.description}</p>
              <div className="admin-wo-details__meta-grid">
                <div><span className="admin-label">WO Reference</span><p>{wo.woNumber}</p></div>
                <div><span className="admin-label">PO Reference</span><p>{wo.purchaseOrder?.poNumber || 'N/A'}</p></div>
                <div><span className="admin-label">Start Date</span><p>{wo.startDate ? new Date(wo.startDate).toLocaleDateString() : 'TBD'}</p></div>
                <div><span className="admin-label">Due Date</span><p>{wo.endDate ? new Date(wo.endDate).toLocaleDateString() : 'TBD'}</p></div>
              </div>
            </div>

            <div className="admin-card admin-wo-details__section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <p style={{ color: '#6b7280' }}>Attachments Coming Soon</p>
            </div>

            <div className="admin-card admin-wo-details__section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <p style={{ color: '#6b7280' }}>Collaboration Chat Coming Soon</p>
            </div>
          </div>

          <div className="admin-wo-details__side">
            <div className="admin-card admin-wo-details__vendor">
              <h3 className="admin-section-title">Assigned Vendor</h3>
              <div className="admin-wo-details__vendor-row">
                <div className="admin-wo-details__vendor-avatar">{(wo.vendor?.businessName || '?').substring(0, 2).toUpperCase()}</div>
                <div>
                  <p className="admin-wo-details__vendor-name">{wo.vendor?.businessName}</p>
                  <p className="admin-wo-details__vendor-rating">Vendor ID: {wo.vendor?.id?.substring(0, 8)}</p>
                </div>
              </div>
              <div className="admin-wo-details__vendor-meta">
                <div><span>Contact</span><strong>{wo.vendor?.contactPersonName}</strong></div>
              </div>
              <div className="admin-wo-details__vendor-actions">
                <button className="admin-btn admin-btn--outline">📞 Call</button>
                <button className="admin-btn admin-btn--outline">✉ Email</button>
              </div>
            </div>
          </div>
        </div>

        <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/admin/work-orders")}>
          ← Back to Work Orders
        </button>
      </div>

      {/* Rate Vendor Modal */}
      {showRating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Rate Vendor</h2>
              <button onClick={() => setShowRating(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            {ratingDone ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#16a34a', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p style={{ fontWeight: 600, marginTop: 8 }}>Rating submitted!</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                  Rating <strong>{wo.vendor?.businessName}</strong> for work order <strong>{wo.woNumber}</strong>
                </p>

                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>RATING *</span>
                  <StarPicker value={ratingScore} onChange={setRatingScore} />
                  {ratingScore > 0 && (
                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                      {['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][ratingScore]}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>COMMENT (OPTIONAL)</span>
                  <textarea
                    rows={3}
                    className="admin-input"
                    placeholder="Share your experience with this vendor..."
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                  />
                </div>

                {ratingError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 12 }}>{ratingError}</p>}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="admin-btn admin-btn--outline" onClick={() => setShowRating(false)}>Cancel</button>
                  <button className="admin-btn admin-btn--primary" onClick={handleRatingSubmit} disabled={ratingSubmitting}>
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWorkOrderDetails;
