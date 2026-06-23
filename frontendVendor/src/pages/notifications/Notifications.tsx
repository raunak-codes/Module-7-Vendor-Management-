import { useState, useEffect } from 'react';

const TYPE_STYLE: Record<string, { icon: string; iconBg: string; iconColor: string; dot: string }> = {
  INFO:    { icon: 'notifications',  iconBg: 'rgba(133,18,23,0.1)', iconColor: 'var(--primary)',   dot: 'var(--primary)' },
  WARNING: { icon: 'warning',        iconBg: 'rgba(202,168,2,0.1)', iconColor: '#b45309',           dot: '#b45309' },
  ALERT:   { icon: 'error',          iconBg: 'rgba(220,38,38,0.1)', iconColor: '#dc2626',           dot: '#dc2626' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchNotifs(); }, []);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setItems(d.data?.notifications ?? d.data?.items ?? d.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await fetch(`http://localhost:5000/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetch('http://localhost:5000/api/v1/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const unreadCount = items.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h3 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 4 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 700, background: 'var(--primary)', color: '#fff', borderRadius: 9999, padding: '2px 10px' }}>
                {unreadCount}
              </span>
            )}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--secondary)' }}>Stay updated with your latest business activities.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ padding: '8px 16px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', borderRadius: 8 }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {loading && <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Loading notifications...</p>}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: 'block', opacity: 0.4 }}>notifications_off</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No notifications yet</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>You're all caught up!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((notif) => {
          const style = TYPE_STYLE[notif.type] ?? TYPE_STYLE.INFO;
          return (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              style={{
                background: notif.isRead ? 'var(--surface-container-lowest)' : '#fff',
                padding: 16, borderRadius: 12,
                borderLeft: `4px solid ${notif.isRead ? 'var(--outline-variant)' : style.dot}`,
                display: 'flex', alignItems: 'flex-start', gap: 16,
                boxShadow: 'var(--card-shadow)', cursor: notif.isRead ? 'default' : 'pointer',
                opacity: notif.isRead ? 0.75 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: style.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: style.iconColor, fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>{notif.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--secondary)', flexShrink: 0, marginLeft: 12 }}>{timeAgo(notif.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: '20px' }}>{notif.message}</p>
              </div>

              {!notif.isRead && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: style.dot, flexShrink: 0, marginTop: 6 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
