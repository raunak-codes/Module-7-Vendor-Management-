import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await fetch('http://localhost:5000/api/v1/vendors/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const companyName = profile?.businessName || 'Elite Catering & Event Design';
  const regNumber = profile?.registrationNumber || 'ECED-99283-BH';
  const primaryContact = profile?.user?.email || 'Vendor Contact';
  
  const services = [
    { icon: 'restaurant', label: profile?.category?.name || 'Primary Service', primary: true },
    { icon: 'celebration', label: 'Secondary: Event Management', primary: false },
    { icon: 'audiotrack', label: 'Support Services', primary: false },
  ];

  const contactDetails = [
    { icon: 'mail', label: 'Email Address', value: profile?.user?.email || 'vendor@example.com' },
    { icon: 'call', label: 'Phone Number', value: profile?.contactPhone || '+91 9988776655' },
    { icon: 'location_on', label: 'Headquarters', value: 'Mayfair, London, UK' },
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
          type="primary" icon={<EditOutlined />}
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
              { label: 'Company Name', value: companyName },
              { label: 'Registration Number', value: regNumber },
              { label: 'Primary Contact Person', value: primaryContact },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(111,251,190,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tertiary)' }}>
              <span className="material-symbols-outlined">room_service</span>
            </div>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Services Offered</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {services.map((s) => (
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
          <div style={{ padding: 16, background: 'var(--surface-container-low)', borderRadius: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', marginBottom: 8 }}>Service Description</p>
            <p style={{ fontSize: 14, color: 'var(--on-surface)', lineHeight: '20px', fontStyle: 'italic' }}>
              "Providing Michelin-star quality dining experiences for elite corporate retreats and luxury gala events."
            </p>
          </div>
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
                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'Manrope' }}>4.8</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 22 }}>star</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>Average Score</p>
            </div>
            <div style={{ width: 1, height: 48, background: 'var(--outline-variant)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'Manrope', marginBottom: 4 }}>124</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>Reviews</p>
            </div>
            <div style={{ width: 1, height: 48, background: 'var(--outline-variant)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--tertiary)', fontFamily: 'Manrope', marginBottom: 4 }}>98%</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>Satisfaction</p>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
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
              <div key={item.icon} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: 12,
                borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s',
              }}
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

      {/* Portfolio Spotlight */}
      <div style={{
        marginTop: 32, borderRadius: 16, overflow: 'hidden', height: 300, position: 'relative',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #851217 100%)',
        boxShadow: 'var(--card-shadow)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 32, left: 32, color: '#fff' }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', background: 'var(--primary)', color: '#fff',
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
            borderRadius: 2, marginBottom: 12,
          }}>Portfolio Spotlight</span>
          <h4 style={{ fontFamily: 'Manrope', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>The Grand Gala 2024</h4>
          <p style={{ fontSize: 16, opacity: 0.8, maxWidth: 600, lineHeight: '24px' }}>
            A showcase of our signature catering and design services executed for the annual International Hotelier Convention.
          </p>
        </div>
      </div>
    </div>
  );
}
