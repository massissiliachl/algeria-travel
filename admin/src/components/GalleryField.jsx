import React, { useMemo, useRef, useState } from 'react';
import { api } from '../api';
import { resolveMediaUrl } from '../utils/mediaUrl';
import MediaPicker from './MediaPicker';

function parseGalleryValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export default function GalleryField({ value, onChange }) {
  const items = useMemo(() => parseGalleryValue(value), [value]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef(null);

  const updateItems = (next) => onChange(JSON.stringify(next, null, 2));

  const onUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await api.uploadFile(file);
        uploaded.push(result.url);
      }
      updateItems([...items, ...uploaded]);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeAt = (index) => updateItems(items.filter((_, i) => i !== index));

  const move = (index, direction) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateItems(next);
  };

  return (
    <div className="gallery-field">
      <div className="gallery-field__actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Envoi…' : 'Importer des fichiers'}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPickerOpen(true)}>
          Choisir dans la galerie
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onUpload} />

      {error && <p className="image-field__error">{error}</p>}

      {items.length === 0 ? (
        <p className="gallery-field__empty">Aucune photo dans la galerie.</p>
      ) : (
        <ul className="gallery-field__list">
          {items.map((url, index) => (
            <li key={`${url}-${index}`} className="gallery-field__item">
              <img src={resolveMediaUrl(url)} alt="" loading="lazy" />
              <div className="gallery-field__item-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => move(index, -1)} disabled={index === 0}>
                  ↑
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                  ↓
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => removeAt(index)}>
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        selected={items}
        onSelect={(urls) => {
          const merged = [...items];
          urls.forEach((url) => {
            if (!merged.includes(url)) merged.push(url);
          });
          updateItems(merged);
        }}
      />
    </div>
  );
}
