import React from 'react';
import { useHotelFormContext } from '../context/HotelFormContext';
import { Field, PageHeader } from '../components/ui';

export default function ProfilePage() {
  const { form, saving, error, success, onChange, save } = useHotelFormContext();

  const onSubmit = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <PageHeader title="Informations hôtel" subtitle="Identité, localisation et description de votre établissement." />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="panel partner-form" onSubmit={onSubmit}>
        <section className="form-section">
          <h3>Identité</h3>
          <div className="form-grid">
            <Field label="Nom (FR)" className="full">
              <input value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
            </Field>
            <Field label="Nom (EN)">
              <input value={form.nameEn} onChange={(e) => onChange('nameEn', e.target.value)} />
            </Field>
            <Field label="Nom (AR)">
              <input value={form.nameAr} onChange={(e) => onChange('nameAr', e.target.value)} />
            </Field>
            <Field label="Étoiles">
              <input type="number" min={1} max={5} value={form.stars} onChange={(e) => onChange('stars', e.target.value)} />
            </Field>
            <Field label="Note (0-5)">
              <input type="number" step="0.1" min={0} max={5} value={form.rating} onChange={(e) => onChange('rating', e.target.value)} />
            </Field>
            <Field label="Téléphone">
              <input value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="form-section">
          <h3>Localisation</h3>
          <div className="form-grid">
            <Field label="Ville (FR)">
              <input value={form.location} onChange={(e) => onChange('location', e.target.value)} />
            </Field>
            <Field label="Ville (EN)">
              <input value={form.locationEn} onChange={(e) => onChange('locationEn', e.target.value)} />
            </Field>
            <Field label="Ville (AR)">
              <input value={form.locationAr} onChange={(e) => onChange('locationAr', e.target.value)} />
            </Field>
            <Field label="Adresse (FR)" className="full">
              <input value={form.address} onChange={(e) => onChange('address', e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="form-section">
          <h3>Description</h3>
          <div className="form-grid">
            <Field label="Description (FR)" className="full">
              <textarea rows={4} value={form.desc} onChange={(e) => onChange('desc', e.target.value)} />
            </Field>
            <Field label="Description (EN)" className="full">
              <textarea rows={3} value={form.descEn} onChange={(e) => onChange('descEn', e.target.value)} />
            </Field>
            <Field label="Description (AR)" className="full">
              <textarea rows={3} value={form.descAr} onChange={(e) => onChange('descAr', e.target.value)} />
            </Field>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </>
  );
}
