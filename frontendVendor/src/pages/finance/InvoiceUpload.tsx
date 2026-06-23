import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Select, message } from 'antd';
import { CloudUploadOutlined, CheckCircleOutlined } from '@ant-design/icons';

const schema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  purchaseOrder: z.string().min(1, 'Please select a Purchase Order'),
  amount: z.string().min(1, 'Amount is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function InvoiceUpload() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    setTimeout(() => {
      message.success('Invoice submitted successfully!');
      navigate('/finance');
      setLoading(false);
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid var(--outline-variant)', fontSize: 14,
    fontFamily: 'Hanken Grotesk', outline: 'none', background: '#fff',
    color: 'var(--on-surface)',
  };

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--secondary)', textTransform: 'uppercase' as const,
    letterSpacing: '0.08em', marginBottom: 6,
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          onClick={() => navigate('/finance')}>Finance</button>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--secondary)' }}>chevron_right</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)' }}>Upload Invoice</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 6 }}>Invoice Submission</h2>
        <p style={{ fontSize: 16, color: 'var(--secondary)' }}>Submit your billing details for verification and payment processing.</p>
      </div>

      {/* Bento Layout */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Step 1: Upload */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-highest)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>1</div>
                <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600 }}>Upload Document</h3>
              </div>
              <div
                onDragEnter={() => setDragActive(true)}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                style={{
                  position: 'relative', border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--outline-variant)'}`,
                  borderRadius: 12, padding: 48, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', background: dragActive ? '#fff1f0' : 'var(--surface-container-low)',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: fileName ? 'var(--tertiary-fixed-dim)' : 'var(--primary-fixed-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                  transition: 'all 0.3s',
                }}>
                  {fileName ? (
                    <CheckCircleOutlined style={{ fontSize: 28, color: 'var(--tertiary)' }} />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary)' }}>upload_file</span>
                  )}
                </div>
                <p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'Manrope', textAlign: 'center', marginBottom: 4 }}>
                  {fileName ? `File selected: ${fileName}` : 'Drag & drop your invoice here'}
                </p>
                <p style={{ fontSize: 14, color: 'var(--secondary)', textAlign: 'center' }}>Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                <Button style={{ marginTop: 24, borderRadius: 9999, borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600, padding: '0 24px', height: 36 }}>
                  Browse Files
                </Button>
                <input
                  type="file" accept=".pdf,.jpg,.png"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={(e) => { if (e.target.files?.[0]) setFileName(e.target.files[0].name); }}
                />
              </div>
            </div>

            {/* Step 2: Billing Info */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-highest)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>2</div>
                <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600 }}>Billing Information</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Invoice ID</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 18 }}>tag</span>
                    <input {...register('invoiceId')} placeholder="e.g. #INV-9902"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; }}
                    />
                  </div>
                  {errors.invoiceId && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.invoiceId.message}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Purchase Order (PO)</label>
                  <Select
                    style={{ width: '100%', height: 40 }}
                    placeholder="Select an active PO"
                    options={[
                      { value: 'PO-2024-001', label: 'PO-2024-001 (Grand Gala Catering)' },
                      { value: 'PO-2024-042', label: 'PO-2024-042 (Corporate Summit AV)' },
                    ]}
                    onChange={(val) => setValue('purchaseOrder', val)}
                  />
                  {errors.purchaseOrder && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.purchaseOrder.message}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Amount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontWeight: 700, fontSize: 14 }}>₹</span>
                    <input {...register('amount')} type="number" placeholder="0.00"
                      style={{ ...inputStyle, paddingLeft: 28 }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; }}
                    />
                  </div>
                  {errors.amount && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.amount.message}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Invoice Date</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 18 }}>calendar_today</span>
                    <input {...register('invoiceDate')} type="date"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; }}
                    />
                  </div>
                  {errors.invoiceDate && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.invoiceDate.message}</p>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description / Notes (Optional)</label>
                  <textarea {...register('description')}
                    rows={3}
                    placeholder="Add any additional context for the finance team..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '20px' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button style={{ borderRadius: 9999, padding: '0 32px', height: 48, fontWeight: 600 }}>
                Save Draft
              </Button>
              <Button
                type="primary" htmlType="submit" loading={loading}
                style={{
                  borderRadius: 9999, padding: '0 40px', height: 48,
                  background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(133,18,23,0.2)',
                }}
              >
                Submit Invoice
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Payment Tracking */}
            <div style={{
              background: 'var(--primary)', color: '#fff',
              borderRadius: 12, padding: 24, overflow: 'hidden', position: 'relative',
              boxShadow: '0 8px 30px rgba(133,18,23,0.25)',
            }}>
              <div style={{ position: 'absolute', right: -48, top: -48, width: 192, height: 192, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(24px)' }} />
              <h4 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 16, position: 'relative' }}>Payment Tracking</h4>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 14, opacity: 0.8 }}>Total Paid YTD</span>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Manrope' }}>₹ 2.4L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 14, opacity: 0.8 }}>Pending Payouts</span>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--tertiary-fixed)' }}>₹ 34k</span>
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Processing Speed</span>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>4.2 Days</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', background: '#fff', borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Guide */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-highest)' }}>
              <h4 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>info</span>
                Submission Guide
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none' }}>
                {[
                  { title: 'Clarity:', text: 'Ensure all text and the vendor seal are clearly visible in the upload.' },
                  { title: 'PO Match:', text: 'Invoice amount must match the allocated PO budget exactly.' },
                  { title: 'Tax ID:', text: 'Include your GST/Tax ID clearly on the primary document.' },
                ].map((item) => (
                  <li key={item.title} style={{ display: 'flex', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: 20, flexShrink: 0, marginTop: 2 }}>check_circle</span>
                    <p style={{ fontSize: 14, color: 'var(--secondary)' }}>
                      <strong style={{ color: 'var(--on-surface)' }}>{item.title}</strong> {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Card */}
            <div style={{
              background: 'var(--surface-container-low)', borderRadius: 12, padding: 24,
              border: '2px dashed var(--outline-variant)', textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, background: '#fff', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid var(--surface-container-highest)',
              }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 24 }}>support_agent</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Need help with billing?</p>
              <p style={{ fontSize: 12, color: 'var(--secondary)', marginBottom: 16 }}>Our finance concierge is online.</p>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Contact Finance Desk</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
