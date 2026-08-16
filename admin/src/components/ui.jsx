import React from 'react';

export function StatusBadge({ status }) {
  const label = {
    pending: 'En attente',
    reviewed: 'Examinée',
    confirmed: 'Confirmée',
    rejected: 'Refusée',
    cancelled: 'Annulée',
  }[status] || status;

  return <span className={`badge badge-${status}`}>{label}</span>;
}

export function PublishedBadge({ published }) {
  return (
    <span className={`badge ${published ? 'badge-published' : 'badge-draft'}`}>
      {published ? 'Publié' : 'Brouillon'}
    </span>
  );
}

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

export function Field({ label, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && <label>{label}</label>}
      {children}
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
