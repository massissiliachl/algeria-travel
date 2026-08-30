import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function HotelPartnerModal({ hotelId, hotelName, open, onClose, onSaved }) {
  const [account, setAccount] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open || !hotelId) return;
    setError('');
    setSuccess('');
    setPassword('');
    setLoading(true);
    api
      .getHotelUserByHotel(hotelId)
      .then((data) => {
        setAccount(data.account);
        setEmail(data.account?.email || '');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, hotelId]);

  if (!open) return null;

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const created = await api.createHotelUser({ hotelId, email: email.trim(), password });
      setAccount(created);
      setPassword('');
      setSuccess('Compte créé ! Communiquez l’email et le mot de passe à l’hôtel.');
      onSaved?.(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    if (!account || !password) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateHotelUser(account.id, { password });
      setAccount(updated);
      setPassword('');
      setSuccess('Mot de passe mis à jour.');
      onSaved?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card partner-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="partner-modal-title">
        <div className="modal-card__head">
          <div>
            <p className="modal-card__eyebrow">Compte partenaire</p>
            <h2 id="partner-modal-title">{hotelName}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <p className="modal-card__lead">
          L&apos;hôtel se connecte sur <strong>/partner</strong> pour gérer disponibilités, photos et tarifs.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <p className="empty">Chargement…</p>
        ) : !account ? (
          <form onSubmit={onCreate} className="form-grid">
            <div className="field full">
              <label>Email de connexion</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@hotel.dz"
                required
                autoFocus
              />
            </div>
            <div className="field full">
              <label>Mot de passe (min. 8 caractères)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="modal-card__actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-gold" disabled={saving}>
                {saving ? 'Création…' : 'Créer le compte'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="partner-modal__account">
              <span className="partner-modal__account-icon">✉</span>
              <div>
                <strong>{account.email}</strong>
                <span className={`badge ${account.active ? 'badge-published' : 'badge-draft'}`}>
                  {account.active ? 'Actif' : 'Désactivé'}
                </span>
              </div>
            </div>
            <form onSubmit={onResetPassword} className="form-grid" style={{ marginTop: 16 }}>
              <div className="field full">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="Saisir pour réinitialiser"
                />
              </div>
              <div className="modal-card__actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Fermer
                </button>
                <button type="submit" className="btn btn-gold" disabled={saving || !password}>
                  {saving ? 'Mise à jour…' : 'Réinitialiser le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
