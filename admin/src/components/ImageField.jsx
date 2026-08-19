import React, { useRef, useState } from 'react';
import { api } from '../api';
import { resolveMediaUrl } from '../utils/mediaUrl';
import MediaPicker from './MediaPicker';

export default function ImageField({ value, onChange, required = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef(null);

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const uploaded = await api.uploadFile(file);
      onChange(uploaded.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="image-field">
      {value ? (
        <div className="image-field__preview">
          <img src={resolveMediaUrl(value)} alt="Aperçu" />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange('')}>
            Retirer
          </button>
        </div>
      ) : (
        <div className="image-field__placeholder">Aucune image sélectionnée</div>
      )}

      <div className="image-field__actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Envoi…' : 'Importer un fichier'}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPickerOpen(true)}>
          Choisir dans la galerie
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} required={required && !value} />

      {error && <p className="image-field__error">{error}</p>}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        selected={value}
      />
    </div>
  );
}
