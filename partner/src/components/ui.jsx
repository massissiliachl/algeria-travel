import React from 'react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="admin-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, className = '', hint }) {
  return (
    <div className={`field ${className}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

export function parseJsonField(value, fallback) {
  if (!value?.trim()) return fallback;
  return JSON.parse(value);
}

export function stringifyJson(value) {
  if (value == null) return '';
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

export function PublishedBadge({ published }) {
  return (
    <span className={`badge ${published ? 'badge-published' : 'badge-draft'}`}>
      {published ? 'Publié sur le site' : 'Brouillon'}
    </span>
  );
}
