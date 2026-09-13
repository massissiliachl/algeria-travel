import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { PageHeader } from '../components/ui';
import { resolveMediaUrl } from '../utils/mediaUrl';

const SOURCE_LABELS = {
  upload: 'Uploads',
  library: 'Bibliothèque',
  gallery: 'Galerie',
};

export default function MediaPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listMedia();
      setItems(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((item) => {
    if (filter !== 'all' && item.source !== filter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return item.name?.toLowerCase().includes(q) || item.url?.toLowerCase().includes(q);
  });

  const onUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const uploaded = await api.uploadFile(file);
        setItems((prev) => [{ url: uploaded.url, name: uploaded.name, source: 'upload' }, ...prev]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      setError('Impossible de copier l’URL.');
    }
  };

  return (
    <>
      <PageHeader
        title="Bibliothèque médias"
        subtitle="Images uploadées, bibliothèque statique et références galerie"
      />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="media-page-toolbar">
        <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Envoi…' : 'Importer des images'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onUpload} />

        <input
          type="search"
          className="media-page-search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filters">
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            Tous ({items.length})
          </button>
          {Object.entries(SOURCE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={filter === key ? 'active' : ''}
              onClick={() => setFilter(key)}
            >
              {label} ({items.filter((i) => i.source === key).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="empty">Aucune image trouvée.</p>
      ) : (
        <div className="media-page-grid">
          {filtered.map((item) => (
            <article key={item.url} className="media-page-card">
              <div className="media-page-card__img">
                <img src={resolveMediaUrl(item.url)} alt={item.name || item.url} loading="lazy" />
              </div>
              <div className="media-page-card__body">
                <span className="media-page-card__source">{SOURCE_LABELS[item.source] || item.source}</span>
                <strong title={item.name}>{item.name || item.url}</strong>
                <code className="media-page-card__url">{item.url}</code>
                <div className="media-page-card__actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => copyUrl(item.url)}>
                    {copied === item.url ? 'Copié !' : 'Copier URL'}
                  </button>
                  <a
                    className="btn btn-secondary btn-sm"
                    href={resolveMediaUrl(item.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
