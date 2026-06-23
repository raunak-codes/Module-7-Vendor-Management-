import { useNavigate } from "react-router-dom";
import "./admin-tokens.css";
import "./AdminLogout.css";

const MOCK_NAV = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "storefront", label: "Vendors" },
  { icon: "verified_user", label: "KYC" },
  { icon: "description", label: "Invoices" },
];

/**
 * Logout confirmation screen. Renders a dimmed/blurred mock of the admin
 * shell behind a centered confirmation modal.
 * "Cancel" returns to the previous screen; "Logout" clears the session
 * and redirects to the admin login screen.
 *
 * Rebuilt on the shared admin-tokens.css variables and .admin-btn classes
 * (same ones AdminSettings/AdminWorkOrderDetails/etc. use for their
 * confirm/cancel actions) instead of one-off utility classes, so the
 * buttons are solid brand colors and spacing matches the rest of the app.
 */
export default function AdminLogout() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin-logout-page">
      {/* Mock Background UI (the dashboard the admin is leaving) */}
      <div className="admin-logout-page__mock">
        <aside className="admin-logout-page__mock-sidebar">
          <div className="admin-logout-page__mock-logo">EventHub360</div>
          <nav className="admin-logout-page__mock-nav">
            {MOCK_NAV.map((item) => (
              <div key={item.label} className="admin-logout-page__mock-nav-item">
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
        </aside>
        <main className="admin-logout-page__mock-main">
          <div className="admin-logout-page__mock-header">
            <div className="admin-logout-page__mock-block admin-logout-page__mock-block--title" />
            <div className="admin-logout-page__mock-block admin-logout-page__mock-block--search" />
          </div>
          <div className="admin-logout-page__mock-grid">
            <div className="admin-logout-page__mock-card" />
            <div className="admin-logout-page__mock-card" />
            <div className="admin-logout-page__mock-card" />
            <div className="admin-logout-page__mock-card admin-logout-page__mock-card--wide" />
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      <div className="admin-logout-page__overlay">
        <div className="admin-logout-page__modal">
          {/* Modal Header / Decorative Area */}
          <div className="admin-logout-page__modal-header">
            <div className="admin-logout-page__modal-pattern" />
            <div className="admin-logout-page__icon-circle">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 500" }}>
                logout
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="admin-logout-page__body">
            <h2 className="admin-logout-page__title">Confirm Logout</h2>
            <p className="admin-logout-page__message">
              Are you sure you want to logout from the{" "}
              <span className="admin-logout-page__highlight">EventHub360</span> Admin Portal?
            </p>
            <p className="admin-logout-page__version">System Version 2.4.0-Enterprise</p>
          </div>

          {/* Action Buttons */}
          <div className="admin-logout-page__actions">
            <button
              type="button"
              onClick={handleCancel}
              className="admin-btn admin-btn--outline admin-logout-page__btn"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-btn admin-btn--danger admin-logout-page__btn"
            >
              Logout
            </button>
          </div>

          {/* Sub-footer Info */}
          <div className="admin-logout-page__footer">
            <span className="material-symbols-outlined">security</span>
            <span>Your session will be securely terminated</span>
          </div>
        </div>
      </div>
    </div>
  );
}