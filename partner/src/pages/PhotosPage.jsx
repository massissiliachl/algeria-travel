import React from 'react';
import ImageField from '../components/ImageField';
import GalleryField from '../components/GalleryField';
import { useHotelFormContext } from '../context/HotelFormContext';
import { Field, PageHeader } from '../components/ui';

export default function PhotosPage() {
  const { form, saving, error, success, onChange, save } = useHotelFormContext();

  const onSubmit = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <PageHeader title="Photos" subtitle="Photo principale et galerie affichées sur votre fiche hôtel." />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="panel partner-form" onSubmit={onSubmit}>
        <Field label="Photo principale" className="full">
          <ImageField value={form.image} onChange={(url) => onChange('image', url)} />
        </Field>
        <Field label="Galerie photos" className="full">
          <GalleryField value={form.gallery} onChange={(val) => onChange('gallery', val)} />
        </Field>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les photos'}
          </button>
        </div>
      </form>
    </>
  );
}
