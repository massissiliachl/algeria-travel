import React from 'react';
import { useHotelFormContext } from '../context/HotelFormContext';
import { Field, PageHeader } from '../components/ui';

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'limited', label: 'Places limitées' },
  { value: 'unavailable', label: 'Complet' },
];

export default function PricingPage() {
  const { form, saving, error, success, onChange, save } = useHotelFormContext();

  const onSubmit = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <PageHeader title="Tarifs & disponibilité" subtitle="Prix par nuit, stock de chambres et horaires." />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="panel partner-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <Field label="Prix / nuit (DA)" className="full">
            <input type="number" min={0} value={form.price} onChange={(e) => onChange('price', e.target.value)} required />
          </Field>
          <Field label="Ancien prix promo (DA)">
            <input type="number" min={0} value={form.oldPrice} onChange={(e) => onChange('oldPrice', e.target.value)} />
          </Field>
          <Field label="Statut global">
            <select value={form.availability} onChange={(e) => onChange('availability', e.target.value)}>
              {AVAILABILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Chambres (stock par défaut)">
            <input type="number" min={0} value={form.roomsAvailable} onChange={(e) => onChange('roomsAvailable', e.target.value)} />
          </Field>
          <Field label="Heure d’arrivée">
            <input value={form.checkIn} onChange={(e) => onChange('checkIn', e.target.value)} placeholder="14:00" />
          </Field>
          <Field label="Heure de départ">
            <input value={form.checkOut} onChange={(e) => onChange('checkOut', e.target.value)} placeholder="12:00" />
          </Field>
        </div>
        <p className="field-hint">
          Pour un planning précis par date, utilisez la section <strong>Chambres</strong>.
        </p>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les tarifs'}
          </button>
        </div>
      </form>
    </>
  );
}
