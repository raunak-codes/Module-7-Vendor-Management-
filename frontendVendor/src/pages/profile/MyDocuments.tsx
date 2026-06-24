import { useState, useEffect } from 'react';

const DOC_LABELS: Record<string, { label: string; description: string }> = {
  GST_CERTIFICATE:          { label: 'GST Certificate',              description: 'Goods & Services Tax registration certificate issued by the government.' },
  PAN:                      { label: 'PAN Card',                     description: 'Permanent Account Number card for income tax identification.' },
  INCORPORATION_CERTIFICATE:{ label: 'Business Registration',        description: 'Certificate of incorporation or business registration document.' },
  CANCELLED_CHEQUE:         { label: 'Bank Proof',                   description: 'Cancelled cheque or bank statement showing account holder name and IFSC.' },
  BANK_STATEMENT:           { label: 'Bank Statement',               description: 'Recent bank statement (last 3 months) showing account details.' },
};

const REQUIRED_TYPES = ['GST_CERTIFICATE', 'PAN', 'INCORPORATION_CERTIFICATE', 'CANCELLED_CHEQUE'];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; sublabel: string; icon: string }> = {
  PENDING:  { color: '#92400e', bg: '#fef3c7', label: 'Under Review',  sublabel: 'Admin is reviewing this document. No action needed.', icon: 'schedule' },
  VERIFIED: { color: '#166534', bg: '#dcfce7', label: 'Verified',      sublabel: 'Document accepted and verified.',                      icon: 'verified' },
  REJECTED: { color: '#991b1b', bg: '#fee2e2', label: 'Rejected',      sublabel: 'Document was rejected. Please re-upload a valid copy.',  icon: 'cancel' },
  EXPIRED:  { color: '#7c2d12', bg: '#fff7ed', label: 'Expired',       sublabel: 'Document has expired. Upload a renewed copy.',           icon: 'warning' },
};

export default function MyDocuments() {
  const [docs, setDocs] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingNew, setUploadingNew] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/vendors/me', { headers })
      .then(r => r.json())
      .then(d => {
        setVendorId(d.data?.id ?? null);
        setDocs(d.data?.kycDocuments ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleReUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string, existingDocId?: string) => {
    if (!e.target.files?.length || !vendorId) return;
    const file = e.target.files[0];
    existingDocId ? setUploadingId(existingDocId) : setUploadingNew(docType);
    setError(null); setSuccess(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', docType);

    try {
      const res = await fetch(`http://localhost:5000/api/v1/vendors/${vendorId}/kyc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Upload failed');

      // Refresh doc list
      const meRes = await fetch('http://localhost:5000/api/v1/vendors/me', { headers });
      const meData = await meRes.json();
      setDocs(meData.data?.kycDocuments ?? []);
      setSuccess(`${DOC_LABELS[docType] ?? docType} uploaded successfully. It will be reviewed by admin.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingId(null);
      setUploadingNew(null);
      e.target.value = '';
    }
  };

  const uploadedTypes = new Set(docs.map(d => d.type));
  const missingDocs = REQUIRED_TYPES.filter(t => !uploadedTypes.has(t));

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>Loading documents...</div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>My Documents</h1>
      <p style={{ color: '#64748b', marginBottom: 28 }}>
        Keep your compliance documents up to date. Expired or rejected documents must be re-uploaded for continued platform access.
      </p>

      {error && (
        <div style={{ padding: 12, background: '#fee2e2', color: '#b91c1c', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: 12, background: '#f0fdf4', color: '#166534', borderRadius: 8, marginBottom: 16, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {success}
        </div>
      )}

      {/* Uploaded documents */}
      {docs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {docs.map(doc => {
            const cfg = STATUS_CONFIG[doc.verificationStatus ?? 'PENDING'] ?? STATUS_CONFIG.PENDING;
            const needsAction = doc.verificationStatus === 'EXPIRED' || doc.verificationStatus === 'REJECTED';
            const isUploading = uploadingId === doc.id;

            return (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', border: `1px solid ${needsAction ? '#fca5a5' : '#e2e8f0'}`,
                borderRadius: 12, background: needsAction ? '#fff8f8' : '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: cfg.color, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: 0 }}>
                      {DOC_LABELS[doc.type]?.label ?? doc.type}
                    </p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 6px' }}>
                      {DOC_LABELS[doc.type]?.description ?? ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{cfg.sublabel}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      {doc.expiryDate && (
                        <span style={{ fontSize: 11, color: '#6b7280' }}>
                          Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <label style={{
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: needsAction ? 'var(--primary)' : '#f1f5f9',
                  color: needsAction ? '#fff' : '#475569',
                  opacity: isUploading ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span>
                  {isUploading ? 'Uploading...' : needsAction ? 'Re-upload' : 'Replace'}
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => handleReUpload(e, doc.type, doc.id)}
                    disabled={isUploading}
                  />
                </label>
              </div>
            );
          })}
        </div>
      )}

      {/* Missing documents */}
      {missingDocs.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
            Missing Documents
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missingDocs.map(type => {
              const isUploading = uploadingNew === type;
              return (
                <div key={type} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', border: '1px dashed #d1d5db', borderRadius: 12, background: '#f9fafb',
                }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#374151', fontSize: 14, margin: 0 }}>{DOC_LABELS[type]}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Not uploaded · PDF, JPG or PNG (max 5MB)</p>
                  </div>
                  <label style={{
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'var(--primary)', color: '#fff',
                    opacity: isUploading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span>
                    {isUploading ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => handleReUpload(e, type)}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </>
      )}

      {docs.length === 0 && missingDocs.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>No documents found.</div>
      )}
    </div>
  );
}
