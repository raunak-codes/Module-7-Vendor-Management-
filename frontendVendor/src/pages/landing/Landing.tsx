import { useNavigate, Link } from 'react-router-dom';
import { Button } from 'antd';

const services = [
  { icon: 'restaurant', title: 'Catering', desc: 'Michelin-star quality dining for elite events.' },
  { icon: 'celebration', title: 'Decoration', desc: 'Bespoke floral and design installations.' },
  { icon: 'audiotrack', title: 'DJ & Music', desc: 'World-class entertainment and sound.' },
  { icon: 'photo_camera', title: 'Photography', desc: 'Premium event coverage and media.' },
  { icon: 'speaker', title: 'AV & Sound', desc: 'Professional audio-visual solutions.' },
  { icon: 'airport_shuttle', title: 'Transport', desc: 'Luxury fleet and concierge transfers.' },
];

const stats = [
  { value: '1,200+', label: 'Verified Vendors' },
  { value: '8,400+', label: 'Events Managed' },
  { value: '₹14.8M', label: 'Payments Processed' },
  { value: '4.9★', label: 'Average Rating' },
];

const steps = [
  { step: '01', icon: 'app_registration', title: 'Register Your Business', desc: 'Submit your company details, services, and KYC documents. Onboarding takes under 10 minutes.' },
  { step: '02', icon: 'verified', title: 'Get Verified', desc: 'Our compliance team reviews and approves your profile within 24–48 hours.' },
  { step: '03', icon: 'handshake', title: 'Receive Event Requests', desc: 'Start receiving purchase orders from premium event planners worldwide.' },
  { step: '04', icon: 'payments', title: 'Get Paid Seamlessly', desc: 'Track invoices, submit receipts, and receive secure direct payouts to your account.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Hanken Grotesk, sans-serif' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 64px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(133,18,23,0.25)' }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20, fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Manrope' }}>EventHub360</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Premium Concierge</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {['About Services', 'How It Works', 'Contact Us'].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: '#374151', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>Log In</button>
          <button onClick={() => navigate('/login')} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(133,18,23,0.25)',
          }}>Become a Vendor</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '100px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 80, alignItems: 'center', maxWidth: 1280, margin: '0 auto',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(133,18,23,0.08)', borderRadius: 99, marginBottom: 24 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em' }}>THE PREMIUM VENDOR NETWORK</span>
          </div>
          <h1 style={{ fontSize: 58, fontWeight: 800, fontFamily: 'Manrope', lineHeight: '1.1', color: '#111827', marginBottom: 24 }}>
            Power the World's<br />
            <span style={{ color: 'var(--primary)' }}>Elite Events</span>
          </h1>
          <p style={{ fontSize: 18, color: '#6b7280', lineHeight: '30px', marginBottom: 40, maxWidth: 440 }}>
            Join EventHub360's curated vendor marketplace. Connect with luxury event planners, manage orders seamlessly, and grow your hospitality business.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Button type="primary" size="large" onClick={() => navigate('/login')}
              style={{ height: 56, padding: '0 36px', borderRadius: 10, background: 'var(--primary)', borderColor: 'var(--primary)', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope', boxShadow: '0 6px 24px rgba(133,18,23,0.25)' }}>
              Apply as Vendor
            </Button>
            <button onClick={() => navigate('/login')} style={{
              height: 56, padding: '0 32px', borderRadius: 10, border: '1px solid #e2e8f0',
              background: '#fff', color: '#374151', fontWeight: 600, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_circle</span>
              Vendor Login
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', height: 440, background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b2e 40%, #851217 100%)', boxShadow: '0 24px 80px rgba(133,18,23,0.2)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 32, left: 32, color: '#fff' }}>
              <p style={{ fontSize: 16, fontStyle: 'italic', opacity: 0.9, marginBottom: 12, maxWidth: 300, lineHeight: '24px' }}>
                "Elevated every event we've hosted together. EventHub360 is our go-to."
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1", color: '#fbbf24' }}>star</span>)}
              </div>
            </div>
          </div>
          {/* Floating stat card */}
          <div style={{
            position: 'absolute', top: 32, right: -24,
            background: '#fff', borderRadius: 14, padding: '16px 20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: '1px solid #f0f0f0',
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Manrope', marginBottom: 2 }}>1,200+</p>
            <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Verified Vendors</p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: 'var(--primary)', padding: '40px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', maxWidth: 1280, margin: '0 auto', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              textAlign: 'center', padding: '0 32px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none',
            }}>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: 'Manrope', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Services */}
      <section id="about-services" style={{ padding: '100px 64px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(133,18,23,0.06)', borderRadius: 99, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em' }}>OUR SERVICE ECOSYSTEM</span>
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 800, fontFamily: 'Manrope', color: '#111827', marginBottom: 16 }}>About Our Services</h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: '26px' }}>
            A comprehensive marketplace for every luxury event vertical — curated for quality, speed, and reliability.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {services.map((s) => (
            <div key={s.title}
              style={{
                padding: 32, borderRadius: 16, border: '1px solid #f0f0f0', background: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(133,18,23,0.2)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#f0f0f0'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: 52, height: 52, background: 'rgba(133,18,23,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Manrope', color: '#111827', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: '22px' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '100px 64px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(133,18,23,0.06)', borderRadius: 99, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em' }}>VENDOR ONBOARDING FLOW</span>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, fontFamily: 'Manrope', color: '#111827', marginBottom: 16 }}>Become a Vendor</h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: '26px' }}>
              Start earning from premium events in 4 simple steps. Approval is fast, setup is effortless.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {steps.map((s) => (
              <div key={s.step} style={{ padding: 28, borderRadius: 16, border: '1px solid #f0f0f0', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(133,18,23,0.3)', fontFamily: 'Manrope', letterSpacing: '-0.02em' }}>{s.step}</span>
                  <div style={{ width: 40, height: 40, background: 'rgba(133,18,23,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Manrope', color: '#111827', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: '20px' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact-us" style={{ padding: '100px 64px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, fontFamily: 'Manrope', color: '#111827', marginBottom: 16 }}>
            Ready to Grow Your Business?
          </h2>
          <p style={{ fontSize: 18, color: '#6b7280', lineHeight: '28px', marginBottom: 48 }}>
            Join 1,200+ verified vendors on the EventHub360 platform and connect with top-tier event planners across the globe.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 64 }}>
            <Button type="primary" size="large" onClick={() => navigate('/login')}
              style={{ height: 56, padding: '0 48px', borderRadius: 10, background: 'var(--primary)', borderColor: 'var(--primary)', fontSize: 16, fontWeight: 700, fontFamily: 'Manrope' }}>
              Start Your Application
            </Button>
            <button style={{ height: 56, padding: '0 32px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
              Contact Support
            </button>
          </div>

          {/* Contact Info Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { icon: 'mail', label: 'Email Support', value: 'vendor.support@eventhub360.com' },
              { icon: 'call', label: 'Phone', value: '+91 1800-200-360' },
              { icon: 'location_on', label: 'Headquarters', value: 'Mayfair, London, UK' },
            ].map((item) => (
              <div key={item.icon} style={{ padding: 24, borderRadius: 16, border: '1px solid #f0f0f0', background: '#fafafa', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)', fontVariationSettings: "'FILL' 1", display: 'block', marginBottom: 8 }}>{item.icon}</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{item.label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', padding: '40px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18, fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Manrope' }}>EventHub360</span>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280' }}>© 2024 EventHub360 Global Solutions. All Rights Reserved.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Support'].map((l) => (
            <a key={l} href="#" style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
