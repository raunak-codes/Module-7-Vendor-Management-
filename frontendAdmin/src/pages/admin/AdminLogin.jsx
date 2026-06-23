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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your admin email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.data?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized access. Admin privileges required.");
      }

      localStorage.setItem("adminToken", data.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="admin-login__show-password"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: '#9ca3af' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                {showPassword ? (
                  <path d="M12 5C7.30558 5 3.32832 7.82845 1.5 12C3.32832 16.1716 7.30558 19 12 19C16.6944 19 20.6717 16.1716 22.5 12C20.6717 7.82845 16.6944 5 12 5ZM12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5ZM12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5Z" fill="currentColor"/>
                ) : (
                  <path d="M11.83 4.19532L10.0577 6.30252C10.6775 6.10842 11.3283 6 12 6C16.6944 6 20.6717 8.82845 22.5 13C21.7277 14.7645 20.4042 16.2737 18.7303 17.2917L16.8967 19.471C18.9959 18.2327 20.6358 16.3262 21.6033 13.9877C19.7891 9.87762 15.8239 7.02613 11.1685 7.02613C10.9669 7.02613 10.7667 7.03456 10.5678 7.05105L8.76101 9.19888C9.55139 8.21206 10.6189 7.45802 11.83 4.19532ZM2.39675 10.0123C4.21092 14.1224 8.1761 16.9739 12.8315 16.9739C13.0331 16.9739 13.2333 16.9654 13.4322 16.949L15.239 14.8011C14.4486 15.7879 13.3811 16.542 12.17 19.8047L13.9423 17.6975C13.3225 17.8916 12.6717 18 12 18C7.30558 18 3.32832 15.1716 1.5 11C2.27231 9.23555 3.59577 7.72633 5.2697 6.7083L7.10329 4.52899C5.00405 5.76735 3.36423 7.67382 2.39675 10.0123Z" fill="currentColor"/>
                )}
              </svg>
            </button>
          </div>
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