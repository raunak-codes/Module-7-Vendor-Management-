import { Input, Badge, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  userName?: string;
  userRole?: string;
}

export default function TopBar({ userName = 'Luxe Events Co.', userRole = 'Premium Vendor' }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header style={{
      height: 80,
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'rgba(248,249,250,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--surface-container)',
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 480 }}>
        <Input
          prefix={<SearchOutlined style={{ color: 'var(--secondary)' }} />}
          placeholder="Search orders, invoices, or events..."
          style={{
            borderRadius: 8,
            background: 'var(--surface-container-low)',
            border: '1px solid var(--outline-variant)',
            height: 40,
            fontFamily: 'Hanken Grotesk',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          style={{
            background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: 9999, padding: '8px 20px',
            fontWeight: 600, cursor: 'pointer', fontSize: 14,
            fontFamily: 'Manrope, sans-serif', display: 'none',
          }}
          className="new-booking-btn"
        >
          New Booking
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative',
              color: 'var(--secondary)',
            }}
            onClick={() => navigate('/notifications')}
          >
            <Badge dot size="small" offset={[-2, 2]}>
              <BellOutlined style={{ fontSize: 20, color: 'var(--secondary)' }} />
            </Badge>
          </button>
          <button
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageOutlined style={{ fontSize: 20, color: 'var(--secondary)' }} />
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          paddingLeft: 16, borderLeft: '1px solid var(--outline-variant)',
        }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', lineHeight: '18px' }}>{userName}</p>
            <p style={{ fontSize: 12, color: 'var(--secondary)', lineHeight: '16px' }}>{userRole}</p>
          </div>
          <Avatar
            size={40}
            style={{ background: 'var(--primary)', cursor: 'pointer', border: '2px solid var(--primary-fixed)', fontFamily: 'Manrope' }}
            onClick={() => navigate('/profile')}
          >
            {userName.charAt(0)}
          </Avatar>
        </div>
      </div>
    </header>
  );
}
