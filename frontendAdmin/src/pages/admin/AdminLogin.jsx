import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

/**
 * AdminLogin
 * Secure admin entry point with email, password and 6-digit 2FA code.
 * Matches Stitch screen: admin_login
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleOtpChange = (idx, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your admin email and password.");
      return;
    }
    if (otp.some((d) => d === "")) {
      setError("Please enter the full 6-digit authentication code.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/admin/dashboard");
    }, 700);
  };

  return (
    <div className="admin-login">
      <div className="admin-login__glow admin-login__glow--top" />
      <div className="admin-login__glow admin-login__glow--bottom" />

      <div className="admin-login__brand">
        <div className="admin-login__logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#b51b1e" />
            <path d="M2 17L12 22L22 17" stroke="#b51b1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#b51b1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="admin-login__title">EventHub360</h1>
        <p className="admin-login__subtitle">Vendor Management Admin Portal</p>
      </div>

      <form className="admin-login__card" onSubmit={handleSubmit}>
        <div className="admin-login__field">
          <label className="admin-login__label" htmlFor="admin-email">
            Admin Email
          </label>
          <div className="admin-login__input-wrap">
            <svg className="admin-login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6.5L12 13L21 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@eventhub360.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <div className="admin-login__field">
          <div className="admin-login__label-row">
            <label className="admin-login__label" htmlFor="admin-password">
              Password
            </label>
            <button type="button" className="admin-login__forgot" onClick={() => navigate("/admin/forgot-password")}>
              Forgot Password?
            </button>
          </div>
          <div className="admin-login__input-wrap">
            <svg className="admin-login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="admin-login__field">
          <label className="admin-login__label">Two-Factor Authentication</label>
          <div className="admin-login__otp-row">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpRefs.current[idx] = el)}
                className="admin-login__otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              />
            ))}
          </div>
          <p className="admin-login__hint">Enter the 6-digit code from your authenticator app.</p>
        </div>

        {error && <div className="admin-login__error">{error}</div>}

        <button type="submit" className="admin-login__submit" disabled={loading}>
          {loading ? "Verifying…" : "Login"}
        </button>
      </form>

      <div className="admin-login__footer">
        <p>Authorized Personnel Only.</p>
        <p>© 2026 EventHub360 Enterprise. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AdminLogin;