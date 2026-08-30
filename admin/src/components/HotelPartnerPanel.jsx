import React, { useState } from 'react';
import { api } from '../api';
import HotelPartnerModal from './HotelPartnerModal';

export default function HotelPartnerPanel({ hotelId, hotelName }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getHotelUserByHotel(hotelId)
      .then((data) => setAccount(data.account))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    if (hotelId) load();
  }, [hotelId]);

  return (
    <>
      <div className="panel partner-admin-banner">
        <div className="partner-admin-banner__icon">🏨</div>
        <div className="partner-admin-banner__body">
          <h3>Compte partenaire — Portail /partner</h3>
          <p>
            Créez un email et mot de passe pour que l&apos;hôtel gère son planning, ses photos et ses tarifs.
          </p>
          {loading ? (
            <p className="field-hint">Chargement…</p>
          ) : account ? (
            <p>
              <strong>{account.email}</strong>{' '}
              <span className={`badge ${account.active ? 'badge-published' : 'badge-draft'}`}>
                {account.active ? 'Actif' : 'Désactivé'}
              </span>
            </p>
          ) : (
            <p className="partner-admin-banner__warn">Aucun compte — l&apos;hôtel ne peut pas se connecter.</p>
          )}
        </div>
        <button type="button" className="btn btn-gold" onClick={() => setModalOpen(true)}>
          {account ? 'Gérer le compte' : '+ Créer un compte partenaire'}
        </button>
      </div>

      <HotelPartnerModal
        hotelId={hotelId}
        hotelName={hotelName || 'Hôtel'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(acc) => {
          setAccount(acc);
          setModalOpen(false);
        }}
      />
    </>
  );
}
