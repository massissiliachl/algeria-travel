import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { FORM_CONFIGS, WILAYA_OPTIONS } from '../config/entities';
import { Field, parseJsonField, stringifyJson } from '../components/ui';
import ImageField from '../components/ImageField';
import GalleryField from '../components/GalleryField';
import HotelPartnerPanel from '../components/HotelPartnerPanel';
import HotelRoomsTab from '../components/hotel/HotelRoomsTab';

const TABS = [
  { id: 'general', label: 'Informations générales' },
  { id: 'rooms', label: 'Chambres & tarifs' },
  { id: 'location', label: 'Localisation' },
  { id: 'amenities', label: 'Équipements' },
  { id: 'photos', label: 'Photos' },
];

function buildInitial() {
  return {
    id: '',
    wilayaKey: '',
    wilaya: '',
    name: '',
    nameEn: '',
    nameAr: '',
    stars: 3,
    availability: 'available',
    roomsAvailable: '',
    published: false,
    price: '',
    oldPrice: '',
    rating: '',
    reviews: '',
    checkIn: '14:00',
    checkOut: '12:00',
    location: '',
    locationEn: '',
    locationAr: '',
    address: '',
    addressEn: '',
    addressAr: '',
    phone: '',
    lat: '',
    lng: '',
    placeId: '',
    desc: '',
    descEn: '',
    descAr: '',
    image: '',
    gallery: '[]',
    amenities: '{"fr":[],"en":[],"ar":[]}',
    type: 'hotel',
  };
}

function preparePayload(form) {
  return {
    ...form,
    type: 'hotel',
    gallery: parseJsonField(form.gallery, []),
    amenities: parseJsonField(form.amenities, { fr: [], en: [], ar: [] }),
    price: form.price !== '' ? Number(form.price) : null,
    oldPrice: form.oldPrice !== '' ? Number(form.oldPrice) : null,
    rating: form.rating !== '' ? Number(form.rating) : null,
    reviews: form.reviews !== '' ? Number(form.reviews) : null,
    stars: form.stars !== '' ? Number(form.stars) : null,
    roomsAvailable: form.roomsAvailable !== '' ? Number(form.roomsAvailable) : null,
    lat: form.lat !== '' ? Number(form.lat) : null,
    lng: form.lng !== '' ? Number(form.lng) : null,
    published: Boolean(form.published),
  };
}

export default function HotelEditPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [tab, setTab] = useState('rooms');
  const [form, setForm] = useState(buildInitial);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    api
      .get('hotels', id)
      .then((data) => {
        const next = buildInitial();
        Object.keys(next).forEach((k) => {
          if (data[k] != null) next[k] = data[k];
        });
        next.gallery = stringifyJson(data.gallery);
        next.amenities = stringifyJson(data.amenities);
        next.published = Boolean(data.published);
        setForm(next);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const onChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = preparePayload(form);
      if (payload.wilayaKey && !payload.wilaya) {
        const w = WILAYA_OPTIONS.find((x) => x.key === payload.wilayaKey);
        if (w) payload.wilaya = w.code;
      }
      if (payload.wilayaKey && !payload.placeId) payload.placeId = payload.wilayaKey;

      if (isNew) {
        await api.create('hotels', payload);
        setSuccess('Hôtel créé.');
        setTimeout(() => navigate('/hotels'), 800);
      } else {
        await api.update('hotels', id, payload);
        setSuccess('Enregistré.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="adm-hotel-page">
      <nav className="adm-hotel-breadcrumb">
        <Link to="/hotels">Hôtels</Link>
        <span>›</span>
        <span>{form.name || 'Nouvel hôtel'}</span>
      </nav>

      <header className="adm-hotel-header">
        <div>
          <h1>{form.name || 'Nouvel hôtel'}</h1>
          <span className={`adm-hotel-status${form.published ? ' is-live' : ''}`}>
            {form.published ? 'Actif' : 'Brouillon'}
          </span>
        </div>
        <div className="adm-hotel-header__actions">
          {!isNew && (
            <a
              href={`http://localhost:3000/hotels/${id}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Aperçu public
            </a>
          )}
          <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!isNew && <HotelPartnerPanel hotelId={id} hotelName={form.name || id} />}

      <div className="adm-hotel-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`adm-hotel-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rooms' && !isNew && (
        <HotelRoomsTab
          hotelId={id}
          form={form}
          onRoomsCountChange={(n) => onChange('roomsAvailable', String(n))}
        />
      )}

      {tab === 'rooms' && isNew && (
        <div className="panel" style={{ padding: 20 }}>
          <p>Enregistrez d&apos;abord l&apos;hôtel pour gérer les chambres.</p>
        </div>
      )}

      {(tab === 'general' || tab === 'location' || tab === 'amenities' || tab === 'photos') && (
        <form className="panel adm-hotel-form" onSubmit={onSubmit}>
          {tab === 'general' && (
            <div className="form-grid">
              <Field label="ID (slug)" className="full">
                <input value={form.id} onChange={(e) => onChange('id', e.target.value)} required disabled={!isNew} />
              </Field>
              <Field label="Wilaya">
                <select value={form.wilayaKey} onChange={(e) => onChange('wilayaKey', e.target.value)} required>
                  <option value="">—</option>
                  {WILAYA_OPTIONS.map((w) => (
                    <option key={w.key} value={w.key}>{w.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Nom (FR)">
                <input value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
              </Field>
              <Field label="Étoiles">
                <input type="number" min={1} max={5} value={form.stars} onChange={(e) => onChange('stars', e.target.value)} />
              </Field>
              <Field label="Prix/nuit (DA)">
                <input type="number" value={form.price} onChange={(e) => onChange('price', e.target.value)} />
              </Field>
              <Field label="Chambres totales">
                <input type="number" min={1} value={form.roomsAvailable} onChange={(e) => onChange('roomsAvailable', e.target.value)} />
              </Field>
              <Field label="Publié">
                <input type="checkbox" checked={form.published} onChange={(e) => onChange('published', e.target.checked)} />
              </Field>
              <Field label="Description (FR)" className="full">
                <textarea rows={4} value={form.desc} onChange={(e) => onChange('desc', e.target.value)} />
              </Field>
            </div>
          )}

          {tab === 'location' && (
            <div className="form-grid">
              <Field label="Ville (FR)"><input value={form.location} onChange={(e) => onChange('location', e.target.value)} /></Field>
              <Field label="Téléphone"><input value={form.phone} onChange={(e) => onChange('phone', e.target.value)} /></Field>
              <Field label="Adresse (FR)" className="full"><input value={form.address} onChange={(e) => onChange('address', e.target.value)} /></Field>
              <Field label="Latitude"><input type="number" value={form.lat} onChange={(e) => onChange('lat', e.target.value)} /></Field>
              <Field label="Longitude"><input type="number" value={form.lng} onChange={(e) => onChange('lng', e.target.value)} /></Field>
            </div>
          )}

          {tab === 'amenities' && (
            <Field label="Équipements (JSON)" className="full">
              <textarea rows={8} value={form.amenities} onChange={(e) => onChange('amenities', e.target.value)} />
            </Field>
          )}

          {tab === 'photos' && (
            <div className="form-grid">
              <Field label="Photo principale" className="full">
                <ImageField value={form.image} onChange={(url) => onChange('image', url)} />
              </Field>
              <Field label="Galerie" className="full">
                <GalleryField value={form.gallery} onChange={(val) => onChange('gallery', val)} />
              </Field>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
