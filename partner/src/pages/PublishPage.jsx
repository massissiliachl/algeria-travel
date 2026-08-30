import React from 'react';
import { useHotelFormContext } from '../context/HotelFormContext';
import { Field, PageHeader, PublishedBadge } from '../components/ui';

export default function PublishPage() {
  const { form, saving, error, success, onChange, save } = useHotelFormContext();

  const togglePublish = async (published) => {
    onChange('published', published);
    await save({ published });
  };

  return (
    <>
      <PageHeader title="Publication" subtitle="Rendez votre hôtel visible sur algeriatravel.com/hotels." />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="panel partner-publish">
        <div className="partner-publish__status">
          <PublishedBadge published={form.published} />
          <p>
            {form.published
              ? 'Votre établissement est visible par les voyageurs.'
              : 'Votre établissement est en brouillon — invisible sur le site.'}
          </p>
        </div>

        <ul className="partner-publish__checklist">
          <li className={form.name ? 'ok' : ''}>Nom de l’hôtel renseigné</li>
          <li className={form.price ? 'ok' : ''}>Prix par nuit défini</li>
          <li className={form.image ? 'ok' : ''}>Photo principale ajoutée</li>
          <li className={form.location ? 'ok' : ''}>Ville / localisation</li>
        </ul>

        <div className="partner-publish__actions">
          {!form.published ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={saving || !form.name || !form.price}
              onClick={() => togglePublish(true)}
            >
              {saving ? 'Publication…' : 'Publier sur le site'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => togglePublish(false)}
            >
              {saving ? '…' : 'Retirer du site (brouillon)'}
            </button>
          )}
        </div>

        <Field
          label="Équipements (JSON avancé)"
          className="full"
          hint='{"fr":["Wifi","Piscine"],"en":["Wifi","Pool"],"ar":["واي فاي"]}'
        >
          <textarea
            rows={5}
            value={form.amenities}
            onChange={(e) => onChange('amenities', e.target.value)}
          />
        </Field>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => save()}
          >
            Enregistrer les équipements
          </button>
        </div>
      </div>
    </>
  );
}
