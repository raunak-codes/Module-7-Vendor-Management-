import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Checkbox, message } from 'antd';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const inputStyle: React.CSSProperties = {
  width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
  background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none',
  color: '#1a1a2e', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6,
};

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Login failed');

      const { token, user } = resData.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('vendorId', user.vendorId ?? '');
      localStorage.setItem('vendorStatus', user.vendorStatus ?? user.status ?? 'PENDING');

      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 44, height: 44, background: 'var(--primary)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(133,18,23,0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Manrope', lineHeight: '22px' }}>EventHub360</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Premium Concierge</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Support', 'Terms of Service'].map(l => (
            <a key={l} href="#" style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </header>

      {/* Body */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1200, width: '100%', margin: '0 auto', padding: '40px 48px', gap: 80, alignItems: 'center' }}>
        {/* Left */}
        <div>
          <h1 style={{ fontSize: 42, fontWeight: 800, fontFamily: 'Manrope', lineHeight: '1.15', color: '#1a1a2e', marginBottom: 20 }}>
            Join the <span style={{ color: 'var(--primary)' }}>EventHub360</span><br />Vendor Network
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: '26px', marginBottom: 36, maxWidth: 420 }}>
            Partner with luxury event planners and showcase your services to premium clients worldwide. Elevate your brand in the global hospitality ecosystem.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
            {['Receive Event Requests', 'Manage Purchase Orders', 'Track Payments', 'Submit Invoices', 'Build Vendor Reputation'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div style={{
            borderRadius: 16, overflow: 'hidden', position: 'relative', height: 260,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b2e 50%, #851217 100%)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24, color: '#fff' }}>
              <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: '22px', marginBottom: 8, maxWidth: 340, opacity: 0.9 }}>
                "The most seamless platform for elite vendor management I've used in a decade."
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>
                -- Julian V., Director of Operations
              </p>
            </div>
          </div>
        </div>

        {/* Right - Auth Card */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f0f0f0' }}>
            {(['login', 'register'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '20px', border: 'none', cursor: 'pointer',
                background: tab === t ? '#fff' : '#fafafa',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === t ? 'var(--primary)' : '#9ca3af',
                fontWeight: 700, fontSize: 16, fontFamily: 'Manrope',
                textTransform: 'capitalize', letterSpacing: '0.01em',
                transition: 'all 0.2s',
              }}>{t === 'login' ? 'Login' : 'Register'}</button>
            ))}
          </div>

          <div style={{ padding: 40 }}>
            {tab === 'login' ? (
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 20 }}>mail</span>
                    <input {...register('email')} type="email" placeholder="name@company.com" style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(133,18,23,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.email && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                    <a href="#" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 20 }}>lock</span>
                    <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(133,18,23,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.password && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
                </div>

                <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ fontSize: 14, color: '#374151' }}>
                  Remember Me
                </Checkbox>

                <Button type="primary" htmlType="submit" loading={loading} style={{
                  width: '100%', height: 52, borderRadius: 8,
                  background: 'var(--primary)', borderColor: 'var(--primary)',
                  fontSize: 16, fontWeight: 700, fontFamily: 'Manrope',
                  letterSpacing: '0.02em',
                }}>
                  Login
                </Button>

                <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setTab('register')} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                    Create Account
                  </button>
                </p>
              </form>
            ) : (
              <RegisterForm onSuccess={() => { setTab('login'); message.success('Registration submitted! Await admin verification.'); }} />
            )}
          </div>
        </div>
      </main>

      <footer style={{ padding: '24px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>&copy; 2024 EventHub360 Global Solutions. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

// -- Multi-step Register Form --

const registerSchema = z.object({
  businessName: z.string().min(2, 'Required'),
  contactName: z.string().min(2, 'Required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(5, 'Required'),
  vendorCategory: z.string().min(1, 'Select a category'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  gstNumber: z.string().min(1, 'Required'),
  panNumber: z.string().min(1, 'Required'),
  bankName: z.string().min(1, 'Required'),
  accountNumber: z.string().min(8, 'Required'),
});

type RegisterData = z.infer<typeof registerSchema>;

const STEPS = ['Company Info', 'Services', 'KYC & Bank'];
const SERVICES = ['Catering', 'DJ & Music', 'Decoration', 'Photography', 'AV & Sound', 'Security', 'Transport', 'Venue'];
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/vendors/categories')
      .then(r => r.json())
      .then(d => setCategories(d.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  const { register, handleSubmit, formState: { errors }, trigger, setValue } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { services: [] },
  });

  const toggleService = (s: string) => {
    const next = selectedServices.includes(s) ? selectedServices.filter(x => x !== s) : [...selectedServices, s];
    setSelectedServices(next);
    setValue('services', next);
  };

  const stepFields: Record<number, (keyof RegisterData)[]> = {
    0: ['businessName', 'contactName', 'email', 'password', 'phone', 'address', 'vendorCategory'],
    1: ['services'],
    2: ['gstNumber', 'panNumber', 'bankName', 'accountNumber'],
  };

  const next = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/register-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: data.businessName,
          contactName: data.contactName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          address: data.address,
          vendorCategory: data.vendorCategory,
          services: data.services,
          gstNumber: data.gstNumber,
          panNumber: data.panNumber,
          bankAccountNumber: data.accountNumber,
        })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Registration failed');
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                background: i <= step ? 'var(--primary)' : '#f3f4f6',
                color: i <= step ? '#fff' : '#9ca3af',
                transition: 'all 0.3s',
              }}>
                {i < step ? <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check</span> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: i === step ? 'var(--primary)' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 2, flex: 1, background: i < step ? 'var(--primary)' : '#e5e7eb', marginBottom: 20, transition: 'all 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Company Information */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Business Name</label>
              <input {...register('businessName')} placeholder="Elite Catering & Events" style={{ ...inputStyle, paddingLeft: 16 }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
              />
              {errors.businessName && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.businessName.message}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Contact Person</label>
                <input {...register('contactName')} placeholder="Full name" style={{ ...inputStyle, paddingLeft: 16 }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                />
                {errors.contactName && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.contactName.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input {...register('phone')} placeholder="+91 9900000000" style={{ ...inputStyle, paddingLeft: 16 }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                />
                {errors.phone && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.phone.message}</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 20 }}>mail</span>
                <input {...register('email')} type="email" placeholder="vendor@company.com" style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                />
              </div>
              {errors.email && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.email.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 20 }}>lock</span>
                <input {...register('password')} type={showRegPassword ? 'text' : 'password'} placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                />
                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showRegPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.password.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input {...register('address')} placeholder="123 Business Street, City" style={{ ...inputStyle, paddingLeft: 16 }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
              />
              {errors.address && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.address.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Vendor Category</label>
              <select {...register('vendorCategory')} style={{ ...inputStyle, paddingLeft: 16, cursor: 'pointer', appearance: 'none', background: '#fff' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
              >
                <option value="">Select category...</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              {errors.vendorCategory && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.vendorCategory.message}</p>}
            </div>
          </div>
        )}

        {/* Step 1: Services */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Select the services your business offers. You can configure pricing after registration.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {SERVICES.map((s) => {
                const active = selectedServices.includes(s);
                return (
                  <button type="button" key={s} onClick={() => toggleService(s)} style={{
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: active ? '2px solid var(--primary)' : '2px solid #e5e7eb',
                    background: active ? 'rgba(133,18,23,0.04)' : '#fff',
                    color: active ? 'var(--primary)' : '#374151',
                    fontWeight: active ? 700 : 500, fontSize: 14,
                    transition: 'all 0.15s',
                  }}>
                    {s}
                  </button>
                );
              })}
            </div>
            {errors.services && <p style={{ color: 'var(--error)', fontSize: 12 }}>{errors.services.message}</p>}
            <div style={{ padding: 16, background: '#fef3c7', borderRadius: 10, border: '1px solid #fcd34d' }}>
              <p style={{ fontSize: 12, color: '#92400e' }}>
                <strong>Rate cards</strong> can be set up from your vendor dashboard after your account is approved.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: KYC & Bank Details */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Required for compliance and payment processing.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>GST Certificate Number</label>
                <input {...register('gstNumber')} placeholder="22AAAAA0000A1Z5" style={{ ...inputStyle, paddingLeft: 16 }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                />
                {errors.gstNumber && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.gstNumber.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>PAN Card Number</label>
                <input {...register('panNumber')} placeholder="ABCDE1234F" style={{ ...inputStyle, paddingLeft: 16 }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                />
                {errors.panNumber && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.panNumber.message}</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Bank Name</label>
              <input {...register('bankName')} placeholder="HDFC Bank / SBI / ICICI..." style={{ ...inputStyle, paddingLeft: 16 }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
              />
              {errors.bankName && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.bankName.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Account Number</label>
              <input {...register('accountNumber')} placeholder="00000000000000" style={{ ...inputStyle, paddingLeft: 16 }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
              />
              {errors.accountNumber && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 2 }}>{errors.accountNumber.message}</p>}
            </div>
            <div style={{ padding: 24, border: '2px dashed #d1d5db', borderRadius: 10, textAlign: 'center', background: '#fafafa' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#9ca3af', display: 'block', marginBottom: 8 }}>upload_file</span>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Upload KYC Documents</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>GST Certificate, PAN Card, Bank Passbook -- PDF or JPG</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} style={{
              flex: 1, padding: '14px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}>Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} style={{
              flex: 1, padding: '14px', borderRadius: 8,
              border: 'none', background: 'var(--primary)',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>Continue</button>
          ) : (
            <Button type="primary" htmlType="submit" loading={loading} style={{
              flex: 1, height: 50, borderRadius: 8,
              background: 'var(--primary)', borderColor: 'var(--primary)',
              fontWeight: 700, fontSize: 15,
            }}>Submit Registration</Button>
          )}
        </div>
      </form>
    </div>
  );
}
