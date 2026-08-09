import React, { useEffect } from 'react';
import Icon from './Icon';

const BottomSheet = ({
  open,
  onClose,
  children,
  titleId,
  ariaLabel,
  className = '',
  panelClassName = '',
}) => {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`bottom-sheet ${className}`.trim()}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`bottom-sheet__panel ${panelClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={ariaLabel}
      >
        <button
          type="button"
          className="bottom-sheet__close"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="X" size={18} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
