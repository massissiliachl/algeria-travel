import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { FORM_CONFIGS, WILAYA_OPTIONS } from '../config/entities';
import { Field, PageHeader, parseJsonField, stringifyJson } from '../components/ui';
import ImageField from '../components/ImageField';
import GalleryField from '../components/GalleryField';
import HotelPartnerPanel from '../components/HotelPartnerPanel';
import { buildPublicContentUrl } from '../utils/publicSiteUrl';

function buildInitial(config) {
  const initial = {};
  config.sections.forEach((s) =>
    s.fields.forEach((f) => {
      if (f.type === 'checkbox') initial[f.name] = f.name === 'published';
      else if (f.type === 'gallery') initial[f.name] = '[]';
      else if (f.type === 'json') initial[f.name] = f.name === 'filters' || f.name === 'places' || f.name === 'included' || f.name === 'activities' || f.name === 'itinerary' || f.name === 'includes' || f.name === 'highlights' ? '[]' : '{}';
      else if (f.name === 'rating') initial[f.name] = '4.5';
      else initial[f.name] = '';
    })
  );
  if (config.resource === 'stays') initial.type = 'hotel';
  if (config.resource === 'hotels') {
    initial.type = 'hotel';
    initial.availability = 'available';
    initial.stars = 3;
    initial.checkIn = '14:00';
    initial.checkOut = '12:00';
    initial.amenities = '{"fr":[],"en":[],"ar":[]}';
  }
  return initial;
}

function normalizeSlugId(value) {
  if (value == null || value === '') return value;
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

function preparePayload(form, config) {
  const payload = { ...form };
  config.sections.forEach((s) =>
    s.fields.forEach((f) => {
      if (f.type === 'gallery') {
        payload[f.name] = parseJsonField(form[f.name], []);
      } else if (f.type === 'json') {
        payload[f.name] = parseJsonField(form[f.name], f.name === 'amenities' || f.name === 'tags' ? {} : []);
      }
      if (f.type === 'number' && payload[f.name] !== '') {
        let n = Number(payload[f.name]);
        if (f.name === 'rating' && Number.isFinite(n)) {
          n = Math.min(f.max ?? 5, Math.max(f.min ?? 0, Math.round(n * 10) / 10));
        }
        payload[f.name] = n;
      }
      if (f.type === 'checkbox') {
        payload[f.name] = Boolean(form[f.name]);
      }
    })
  );
  if (payload.id != null && typeof payload.id === 'string') {
    payload.id = normalizeSlugId(payload.id);
  }
  if (payload.slug != null && typeof payload.slug === 'string') {
    payload.slug = normalizeSlugId(payload.slug);
  }
  return payload;
}

export default function EntityEditPage() {
  const { entityKey, id } = useParams();
  const isNew = id === 'new';
  const config = FORM_CONFIGS[entityKey];
  const navigate = useNavigate();

  const [form, setForm] = useState(() => (config ? buildInitial(config) : {}));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config || isNew) return;
    setLoading(true);
    api
      .get(config.resource, id)
      .then((data) => {
        const next = { ...data };
        config.sections.forEach((s) =>
          s.fields.forEach((f) => {
            if (f.type === 'json' || f.type === 'gallery') next[f.name] = stringifyJson(data[f.name]);
            if (f.type === 'checkbox') next[f.name] = Boolean(data[f.name]);
            if (f.type === 'number' && data[f.name] != null) next[f.name] = data[f.name];
          })
        );
        setForm(next);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [config, entityKey, id, isNew]);

  if (!config) return <div className="alert alert-error">Formulaire inconnu.</div>;
  if (loading) return <p>Chargement…</p>;

  const onChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    setLiveUrl('');
    try {
      const payload = preparePayload(form, config);
      if ((config.resource === 'places' || config.resource === 'activities') && isNew && !payload.id) {
        throw new Error('ID invalide — utilisez un slug sans espaces (ex: bejaia, mon-lieu).');
      }
      if (config.resource === 'hotels') {
        payload.type = 'hotel';
        if (payload.wilayaKey && !payload.wilaya) {
          const w = WILAYA_OPTIONS.find((x) => x.key === payload.wilayaKey);
          if (w) payload.wilaya = w.code;
        }
        if (payload.wilayaKey && !payload.placeId) {
          payload.placeId = payload.wilayaKey;
        }
      }
      const publicUrl = buildPublicContentUrl(entityKey, payload, id);
      if (isNew) {
        await api.create(config.resource, payload);
        if (payload.published && publicUrl) {
          setSuccess('Publié sur le site — visible immédiatement (rafraîchissez la page visiteur).');
          setLiveUrl(publicUrl);
        } else {
          setSuccess('Créé. Cochez « Publié » pour l’afficher sur le site.');
        }
        setTimeout(() => navigate(`/${entityKey}`), publicUrl ? 2500 : 800);
      } else {
        await api.update(config.resource, id, payload);
        if (payload.published && publicUrl) {
          setSuccess('Mis à jour sur le site — visible immédiatement (rafraîchissez la page visiteur).');
          setLiveUrl(publicUrl);
        } else if (payload.published) {
          setSuccess('Enregistré et publié.');
        } else {
          setSuccess('Enregistré en brouillon (non visible sur le site).');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-page">
      <PageHeader
        title={isNew ? `Nouveau — ${config.title}` : `Modifier — ${config.title}`}
        action={
          <Link to={`/${entityKey}`} className="btn btn-secondary">
            ← Retour
          </Link>
        }
      />

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">
          <p>{success}</p>
          {liveUrl && (
            <p style={{ marginTop: 8, marginBottom: 0 }}>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                Voir sur le site en ligne →
              </a>
            </p>
          )}
        </div>
      )}

      {entityKey === 'hotels' && !isNew && id && (
        <HotelPartnerPanel hotelId={id} hotelName={form.name || id} />
      )}

      <form className="panel" style={{ padding: 20 }} onSubmit={onSubmit}>
        {config.sections.map((section) => (
          <div key={section.title} className="form-section">
            <h3>{section.title}</h3>
            <div className="form-grid">
              {section.fields.map((f) => (
                <Field key={f.name} label={f.label} className={f.full ? 'full' : ''}>
                  {f.type === 'image' ? (
                    <ImageField
                      value={form[f.name] ?? ''}
                      onChange={(url) => onChange(f.name, url)}
                      required={f.required}
                    />
                  ) : f.type === 'gallery' ? (
                    <GalleryField value={form[f.name] ?? '[]'} onChange={(val) => onChange(f.name, val)} />
                  ) : f.type === 'textarea' || f.type === 'json' ? (
                    <textarea
                      rows={f.type === 'json' ? 6 : 4}
                      value={form[f.name] ?? ''}
                      onChange={(e) => onChange(f.name, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === 'select' ? (
                    <select value={form[f.name] ?? ''} onChange={(e) => onChange(f.name, e.target.value)}>
                      {!f.required && <option value="">—</option>}
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {f.optionLabels?.[o] || o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={Boolean(form[f.name])}
                      onChange={(e) => onChange(f.name, e.target.checked)}
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={form[f.name] ?? ''}
                      onChange={(e) => onChange(f.name, e.target.value)}
                      required={f.required}
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      disabled={!isNew && f.name === 'id' && config.resource !== 'tours'}
                    />
                  )}
                </Field>
              ))}
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : isNew ? 'Créer' : 'Enregistrer'}
          </button>
          <Link to={`/${entityKey}`} className="btn btn-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
