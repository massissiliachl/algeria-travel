import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PageHeader } from '../components/ui';

const STATUS_LABELS = {
  pending: 'En attente',
  reviewed: 'En cours',
  confirmed: 'Confirmée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

export default function PartnerReservationsPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getReservations()
      .then((data) => setItems(data.reservations || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Réservations"
        subtitle="Demandes de clients via Algeria Travel — Algeria Travel valide et vous informe."
      />

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="partner-res-grid">
          <div className="panel partner-res-list">
            {items.length === 0 ? (
              <p className="partner-res-empty">Aucune demande pour le moment.</p>
            ) : (
              items.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`partner-res-item${selected?.id === r.id ? ' is-active' : ''}`}
                  onClick={() => setSelected(r)}
                >
                  <strong>{r.clientName}</strong>
                  <span>{formatDate(r.checkInDate || r.travelDate)} · {STATUS_LABELS[r.status]}</span>
                  <span>{r.referenceCode}</span>
                </button>
              ))
            )}
          </div>

          {selected && (
            <div className="panel partner-res-detail">
              <p className="partner-notif__source">
                Demande via <strong>Algeria Travel</strong>
              </p>
              <h3>{selected.clientName}</h3>
              <dl className="partner-res-dl">
                <div><dt>Référence</dt><dd>{selected.referenceCode}</dd></div>
                <div><dt>Email</dt><dd>{selected.clientEmail}</dd></div>
                <div><dt>Téléphone</dt><dd>{selected.clientPhone || '—'}</dd></div>
                <div><dt>Arrivée</dt><dd>{formatDate(selected.checkInDate || selected.travelDate)}</dd></div>
                {selected.checkOutDate && (
                  <div><dt>Départ</dt><dd>{formatDate(selected.checkOutDate)}</dd></div>
                )}
                {selected.roomsRequested && (
                  <div><dt>Chambres</dt><dd>{selected.roomsRequested}</dd></div>
                )}
                <div><dt>Voyageurs</dt><dd>{selected.travelers}</dd></div>
                <div><dt>Total</dt><dd>{selected.priceEstimate?.toLocaleString('fr-DZ')} DA</dd></div>
                <div><dt>Statut</dt><dd>{STATUS_LABELS[selected.status]}</dd></div>
                {selected.message && (
                  <div className="full"><dt>Message client</dt><dd>{selected.message}</dd></div>
                )}
              </dl>
            </div>
          )}
        </div>
      )}
    </>
  );
}
