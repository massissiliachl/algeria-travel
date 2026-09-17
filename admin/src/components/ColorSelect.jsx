import React, { useMemo } from 'react';

export default function ColorSelect({ value, onChange, options }) {
  const mergedOptions = useMemo(() => {
    const list = [...options];
    if (value && !list.some((o) => o.value === value)) {
      list.unshift({ value, label: `Couleur actuelle (${value})` });
    }
    return list;
  }, [options, value]);

  return (
    <div className="color-select">
      <span
        className="color-select__swatch"
        style={{ backgroundColor: value || 'transparent' }}
        aria-hidden="true"
      />
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Choisir une couleur —</option>
        {mergedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
