import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandIcon } from '../components/icons';
import { resolveApiBase } from '../utils/apiBase';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    fetch(`${resolveApiBase()}/api/health`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setBackendStatus(data.database ? 'ok' : 'partial'))
      .catch(() => setBackendStatus('down'));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (backendStatus === 'down') {
        throw new Error('Backend injoignable. Lancez : cd backend puis npm run dev');
      }
      await login(key.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Clé invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-brand">
          <div className="login-brand-icon">
            <BrandIcon size={28} />
          </div>
          <h1>Administration</h1>
          <p className="login-subtitle">
            Connectez-vous avec votre clé admin pour accéder au panneau de gestion.
          </p>

          {backendStatus === 'checking' && (
            <p className="login-subtitle" style={{ marginTop: 12, fontSize: '0.82rem' }}>
              Vérification du backend…
            </p>
          )}
          {backendStatus === 'ok' && (
            <p className="login-subtitle" style={{ marginTop: 12, fontSize: '0.82rem', color: '#166534' }}>
              Backend connecté (PostgreSQL OK)
            </p>
          )}
          {backendStatus === 'down' && (
            <div className="alert alert-error" style={{ marginTop: 12, textAlign: 'left' }}>
              Backend injoignable sur le port 5000.
              <br />
              Ouvrez un terminal : <code>cd backend</code> puis <code>npm run dev</code>
            </div>
          )}

          {import.meta.env.DEV && backendStatus === 'ok' && (
            <p className="login-subtitle" style={{ marginTop: 12, fontSize: '0.82rem' }}>
              {import.meta.env.VITE_DEV_ADMIN_KEY
                ? 'Connexion auto activée (admin/.env). Redémarrez l’admin si vous venez de lancer setup:admin.'
                : 'Lancez npm run setup:admin à la racine, puis redémarrez l’admin pour connexion auto.'}
            </p>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="key">Clé admin</label>
          <input
            id="key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Coller ADMIN_API_KEY depuis backend/.env"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
          disabled={loading || backendStatus === 'down'}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
