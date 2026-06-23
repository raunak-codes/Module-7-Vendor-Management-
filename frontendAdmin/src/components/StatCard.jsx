import './StatCard.css';

/* FIXED: AdminVendorDirectory, AdminPurchaseOrderManagement and
 * AdminInvoiceManagement all call this component with a different prop
 * vocabulary (helperText, accentColor, trend, trendDirection, badge) than
 * the one originally implemented here (subValue, subValueType, accentLeft).
 * Both conventions are now supported so every page's stat cards render
 * with the correct sub-text and accent color instead of silently dropping
 * those props. */
export default function StatCard({
  label,
  value,
  subValue,
  subValueType = 'default', // 'success' | 'error' | 'warning' | 'default'
  icon,
  accentLeft = false,
  accentColor,
  helperText,
  trend,
  trendDirection, // 'up' | 'down'
  badge,
  children,
}) {
  const resolvedSub = subValue ?? trend ?? helperText ?? badge;
  const resolvedSubType =
    subValue != null
      ? subValueType
      : trendDirection === 'up'
        ? 'success'
        : trendDirection === 'down'
          ? 'error'
          : badge
            ? 'warning'
            : 'default';

  return (
    <div
      className={`stat-card premium-card${accentLeft || accentColor ? ' stat-card--accent-left' : ''}`}
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      <p className="stat-card__label font-label-sm">{label}</p>
      <div className="stat-card__bottom">
        <span className="stat-card__value font-display-lg">{value}</span>
        {resolvedSub && (
          <span className={`stat-card__sub font-body-md stat-card__sub--${resolvedSubType}`}>
            {resolvedSub}
          </span>
        )}
        {icon && (
          <span className="material-symbols-outlined stat-card__icon">{icon}</span>
        )}
        {children}
      </div>
    </div>
  );
}
