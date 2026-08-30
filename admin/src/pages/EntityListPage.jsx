import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { ENTITIES } from '../config/entities';
import { PageHeader } from '../components/ui';
import HotelPartnerModal from '../components/HotelPartnerModal';

export default function EntityListPage() {
  const { entityKey } = useParams();
  const config = ENTITIES[entityKey];
  const [items, setItems] = useState([]);
  const [partnerByHotel, setPartnerByHotel] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const isHotels = entityKey === 'hotels';

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    Promise.all([
      api.list(config.resource),
      isHotels ? api.listHotelUsers().catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    ])
      .then(([listRes, usersRes]) => {
        setItems(listRes.items || []);
        if (isHotels) {
          const map = {};
          (usersRes.items || []).forEach((u) => {
            map[u.hotelId] = u;
          });
          setPartnerByHotel(map);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [config, entityKey, isHotels]);

  const onDelete = async (id) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    try {
      await api.remove(config.resource, id);
      setItems((prev) => prev.filter((i) => String(i[config.idField]) !== String(id)));
    } catch (e) {
      setError(e.message);
    }
  };

  const onPartnerSaved = (account) => {
    if (account?.hotelId) {
      setPartnerByHotel((prev) => ({ ...prev, [account.hotelId]: account }));
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
                {isHotels && <th>Compte /partner</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const id = row[config.idField];
                const partner = partnerByHotel[id];
                return (
                  <tr key={id}>
                    {config.columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                    {isHotels && (
                      <td>
                        {partner ? (
                          <span className="partner-pill partner-pill--ok" title={partner.email}>
                            ✓ {partner.email}
                          </span>
                        ) : (
                          <span className="partner-pill partner-pill--none">Aucun compte</span>
                        )}
                      </td>
                    )}
                    <td>
                      <div className="btn-group">
                        {isHotels && (
                          <button
                            type="button"
                            className="btn btn-gold btn-sm"
                            onClick={() => setModal({ id, name: row.name })}
                          >
                            {partner ? 'Gérer compte' : '+ Créer compte'}
                          </button>
                        )}
                        <Link to={`/${entityKey}/${id}`} className="btn btn-secondary btn-sm">
                          Modifier
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <HotelPartnerModal
          hotelId={modal.id}
          hotelName={modal.name}
          open
          onClose={() => setModal(null)}
          onSaved={onPartnerSaved}
        />
      )}
    </>
  );
}
