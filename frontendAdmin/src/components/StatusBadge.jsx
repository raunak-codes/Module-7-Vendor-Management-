import './StatusBadge.css';

/* FIXED: pages across the app use 20+ distinct status strings (completed,
 * flagged, on hold, under review, overdue, sent, accepted, approved,
 * matching, manual check, and capitalized variants like "Paid"/"Failed"),
 * but only 9 keys were defined here and the lookup was case-sensitive -
 * most statuses fell back to the same generic pending/orange color and
 * capitalized ones never matched at all. Expanded to cover every status
 * string used in the codebase, normalized to lowercase before lookup. */
const STATUS_CONFIG = {
  success: {
    bg: 'var(--color-tertiary-fixed)',
    color: 'var(--color-on-tertiary-fixed)',
    dot: 'var(--color-tertiary)',
  },
  completed: {
    bg: 'var(--color-tertiary-fixed)',
    color: 'var(--color-on-tertiary-fixed)',
    dot: 'var(--color-tertiary)',
  },
  accepted: {
    bg: 'var(--color-tertiary-fixed)',
    color: 'var(--color-on-tertiary-fixed)',
    dot: 'var(--color-tertiary)',
  },
  approved: {
    bg: 'var(--color-tertiary-fixed)',
    color: 'var(--color-on-tertiary-fixed)',
    dot: 'var(--color-tertiary)',
  },
  verified: {
    bg: 'rgba(0, 77, 51, 0.1)',
    color: 'var(--color-tertiary)',
    dot: 'var(--color-tertiary)',
  },
  paid: {
    bg: 'rgba(0, 77, 51, 0.1)',
    color: 'var(--color-tertiary)',
    dot: 'var(--color-tertiary)',
  },
  ok: {
    bg: 'rgba(0, 77, 51, 0.1)',
    color: 'var(--color-tertiary)',
    dot: 'var(--color-tertiary)',
  },

  pending: {
    bg: 'var(--color-secondary-fixed)',
    color: 'var(--color-on-secondary-fixed)',
    dot: 'var(--color-secondary)',
  },
  draft: {
    bg: 'var(--color-secondary-container)',
    color: 'var(--color-primary)',
    dot: 'var(--color-secondary)',
  },
  sent: {
    bg: 'var(--color-secondary-fixed)',
    color: 'var(--color-on-secondary-fixed)',
    dot: 'var(--color-secondary)',
  },
  'under review': {
    bg: 'var(--color-secondary-fixed)',
    color: 'var(--color-on-secondary-fixed)',
    dot: 'var(--color-secondary)',
  },
  matching: {
    bg: 'var(--color-secondary-fixed)',
    color: 'var(--color-on-secondary-fixed)',
    dot: 'var(--color-secondary)',
  },
  'manual check': {
    bg: 'var(--color-secondary-fixed)',
    color: 'var(--color-on-secondary-fixed)',
    dot: 'var(--color-secondary)',
  },
  'on hold': {
    bg: 'var(--color-secondary-fixed)',
    color: 'var(--color-on-secondary-fixed)',
    dot: 'var(--color-secondary)',
  },

  action: {
    bg: 'var(--color-primary-fixed)',
    color: 'var(--color-on-primary-fixed)',
    dot: 'var(--color-primary)',
  },
  'in progress': {
    bg: 'rgba(214, 224, 241, 0.8)',
    color: 'var(--color-on-secondary-fixed-variant)',
    dot: 'var(--color-secondary)',
  },
  'in-progress': {
    bg: 'rgba(214, 224, 241, 0.8)',
    color: 'var(--color-on-secondary-fixed-variant)',
    dot: 'var(--color-secondary)',
  },
  new: {
    bg: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
    dot: 'var(--color-error)',
  },

  error: {
    bg: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
    dot: 'var(--color-error)',
  },
  flagged: {
    bg: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
    dot: 'var(--color-error)',
  },
  failed: {
    bg: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
    dot: 'var(--color-error)',
  },
  overdue: {
    bg: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
    dot: 'var(--color-error)',
  },
  expired: {
    bg: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
    dot: 'var(--color-error)',
  },
};

export default function StatusBadge({ status, label }) {
  const key = (status || '').toLowerCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
  const displayLabel = label || status;

  return (
    <span
      className="status-badge font-label-sm"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      <span
        className="status-badge__dot"
        style={{ backgroundColor: config.dot }}
      />
      {displayLabel}
    </span>
  );
}
