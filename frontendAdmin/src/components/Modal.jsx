import { useEffect } from 'react';
import './Modal.css';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box modal-box--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-box__header">
          <h3 className="modal-box__title font-headline-md">{title}</h3>
          <button className="modal-box__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="modal-box__content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-box__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}