import './PageHeader.css';

/* FIXED: 9 pages call this component with an `actions` prop (not
 * children), and 5 pages also pass a `breadcrumb` array - neither was
 * previously supported, so every page header action button/breadcrumb
 * trail in the app was being silently dropped. */
export default function PageHeader({ title, subtitle, breadcrumb, actions, children }) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="page-header__breadcrumb font-body-md">
            {breadcrumb.map((b, i) => (
              <span key={i} className="page-header__breadcrumb-item">
                {b.label}
                {i < breadcrumb.length - 1 && (
                  <span className="page-header__breadcrumb-sep">/</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h2 className="page-header__title font-display-lg">{title}</h2>
        {subtitle && (
          <p className="page-header__subtitle font-body-lg">{subtitle}</p>
        )}
      </div>
      {(actions || children) && (
        <div className="page-header__actions">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
