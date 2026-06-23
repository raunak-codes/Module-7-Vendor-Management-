import React, { useState, useEffect } from 'react';

const REQUIRED_DOCS = [
  { id: 'gst', label: 'GST Certificate', type: 'GST_CERTIFICATE' },
  { id: 'pan', label: 'PAN Card', type: 'PAN' },
  { id: 'business', label: 'Business Registration', type: 'INCORPORATION_CERTIFICATE' },
  { id: 'bank', label: 'Bank Proof (Cancelled Cheque / Statement)', type: 'CANCELLED_CHEQUE' },
];

export default function KYCUpload({ onComplete }: { onComplete: () => void }) {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current vendor data to see what is already uploaded
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/v1/vendors/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.data) {
        setVendorId(data.data.id);
        const docs = data.data.kycDocuments || [];
        const uploaded: Record<string, boolean> = {};
        docs.forEach((d: any) => {
          uploaded[d.documentType] = true;
        });
        setUploadedDocs(uploaded);
      }
    })
    .catch(err => console.error(err));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files || e.target.files.length === 0 || !vendorId) return;
    const file = e.target.files[0];
    
    setLoadingDoc(docType);
    setError(null);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', docType);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/vendors/${vendorId}/kyc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Upload failed');
      }

      setUploadedDocs(prev => ({ ...prev, [docType]: true }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDoc(null);
    }
  };

  const allUploaded = REQUIRED_DOCS.every(doc => uploadedDocs[doc.type]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Complete Your Profile</h2>
      <p style={{ color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
        To finish your registration and get approved, please upload the following mandatory compliance documents.
      </p>

      {error && (
        <div style={{ padding: 12, background: '#fee2e2', color: '#b91c1c', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {REQUIRED_DOCS.map(doc => {
          const isUploaded = uploadedDocs[doc.type];
          const isLoading = loadingDoc === doc.type;
          
          return (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: '1px solid #e2e8f0', borderRadius: 8, background: isUploaded ? '#f0fdf4' : '#fafafa' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{doc.label}</p>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  {isUploaded ? 'Document uploaded successfully' : 'PDF, JPG or PNG (Max 5MB)'}
                </p>
              </div>
              <div>
                {isUploaded ? (
                  <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                    Uploaded
                  </span>
                ) : (
                  <label style={{ cursor: isLoading ? 'not-allowed' : 'pointer', background: 'var(--primary)', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600, display: 'inline-block', opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? 'Uploading...' : 'Upload'}
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, doc.type)}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ padding: '10px 20px', background: 'none', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          Logout
        </button>
        <button 
          onClick={onComplete}
          disabled={!allUploaded}
          style={{ 
            padding: '12px 24px', 
            background: allUploaded ? 'var(--primary)' : '#e2e8f0', 
            color: allUploaded ? '#fff' : '#94a3b8', 
            border: 'none', 
            borderRadius: 6, 
            cursor: allUploaded ? 'pointer' : 'not-allowed', 
            fontWeight: 600 
          }}
        >
          Submit for Review
        </button>
      </div>
    </div>
  );
}
