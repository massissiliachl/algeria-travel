import React, { forwardRef } from 'react';

/** Champ piège anti-spam — non contrôlé pour éviter l'autofill navigateur. */
const HoneypotField = forwardRef(function HoneypotField({ className = '' }, ref) {
  return (
    <input
      ref={ref}
      type="text"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className={className}
      defaultValue=""
      readOnly
      onFocus={(e) => e.currentTarget.removeAttribute('readOnly')}
    />
  );
});

export default HoneypotField;
