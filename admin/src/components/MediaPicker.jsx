import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function MediaPicker({ open, onClose, onSelect, multiple = false, selected = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setPicked(Array.isArray(selected) ? [...selected] : selected ? [selected] : []);
    setError('');
    setLoading(true);
    api
      .listMedia()
      .then((data) => setItems(data.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, selected]);

  if (!open) return null;

  const togglePick = (url) => {
    if (multiple) {
      setPicked((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
      return;
    }
    onSelect(url);
    onClose();
  };

  const onUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const uploaded = await api.uploadFile(file);
        setItems((prev) => [{ url: uploaded.url, name: uploaded.name, source: 'upload' }, ...prev]);
        if (multiple) {
          setPicked((prev) => [...prev, uploaded.url]);
        } else {
          onSelect(uploaded.url);
          onClose();
          break;
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const confirmMultiple = () => {
    onSelect(picked);
    onClose();
  };

  return (
    <div className="media-picker-backdrop" onClick={onClose} role="presentation">
      <div className="media-picker" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="media-picker__header">
          <h3>{multiple ? 'Choisir des images' : 'Choisir une image'}</h3>
          <button type="button" className="media-picker__close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="media-picker__toolbar">
          <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Envoi…' : 'Importer un fichier'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple={multiple} hidden onChange={onUpload} />
          {multiple && (
            <button type="button" className="btn btn-secondary" onClick={confirmMultiple} disabled={!picked.length}>
              Ajouter la sélection ({picked.length})
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <p className="media-picker__empty">Chargement de la galerie…</p>
        ) : items.length === 0 ? (
          <p className="media-picker__empty">Aucune image. Importez un fichier pour commencer.</p>
        ) : (
          <div className="media-picker__grid">
            {items.map((item) => {
              const active = picked.includes(item.url);
              return (
                <button
                  key={item.url}
                  type="button"
                  className={`media-picker__item${active ? ' is-active' : ''}`}
                  onClick={() => togglePick(item.url)}
                  title={item.url}
                >
                  <img src={resolveMediaUrl(item.url)} alt={item.name || item.url} loading="lazy" />
                  <span className="media-picker__item-label">{item.name || item.url}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
