import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const vendorNavItems = [
  { to: '/vendor/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/vendor/purchase-orders', icon: 'receipt_long', label: 'Purchase Orders' },
  { to: '/vendor/work-orders', icon: 'engineering', label: 'Work Orders' },
  { to: '/vendor/finance', icon: 'payments', label: 'Finance' },
  { to: '/vendor/profile', icon: 'account_circle', label: 'Profile' },
  { to: '/vendor/ratings', icon: 'star', label: 'Ratings & Reviews' },
  { to: '/vendor/notifications', icon: 'notifications', label: 'Notifications' },
];

/* Admin nav labels per spec:
 * Vendor Allocation -> Allocations
 * KYC Verification  -> KYC
 * Audit Logs        -> Logs
 * Settings added.
 */
const adminNavItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/vendors', icon: 'storefront', label: 'Vendor Directory' },
  { to: '/admin/vendor-allocation', icon: 'assignment_ind', label: 'Allocations' },
  { to: '/admin/purchase-orders', icon: 'receipt_long', label: 'Purchase Orders' },
  { to: '/admin/work-orders', icon: 'engineering', label: 'Work Orders' },
  { to: '/admin/payments', icon: 'payments', label: 'Payments' },
  { to: '/admin/invoices', icon: 'description', label: 'Invoices' },
  { to: '/admin/kyc', icon: 'verified_user', label: 'KYC' },
  { to: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
  { to: '/admin/audit-logs', icon: 'history', label: 'Logs' },
  { to: '/admin/notifications', icon: 'notifications', label: 'Notifications' },
  { to: '/admin/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar({ variant = 'vendor' }) {
  const isAdmin = variant === 'admin';
  const navItems = isAdmin ? adminNavItems : vendorNavItems;
  const logoutPath = isAdmin ? '/admin/logout' : '/vendor/logout';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <h1 className="sidebar__brand-name">EventHub360</h1>
        <p className="sidebar__brand-tagline font-label-sm">
          {isAdmin ? 'Enterprise Portal' : 'Premium Concierge'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__nav-item font-body-md${isActive ? ' sidebar__nav-item--active' : ''}`
            }
          >
            <span className="material-symbols-outlined sidebar__nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer - logout only */}
      <div className="sidebar__footer">
        <NavLink
          to={logoutPath}
          className={({ isActive }) =>
            `sidebar__footer-link sidebar__footer-link--logout font-body-md${isActive ? ' sidebar__nav-item--active' : ''}`
          }
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}
