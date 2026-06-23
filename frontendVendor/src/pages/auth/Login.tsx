import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, message } from 'antd';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional().or(z.literal('')),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (_data: LoginFormData) => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('token', 'demo-token');
      message.success('Login successful!');
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: `
        radial-gradient(circle at top right, rgba(133, 18, 23, 0.05), transparent 40%),
        radial-gradient(circle at bottom left, rgba(133, 18, 23, 0.03), transparent 40%)
      `,
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '32px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: 'var(--primary)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(133,18,23,0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Manrope', lineHeight: '24px' }}>EventHub360</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vendor Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#" style={{ color: 'var(--secondary)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Support</a>
          <a href="#" style={{ color: 'var(--secondary)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Card */}
          <div style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 16,
            boxShadow: '0px 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid var(--surface-container)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
              {/* Title */}
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-background)', fontFamily: 'Manrope', marginBottom: 8 }}>Login</h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Welcome back. Please enter your concierge credentials.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: 20 }}>mail</span>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="vendor@eventhub360.com"
                      style={{
                        width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                        background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
                        borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none',
                        color: 'var(--on-surface)',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(133,18,23,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.email && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: 20 }}>lock</span>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      style={{
                        width: '100%', paddingLeft: 44, paddingRight: 48, paddingTop: 14, paddingBottom: 14,
                        background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
                        borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none',
                        color: 'var(--on-surface)',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(133,18,23,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.password && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
                </div>

                {/* OTP */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OTP Verification</label>
                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Resend Code</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: 20 }}>security</span>
                    <input
                      {...register('otp')}
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      style={{
                        width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                        background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
                        borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none',
                        color: 'var(--on-surface)', textAlign: 'center', letterSpacing: '0.5em',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(133,18,23,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>
                    Check your registered mobile or email for the OTP code.
                  </p>
                </div>

                {/* Forgot Password */}
                <div style={{ textAlign: 'center' }}>
                  <a href="#" style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)', textDecoration: 'none' }}>Forgot Password?</a>
                </div>

                {/* Submit */}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: '100%', height: 52, borderRadius: 9999,
                    background: 'var(--primary)', borderColor: 'var(--primary)',
                    fontSize: 16, fontWeight: 700, fontFamily: 'Manrope',
                    letterSpacing: '0.05em', boxShadow: '0 4px 20px rgba(133,18,23,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  LOGIN <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div style={{
              background: 'var(--surface-container-low)',
              padding: '16px 32px',
              borderTop: '1px solid var(--surface-container)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 12, color: 'var(--secondary)' }}>
                Don't have an account?{' '}
                <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Apply for Partnership</a>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 32, opacity: 0.4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Secure Banking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>encrypted</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>AES-256 Encryption</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)' }}>© 2024 EventHub360 Global Solutions. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
