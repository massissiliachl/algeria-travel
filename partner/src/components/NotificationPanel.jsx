import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePartnerNotificationsContext } from '../context/PartnerNotificationsContext';

const STATUS_LABELS = {
  pending: 'En attente',
  reviewed: 'En cours',
  confirmed: 'Confirmée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPrice(v) {
  if (!v) return '—';
  return `${Number(v).toLocaleString('fr-DZ')} DA`;
}

export default function NotificationPanel({ open, onClose }) {
  const ref = useRef(null);
  const { notifications, unreadCount, loading, markRead, markAllRead } = usePartnerNotificationsContext();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, onClose]);

  if (!open) return null;

  const active = selected
    ? notifications.find((n) => n.id === selected)
    : notifications.find((n) => !n.readAt) || notifications[0];

  const res = active?.reservation;

  const openDetail = (n) => {
    setSelected(n.id);
    if (!n.readAt) markRead(n.id);
  };

  return (
    <div className="partner-notif" ref={ref}>
      <header className="partner-notif__head">
        <div>
          <strong>Notifications</strong>
          {unreadCount > 0 && <span className="partner-notif__badge">{unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}</span>}
        </div>
        {unreadCount > 0 && (
          <button type="button" className="partner-notif__mark-all" onClick={markAllRead}>
            Tout marquer lu
          </button>
        )}
      </header>

      <div className="partner-notif__body">
        <ul className="partner-notif__list">
          {loading && <li className="partner-notif__empty">Chargement…</li>}
          {!loading && notifications.length === 0 && (
            <li className="partner-notif__empty">Aucune demande pour le moment.</li>
          )}
          {notifications.map((n) => {
            const r = n.reservation;
            const isUnread = !n.readAt;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  className={`partner-notif__item${isUnread ? ' is-unread' : ''}${selected === n.id ? ' is-active' : ''}`}
                  onClick={() => openDetail(n)}
                >
                  <span className="partner-notif__item-icon">📩</span>
                  <span>
                    <strong>Nouvelle demande — {r.clientName}</strong>
                    <small>
                      {formatDate(r.checkInDate || r.travelDate)}
                      {r.checkOutDate ? ` → ${formatDate(r.checkOutDate)}` : ''}
                      · {formatPrice(r.priceEstimate)}
                    </small>
                  </span>
                  {isUnread && <i className="partner-notif__dot" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>

        {res && (
          <div className="partner-notif__detail">
            <p className="partner-notif__source">
              Demande reçue via <strong>Algeria Travel</strong>
            </p>
            <h4>{res.clientName}</h4>
            <dl>
              <div><dt>Référence</dt><dd>{res.referenceCode || '—'}</dd></div>
              <div><dt>Email</dt><dd>{res.clientEmail}</dd></div>
              <div><dt>Téléphone</dt><dd>{res.clientPhone || '—'}</dd></div>
              <div><dt>Arrivée</dt><dd>{formatDate(res.checkInDate || res.travelDate)}</dd></div>
              {res.checkOutDate && (
                <div><dt>Départ</dt><dd>{formatDate(res.checkOutDate)}</dd></div>
              )}
              {res.roomsRequested && (
                <div><dt>Chambres</dt><dd>{res.roomsRequested}</dd></div>
              )}
              <div><dt>Voyageurs</dt><dd>{res.travelers}</dd></div>
              <div><dt>Total estimé</dt><dd>{formatPrice(res.priceEstimate)}</dd></div>
              <div><dt>Statut</dt><dd>{STATUS_LABELS[res.status] || res.status}</dd></div>
              {res.message && (
                <div className="full"><dt>Message</dt><dd>{res.message}</dd></div>
              )}
            </dl>
            <Link to="/reservations" className="btn btn-secondary btn-sm" onClick={onClose}>
              Voir toutes les réservations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
