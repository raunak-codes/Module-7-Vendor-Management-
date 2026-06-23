import { useNavigate } from 'react-router-dom';
import { Button, Tag } from 'antd';
import { CloseOutlined, CheckCircleFilled, DownloadOutlined } from '@ant-design/icons';

const lineItems = [
  { icon: 'restaurant', name: 'Premium Catering Set', desc: 'Silver service, 3-course plating', qty: 250, unitPrice: '$125.00', total: '$31,250.00' },
  { icon: 'groups', name: 'Service Personnel', desc: 'Waitstaff and floor leads (8 hours)', qty: 15, unitPrice: '$45.00', total: '$5,400.00' },
  { icon: 'wine_bar', name: 'Open Bar Package', desc: 'Premium spirits and sommelier selection', qty: 250, unitPrice: '$85.00', total: '$21,250.00' },
];

const timeline = [
  { icon: 'history', label: 'PO Drafted', sub: 'Oct 24, 09:15 AM by Elena Rossi', bg: 'var(--secondary-container)', iconColor: 'var(--primary)', hasLine: true },
  { icon: 'send', label: 'Sent to Vendor', sub: 'Oct 24, 11:30 AM', bg: 'var(--surface-container)', iconColor: 'var(--secondary)', hasLine: true },
  { icon: 'visibility', label: 'Pending Approval', sub: 'Waiting for Vendor action', bg: 'rgba(133,18,23,0.1)', iconColor: 'var(--primary)', hasLine: false },
];

export default function PurchaseOrderDetails() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{
              padding: '4px 12px', background: 'var(--secondary-container)',
              color: 'var(--primary)', fontWeight: 600, fontSize: 11,
              borderRadius: 9999, letterSpacing: '0.05em',
            }}>DRAFT</span>
            <span style={{ color: 'var(--secondary)', fontSize: 12, fontWeight: 600 }}>Created on Oct 24, 2023</span>
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 4 }}>Purchase Order #PO-2024-001</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>Gala Dinner Equipment & Staffing</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            icon={<CloseOutlined />}
            style={{ borderRadius: 12, height: 48, padding: '0 24px', fontWeight: 600, borderColor: 'var(--outline)' }}
          >
            Reject Order
          </Button>
          <Button
            type="primary" icon={<CheckCircleFilled />}
            style={{ borderRadius: 12, height: 48, padding: '0 32px', fontWeight: 600, background: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            Accept Order
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Event Details */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>event_available</span>
              Event Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {[
                { label: 'Event Name', value: 'Grand Autumn Gala 2024' },
                { label: 'Venue', value: 'Regency Grand Ballroom' },
                { label: 'Date', value: 'Nov 15, 2024' },
                { label: 'Coordinator', value: 'Elena Rossi' },
              ].map((item) => (
                <div key={item.label}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Table */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600 }}>Itemized Breakdown</h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <DownloadOutlined /> Download PDF
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-variant)' }}>
                  {['Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                    <th key={h} style={{ paddingBottom: 16, textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right', fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', paddingLeft: i === 0 ? 8 : 0, paddingRight: i === 3 ? 8 : 0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(225,227,228,0.3)' }}>
                    <td style={{ padding: '20px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>{item.icon}</span>
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 14 }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--secondary)' }}>{item.desc}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 0', textAlign: 'center', fontSize: 14 }}>{item.qty}</td>
                    <td style={{ padding: '20px 0', textAlign: 'right', fontSize: 14 }}>{item.unitPrice}</td>
                    <td style={{ padding: '20px 8px', textAlign: 'right', fontWeight: 600, fontSize: 14 }}>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Totals */}
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '2px solid var(--surface-variant)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 256, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Subtotal', value: '$57,900.00' },
                  { label: 'Service Tax (8%)', value: '$4,632.00' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)' }}>
                    <span style={{ fontSize: 14 }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--surface-variant)', color: 'var(--primary)' }}>
                  <span style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Manrope' }}>Grand Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Manrope' }}>$62,532.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Notes */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>sticky_note_2</span>
              Vendor Notes
            </h3>
            <div style={{ padding: 20, background: 'var(--surface-container-low)', borderRadius: 12, borderLeft: '4px solid rgba(133,18,23,0.2)' }}>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: '22px', fontStyle: 'italic' }}>
                "Please note that the premium spirits list includes the 2018 Reserve Selection. All staff will be briefed on dietary restrictions (Vegan and Nut-free alternatives confirmed for 18 guests). Final walkthrough scheduled for Nov 14th at 2:00 PM."
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Vendor Card */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
            <div style={{ height: 128, background: 'linear-gradient(135deg, #1a1a2e, #851217)' }} />
            <div style={{ padding: 24, marginTop: -40 }}>
              <div style={{ width: 80, height: 80, background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 4, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 32, fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 2 }}>Maison de Luxe</h4>
                  <p style={{ fontSize: 12, color: 'var(--secondary)' }}>Premium Catering Partner</p>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, background: 'rgba(0,77,51,0.1)', color: 'var(--tertiary)', padding: '4px 10px', borderRadius: 9999 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--surface-variant)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: 'location_on', text: '75 Rue du Faubourg, Paris, FR' },
                  { icon: 'call', text: '+33 1 45 67 89 00' },
                  { icon: 'alternate_email', text: 'orders@maisondeluxe.com' },
                ].map((item) => (
                  <div key={item.icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 20 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, color: 'var(--on-surface)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Button style={{ width: '100%', marginTop: 24, borderRadius: 12, height: 44, borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 }}>
                View Portfolio
              </Button>
            </div>
          </div>

          {/* Activity Log */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Activity Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {timeline.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: item.iconColor }}>{item.icon}</span>
                    </div>
                    {item.hasLine && <div style={{ width: 2, flex: 1, background: 'var(--surface-container-highest)', margin: '8px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: i === 2 ? 'var(--primary)' : 'var(--on-surface)' }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 2 }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Attachments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Menu_Draft_V2.pdf', 'Floor_Plan_Ballroom.dwg'].map((file) => (
                <div key={file} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 12, background: 'var(--surface-container-low)', borderRadius: 12, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-high)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                      {file.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                    </span>
                    <span style={{ fontSize: 14 }}>{file}</span>
                  </div>
                  <DownloadOutlined style={{ color: 'var(--secondary)' }} />
                </div>
              ))}
            </div>
            <button style={{
              width: '100%', marginTop: 16, padding: 12, border: '2px dashed var(--outline-variant)',
              borderRadius: 12, background: 'none', color: 'var(--secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontWeight: 600, fontSize: 12, transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
              Upload New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
