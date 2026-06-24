import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import { CloseOutlined, CheckCircleFilled } from '@ant-design/icons';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  DRAFT:     { bg: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { bg: '#dcfce7', color: '#166534' },
  REJECTED:  { bg: '#fee2e2', color: '#991b1b' },
  FULFILLED: { bg: '#dbeafe', color: '#1e40af' },
  CANCELLED: { bg: '#f3f4f6', color: '#374151' },
};

export default function PurchaseOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/v1/purchase-orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setPo(d.data))
      .catch(() => message.error('Failed to load purchase order'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: 'CONFIRMED' | 'REJECTED') => {
    setActing(true);
    try {
      const token = localStorage.getItem('token');
      const mappedStatus = status === 'CONFIRMED' ? 'ACCEPTED' : status;
    const res = await fetch(`http://localhost:5000/api/v1/purchase-orders/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: mappedStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setPo((prev: any) => ({ ...prev, status: mappedStatus }));
      message.success(status === 'CONFIRMED' ? 'Order accepted!' : 'Order rejected.');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#6b7280' }}>Loading...</div>;
  if (!po) return <div style={{ padding: 40, color: '#ef4444' }}>Purchase order not found.</div>;

  const statusStyle = STATUS_COLORS[po.status] ?? STATUS_COLORS.DRAFT;
  const currency = po.currency ?? 'INR';
  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ padding: '4px 12px', background: statusStyle.bg, color: statusStyle.color, fontWeight: 600, fontSize: 11, borderRadius: 9999, letterSpacing: '0.05em' }}>
              {po.status?.replace('_', ' ')}
            </span>
            {po.approvalStatus && po.approvalStatus !== 'AUTO_APPROVED' && (
              <span style={{
                padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                background: po.approvalStatus === 'PENDING' ? '#fef3c7' : po.approvalStatus === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                color: po.approvalStatus === 'PENDING' ? '#92400e' : po.approvalStatus === 'APPROVED' ? '#166534' : '#991b1b',
              }}>
                {po.approvalStatus === 'PENDING' ? 'Awaiting Admin Approval' : po.approvalStatus}
              </span>
            )}
            <span style={{ color: 'var(--secondary)', fontSize: 12, fontWeight: 600 }}>
              Created on {new Date(po.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 4 }}>
            Purchase Order #{po.poNumber}
          </h2>
          {po.eventId && (
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Event ID: {po.eventId}</p>
          )}
        </div>

        {(po.status === 'ISSUED') && po.approvalStatus !== 'PENDING' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              icon={<CloseOutlined />}
              disabled={acting}
              onClick={() => updateStatus('REJECTED')}
              style={{ borderRadius: 12, height: 48, padding: '0 24px', fontWeight: 600, borderColor: 'var(--outline)' }}
            >
              Reject Order
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleFilled />}
              disabled={acting}
              onClick={() => updateStatus('ACCEPTED')}
              style={{ borderRadius: 12, height: 48, padding: '0 32px', fontWeight: 600, background: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              Accept Order
            </Button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Dates */}
          {(po.issueDate || po.expectedDeliveryDate) && (
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>event_available</span>
                Order Dates
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                {po.issueDate && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Issue Date</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
                      {new Date(po.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {po.expectedDeliveryDate && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Expected Delivery</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
                      {new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Line Items */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Itemized Breakdown</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-variant)' }}>
                  {['Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                    <th key={h} style={{ paddingBottom: 12, textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right', fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(po.lines ?? []).map((line: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(225,227,228,0.3)' }}>
                    <td style={{ padding: '16px 0' }}>
                      <p style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 14 }}>{line.description}</p>
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'center', fontSize: 14 }}>{line.quantity}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontSize: 14 }}>
                      {currency} {fmt(parseFloat(line.unitPrice))}
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                      {currency} {fmt(parseFloat(line.unitPrice) * line.quantity)}
                    </td>
                  </tr>
                ))}
                {(!po.lines || po.lines.length === 0) && (
                  <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No line items.</td></tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '2px solid var(--surface-variant)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 240 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, color: 'var(--primary)' }}>
                  <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'Manrope' }}>Total Amount</span>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Manrope' }}>
                    {currency} {fmt(parseFloat(po.totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Vendor Card */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
            <div style={{ height: 100, background: 'linear-gradient(135deg, #1a1a2e, #851217)' }} />
            <div style={{ padding: 24, marginTop: -32 }}>
              <div style={{ width: 64, height: 64, background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 26, fontVariationSettings: "'FILL' 1" }}>storefront</span>
                </div>
              </div>
              <h4 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 2 }}>
                {po.vendor?.businessName ?? 'Vendor'}
              </h4>
              <p style={{ fontSize: 12, color: 'var(--secondary)', marginBottom: 16 }}>
                {po.vendor?.category?.name ?? 'Service Provider'}
              </p>
              <div style={{ borderTop: '1px solid var(--surface-variant)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {po.vendor?.user?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 18 }}>alternate_email</span>
                    <span style={{ fontSize: 13, color: 'var(--on-surface)' }}>{po.vendor.user.email}</span>
                  </div>
                )}
                {po.vendor?.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 18 }}>location_on</span>
                    <span style={{ fontSize: 13, color: 'var(--on-surface)' }}>{po.vendor.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PO Meta */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Order Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'PO Number', value: `#${po.poNumber}` },
                { label: 'Status', value: po.status },
                { label: 'Currency', value: po.currency ?? 'INR' },
                { label: 'Vendor ID', value: po.vendorId?.slice(0, 8) + '...' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
