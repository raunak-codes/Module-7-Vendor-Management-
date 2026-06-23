import { useState } from 'react';

const notifications = [
  {
    id: 1, type: 'order',
    icon: 'shopping_cart', iconBg: 'rgba(133,18,23,0.1)', iconColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    title: 'New Order Assigned', time: '10m ago', isUnread: true,
    message: 'Order #PO-2024-112 has been assigned to your service list. Please review and confirm the delivery timeline.',
    actions: [{ label: 'View Details', color: 'var(--primary)' }, { label: 'Dismiss', color: 'var(--secondary)' }],
  },
  {
    id: 2, type: 'payment',
    icon: 'payments', iconBg: 'rgba(0,77,51,0.1)', iconColor: 'var(--tertiary)',
    borderColor: 'var(--tertiary)',
    title: 'Payment Received', time: '2h ago', isUnread: true,
    message: 'Invoice #990 has been marked as Paid. The funds have been initiated to your settlement account.',
    actions: [{ label: 'Download Receipt', color: 'var(--tertiary)' }],
  },
  {
    id: 3, type: 'verification',
    icon: 'verified_user', iconBg: 'var(--secondary-container)', iconColor: 'var(--on-secondary-container)',
    borderColor: 'var(--secondary)',
    title: 'KYC Verification Successful', time: '1d ago', isUnread: false,
    message: 'Your professional profile KYC documents were verified by the compliance team. You now have full access to high-value event bidding.',
    actions: [],
  },
  {
    id: 4, type: 'system',
    icon: 'settings_suggest', iconBg: 'var(--surface-container)', iconColor: 'var(--secondary)',
    borderColor: 'var(--secondary-fixed-dim)',
    title: 'Platform Maintenance Complete', time: '2d ago', isUnread: false,
    message: 'The weekly platform maintenance is complete. New analytics features are now available in your dashboard.',
    actions: [],
  },
];

export default function Notifications() {
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const markRead = (id: number) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h3 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 4 }}>Notifications</h3>
          <p style={{ fontSize: 14, color: 'var(--secondary)' }}>Stay updated with your latest business activities.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={markAllRead}
            style={{ padding: '8px 16px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', borderRadius: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(133,18,23,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            Mark all as read
          </button>
          <button style={{ padding: 8, background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', borderRadius: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((notif) => (
          <div key={notif.id}
            onClick={() => markRead(notif.id)}
            style={{
              background: 'var(--surface-container-lowest)',
              padding: 16, borderRadius: 12,
              borderLeft: `4px solid ${notif.borderColor}`,
              display: 'flex', alignItems: 'flex-start', gap: 24,
              boxShadow: 'var(--card-shadow)', cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              opacity: notif.isUnread ? 1 : 0.8,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0px 8px 30px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: notif.iconBg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ color: notif.iconColor, fontVariationSettings: "'FILL' 1" }}>
                {notif.icon}
              </span>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)' }}>{notif.title}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)' }}>{notif.time}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: '20px', marginBottom: notif.actions.length > 0 ? 12 : 0 }}>
                {notif.message}
              </p>
              {notif.actions.length > 0 && (
                <div style={{ display: 'flex', gap: 16 }}>
                  {notif.actions.map((action) => (
                    <button key={action.label} style={{
                      background: 'none', border: 'none', color: action.color,
                      fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Unread Indicator */}
            {notif.isUnread && (
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: notif.type === 'payment' ? 'var(--tertiary)' : 'var(--primary)',
                flexShrink: 0, marginTop: 6,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      <div style={{
        marginTop: 24, padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px dashed var(--outline-variant)', borderRadius: 16,
        background: 'rgba(243,244,245,0.3)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--secondary)', marginBottom: 16 }}>Showing 4 of 24 notifications</p>
          <button style={{
            padding: '12px 32px', background: 'var(--surface-container-highest)',
            border: 'none', borderRadius: 9999, fontWeight: 600, fontSize: 14, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-high)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-container-highest)')}
          >
            Load Older Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
