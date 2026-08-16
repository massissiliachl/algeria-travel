import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { ENTITIES } from '../config/entities';
import { PageHeader } from '../components/ui';

export default function EntityListPage() {
  const { entityKey } = useParams();
  const config = ENTITIES[entityKey];
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    api
      .list(config.resource)
      .then((res) => setItems(res.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [config, entityKey]);

  const onDelete = async (id) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    try {
      await api.remove(config.resource, id);
      setItems((prev) => prev.filter((i) => String(i[config.idField]) !== String(id)));
    } catch (e) {
      setError(e.message);
    }
  };

  if (!config) return <div className="alert alert-error">Section inconnue.</div>;

  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        action={
          <Link to={`/${entityKey}/new`} className="btn btn-primary">
            + Ajouter
          </Link>
        }
      />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="panel">
        {loading ? (
          <p className="empty">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="empty">Aucun élément. Cliquez sur « Ajouter ».</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {config.columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row[config.idField]}>
                  {config.columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                  <td>
                    <div className="btn-group">
                      <Link
                        to={`/${entityKey}/${row[config.idField]}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(row[config.idField])}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
