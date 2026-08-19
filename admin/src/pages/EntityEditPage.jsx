import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { FORM_CONFIGS } from '../config/entities';
import { Field, PageHeader, parseJsonField, stringifyJson } from '../components/ui';
import ImageField from '../components/ImageField';
import GalleryField from '../components/GalleryField';

function buildInitial(config) {
  const initial = {};
  config.sections.forEach((s) =>
    s.fields.forEach((f) => {
      if (f.type === 'checkbox') initial[f.name] = f.name === 'published';
      else if (f.type === 'gallery') initial[f.name] = '[]';
      else if (f.type === 'json') initial[f.name] = f.name === 'filters' || f.name === 'places' || f.name === 'included' || f.name === 'activities' || f.name === 'itinerary' || f.name === 'includes' || f.name === 'highlights' ? '[]' : '{}';
      else initial[f.name] = '';
    })
  );
  if (config.resource === 'stays') initial.type = 'hotel';
  return initial;
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
        payload[f.name] = Number(payload[f.name]);
      }
      if (f.type === 'checkbox') {
        payload[f.name] = Boolean(form[f.name]);
      }
    })
  );
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
    try {
      const payload = preparePayload(form, config);
      if (isNew) {
        await api.create(config.resource, payload);
        setSuccess('Créé avec succès.');
        setTimeout(() => navigate(`/${entityKey}`), 800);
      } else {
        await api.update(config.resource, id, payload);
        setSuccess('Enregistré.');
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
      {success && <div className="alert alert-success">{success}</div>}

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
                      {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
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
