import { useState, useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function VendorProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ businessName: '', contactPersonName: '', address: '', businessDescription: '' });
  const token = localStorage.getItem('token');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/vendors/me', { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      const v = d.data;
      setProfile(v);
      setForm({ businessName: v?.businessName ?? '', contactPersonName: v?.contactPersonName ?? '', address: v?.address ?? '', businessDescription: v?.businessDescription ?? '' });

      // Fetch ratings
      if (v?.id) {
        fetch(`http://localhost:5000/api/v1/vendors/${v.id}/ratings`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(rd => setRatings(rd.data ?? []))
          .catch(() => {});
      }
    } catch (e) { console.error(e); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/vendors/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: form.businessName, contactPersonName: form.contactPersonName, address: form.address, businessDescription: form.businessDescription }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const d = await res.json();
      setProfile(d.data);
      setEditOpen(false);
      message.success('Profile updated successfully');
    } catch { message.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const avgRating = ratings.length ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1) : '—';
  const satisfaction = ratings.length ? Math.round((ratings.filter(r => r.rating >= 4).length / ratings.length) * 100) : 0;

  const services = profile?.services?.length > 0
    ? profile.services.map((s: any) => ({ icon: 'room_service', label: s.name, primary: true }))
    : [{ icon: 'room_service', label: profile?.category?.name ?? 'No services added yet', primary: true }];

  const contactDetails = [
    { icon: 'mail', label: 'Email Address', value: profile?.user?.email ?? profile?.email ?? '—' },
    { icon: 'person', label: 'Contact Person', value: profile?.contactPersonName ?? '—' },
    { icon: 'location_on', label: 'Address', value: profile?.address ?? '—' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid rgba(133,18,23,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 8 }}>Company Profile</h1>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>Manage your enterprise identity and hospitality credentials.</p>
        </div>
        <Button
          type="primary" icon={<EditOutlined />} onClick={() => setEditOpen(true)}
          style={{ background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 8, height: 44, fontWeight: 600, padding: '0 24px' }}
        >
          EDIT PROFILE
        </Button>
      </div>

      {/* Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Company Information */}
        <div style={{ background: 'var(--surface-container-lowest)', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(133,18,23,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined">business</span>
            </div>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Company Information</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Company Name', value: profile?.businessName ?? '—' },
              { label: 'GST Number', value: profile?.gstNumber ?? '—' },
              { label: 'PAN Number', value: profile?.panNumber ?? '—' },
              { label: 'Primary Contact', value: profile?.contactPersonName ?? '—' },
              { label: 'Status', value: profile?.status ?? '—' },
            ].map((field) => (
              <div key={field.label}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>{field.label}</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)' }}>{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services Offered */}
        <div style={{ background: 'var(--surface-container-lowest)', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(111,251,190,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tertiary)' }}>
                <span className="material-symbols-outlined">room_service</span>
              </div>
              <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Services Offered</h3>
            </div>
            <button onClick={() => navigate('/profile/services')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Manage →</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {services.map((s: any) => (
              <div key={s.label} style={{
                padding: '8px 16px', borderRadius: 9999,
                background: s.primary ? 'rgba(214,224,241,0.5)' : 'var(--surface-container-low)',
                color: s.primary ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
                border: '1px solid var(--outline-variant)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontSize: 14, fontWeight: s.primary ? 600 : 400 }}>{s.label}</span>
              </div>
            ))}
          </div>
          {profile?.businessDescription && (
            <div style={{ padding: 16, background: 'var(--surface-container-low)', borderRadius: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', marginBottom: 8 }}>Business Description</p>
              <p style={{ fontSize: 14, color: 'var(--on-surface)', lineHeight: '20px', fontStyle: 'italic' }}>"{profile.businessDescription}"</p>
            </div>
          )}
        </div>

        {/* Ratings & Feedback */}
        <div style={{ background: 'var(--surface-container-lowest)', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(189,199,216,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined">reviews</span>
            </div>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Ratings & Feedback</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '8px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'Manrope' }}>{avgRating}</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 22 }}>star</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>Average Score</p>
            </div>
            <div style={{ width: 1, height: 48, background: 'var(--outline-variant)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'Manrope', marginBottom: 4 }}>{ratings.length}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>Reviews</p>
            </div>
            <div style={{ width: 1, height: 48, background: 'var(--outline-variant)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--tertiary)', fontFamily: 'Manrope', marginBottom: 4 }}>{ratings.length ? `${satisfaction}%` : '—'}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>Satisfaction</p>
            </div>
          </div>
          <button onClick={() => navigate('/ratings')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            View detailed feedback reports
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>

        {/* Contact Details */}
        <div style={{ background: 'var(--surface-container-lowest)', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,218,215,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined">contact_mail</span>
            </div>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Contact Details</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {contactDetails.map((item) => (
              <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 8, cursor: 'default', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ padding: 8, background: 'var(--surface-container)', borderRadius: '50%', color: 'var(--secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)' }}>{item.label}</p>
                  <p style={{ fontSize: 16, color: 'var(--on-surface)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Banner */}
      <div style={{ marginTop: 32, borderRadius: 16, overflow: 'hidden', height: 200, position: 'relative', background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #851217 100%)', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 28, left: 32, color: '#fff' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--primary)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: 2, marginBottom: 10 }}>Vendor Profile</span>
          <h4 style={{ fontFamily: 'Manrope', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{profile?.businessName ?? 'Your Business'}</h4>
          <p style={{ fontSize: 14, opacity: 0.8 }}>{profile?.category?.name ?? ''} · {profile?.status ?? ''}</p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={save}
        okText="Save Changes"
        confirmLoading={saving}
        okButtonProps={{ style: { background: 'var(--primary)', borderColor: 'var(--primary)' } }}
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0' }}>
          {[
            { label: 'Business Name', key: 'businessName', placeholder: 'Your company name' },
            { label: 'Contact Person Name', key: 'contactPersonName', placeholder: 'Primary contact name' },
            { label: 'Address', key: 'address', placeholder: 'City, Country' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>{label}</label>
              <input
                value={(form as any)[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>Business Description</label>
            <textarea
              value={form.businessDescription}
              onChange={(e) => setForm(f => ({ ...f, businessDescription: e.target.value }))}
              placeholder="Describe your services..."
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
