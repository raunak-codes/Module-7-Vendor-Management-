import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { label: 'Purchase Orders', icon: 'receipt_long', path: '/purchase-orders' },
  { label: 'Work Orders', icon: 'engineering', path: '/work-orders' },
  { label: 'Finance', icon: 'payments', path: '/finance' },
  { label: 'Profile', icon: 'account_circle', path: '/profile' },
  { label: 'Ratings & Reviews', icon: 'star', path: '/ratings' },
  { label: 'Notifications', icon: 'notifications', path: '/notifications' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutModal, setLogoutModal] = useState(false);

  const isActive = (path: string) => {
    if (path === '/purchase-orders') {
      return location.pathname.startsWith('/purchase-orders');
    }
    return location.pathname === path;
  };

  return (
    <>
      <aside style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 16px',
        borderRight: '1px solid var(--surface-container)',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ marginBottom: 32, paddingLeft: 8 }}>
          <h1 style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--primary)',
            fontFamily: 'Manrope, sans-serif',
            lineHeight: '28px',
          }}>EventHub360</h1>
          <p style={{
            fontSize: 12,
            letterSpacing: '0.05em',
            fontWeight: 600,
            color: 'var(--secondary)',
            textTransform: 'uppercase',
            marginTop: 2,
          }}>Premium Concierge</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={isActive(item.path) ? 'sidebar-active' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: 'none',
                background: isActive(item.path) ? 'var(--secondary-container)' : 'transparent',
                color: isActive(item.path) ? 'var(--primary)' : 'var(--secondary)',
                fontWeight: isActive(item.path) ? 600 : 400,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontSize: 14,
                fontFamily: 'Hanken Grotesk, sans-serif',
                transition: 'all 0.2s ease',
                borderRight: isActive(item.path) ? '4px solid var(--primary)' : '4px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-container)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--secondary)';
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,
                  fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Button
            type="primary"
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              borderRadius: 9999,
              height: 44,
              fontWeight: 600,
              marginBottom: 8,
            }}
            onClick={() => navigate('/finance/upload')}
          >
            New Request
          </Button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
              borderRadius: 8, border: 'none', background: 'transparent',
              color: 'var(--secondary)', cursor: 'pointer', fontSize: 14,
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
            onClick={() => navigate('/help')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>help_outline</span>
            <span>Help Center</span>
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
              borderRadius: 8, border: 'none', background: 'transparent',
              color: 'var(--secondary)', cursor: 'pointer', fontSize: 14,
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
            onClick={() => setLogoutModal(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <Modal
        open={logoutModal}
        onCancel={() => setLogoutModal(false)}
        footer={null}
        centered
        width={400}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--error-container)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--error)' }}>logout</span>
          </div>
          <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Confirm Logout</h3>
          <p style={{ color: 'var(--secondary)', fontSize: 14, marginBottom: 24 }}>
            Are you sure you want to sign out of the Vendor Portal?
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button onClick={() => setLogoutModal(false)} style={{ borderRadius: 8, padding: '0 24px', height: 40 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              style={{ borderRadius: 8, padding: '0 24px', height: 40 }}
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
